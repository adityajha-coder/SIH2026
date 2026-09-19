import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../../models/Payment.js";
import PaymentEvent from "../../models/PaymentEvent.js";
import User from "../../models/user.model.js";
import organizationModel from "../../models/organization.model.js";
import organizationMemberModel from "../../models/organizationmember.model.js";
import startupProfileModel from "../../models/startupProfile.model.js";
import { auditService } from "../audit.service.js";
import { razorpayService } from "./razorpay.service.js";
import { sendPaymentConfirmationEmail } from "./paymentEmail.service.js";
import { PAYMENT_STATUS, PAYMENT_VERIFICATION_STATUS, PAYMENT_EVENT_TYPES } from "../../constants/payment.constants.js";

export const paymentService = {
  async getPaymentForGovernment({ paymentId, governmentUserId }) {
    const payment = await Payment.findById(paymentId)
      .populate("governmentUser", "userName email role")
      .populate("startup", "organizationId sectors stage dpiitRecognitionNumber")
      .populate({ path: "startup", populate: { path: "organizationId", model: "organizations" } })
      .lean();

    if (!payment) {
      const error = new Error("Payment not found");
      error.statusCode = 404;
      error.code = "PAYMENT_NOT_FOUND";
      throw error;
    }

    const ownerId = String(payment.governmentUser?._id || payment.governmentUser || "");
    if (ownerId !== String(governmentUserId)) {
      const error = new Error("Forbidden: payment does not belong to the current government user");
      error.statusCode = 403;
      error.code = "PAYMENT_FORBIDDEN";
      throw error;
    }

    return payment;
  },

  async getPaymentForStartup({ paymentId, startupUserId }) {
    const startupOrg = await organizationMemberModel.findOne({ userId: startupUserId, status: "ACTIVE" }).lean();
    const startupProfile = await startupProfileModel.findOne({ organizationId: startupOrg?.organizationId }).lean();

    const payment = await Payment.findById(paymentId).lean();
    if (!payment) {
      const error = new Error("Payment not found");
      error.statusCode = 404;
      error.code = "PAYMENT_NOT_FOUND";
      throw error;
    }

    if (String(payment.startup) !== String(startupProfile?._id)) {
      const error = new Error("Forbidden: startup cannot view another startup payment");
      error.statusCode = 403;
      error.code = "PAYMENT_FORBIDDEN";
      throw error;
    }

    return payment;
  },

  async createDemoPaymentIfNeeded({ governmentUserId, startupUserId }) {
    const existing = await Payment.findOne({ governmentUser: governmentUserId }).lean();
    if (existing) return existing;

    const governmentOrg = await organizationModel.findOne({ createdById: governmentUserId, type: "GOVERNMENT_DEPT" }).lean();
    const startupMembership = await organizationMemberModel.findOne({ userId: startupUserId, status: "ACTIVE" }).lean();
    const startupProfile = await startupProfileModel.findOne({ organizationId: startupMembership?.organizationId }).lean();

    if (!startupProfile) {
      return null;
    }

    const payment = await Payment.create({
      governmentUser: governmentUserId,
      governmentDepartment: governmentOrg?._id || null,
      startup: startupProfile._id,
      project: null,
      amount: 50000,
      currency: "INR",
      governmentReferenceId: "GOV-STP-2026-001",
      status: PAYMENT_STATUS.PENDING,
      verificationStatus: PAYMENT_VERIFICATION_STATUS.UNVERIFIED,
      metadata: {
        department: governmentOrg?.name || "Department of XYZ",
        projectName: "Digital Service Project",
        startupName: "ABC Technologies Pvt. Ltd.",
      },
    });

    return payment;
  },

  async createPaymentOrder({ paymentId, governmentUserId, traceId }) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      const error = new Error("Payment not found");
      error.statusCode = 404;
      error.code = "PAYMENT_NOT_FOUND";
      throw error;
    }

    if (String(payment.governmentUser) !== String(governmentUserId)) {
      const error = new Error("Payment is not accessible to the current government user");
      error.statusCode = 403;
      error.code = "PAYMENT_FORBIDDEN";
      throw error;
    }

    if (payment.status === PAYMENT_STATUS.SUCCESSFUL) {
      const error = new Error("Payment already completed");
      error.statusCode = 409;
      error.code = "PAYMENT_ALREADY_COMPLETED";
      throw error;
    }

    if (payment.razorpayOrderId) {
      const error = new Error("Payment order already exists");
      error.statusCode = 409;
      error.code = "PAYMENT_ORDER_ALREADY_EXISTS";
      throw error;
    }

    const amountInPaise = Number(payment.amount || 0) * 100;
    const razorpayOrder = await razorpayService.createOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: payment.governmentReferenceId || payment._id.toString(),
      notes: {
        paymentId: payment._id.toString(),
        governmentReferenceId: payment.governmentReferenceId,
        startupId: payment.startup?.toString?.() || "",
      },
    });

    payment.razorpayOrderId = razorpayOrder.id;
    payment.status = PAYMENT_STATUS.ORDER_CREATED;
    await payment.save();

    await PaymentEvent.findOneAndUpdate(
      { paymentId: payment._id, eventType: PAYMENT_EVENT_TYPES.PAYMENT_ORDER_CREATED },
      { paymentId: payment._id, eventType: PAYMENT_EVENT_TYPES.PAYMENT_ORDER_CREATED, razorpayOrderId: razorpayOrder.id, metadata: { traceId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await auditService.logEvent({
      actorId: governmentUserId,
      actorRole: "GOVERNMENT_USER",
      action: PAYMENT_EVENT_TYPES.PAYMENT_ORDER_CREATED,
      entityType: "PAYMENT",
      entityId: payment._id.toString(),
      traceId,
      status: "SUCCESS",
      metadata: { paymentId: payment._id.toString(), razorpayOrderId: razorpayOrder.id, amount: payment.amount },
    });

    return {
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_xxxxxxxxx",
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      governmentReferenceId: payment.governmentReferenceId,
      paymentId: payment._id.toString(),
    };
  },

  async verifyPayment({ paymentId, governmentUserId, payload, traceId }) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      const error = new Error("Payment not found");
      error.statusCode = 404;
      error.code = "PAYMENT_NOT_FOUND";
      throw error;
    }

    if (String(payment.governmentUser) !== String(governmentUserId)) {
      const error = new Error("Payment does not belong to the current government user");
      error.statusCode = 403;
      error.code = "PAYMENT_FORBIDDEN";
      throw error;
    }

    if (payment.status === PAYMENT_STATUS.SUCCESSFUL && payment.verificationStatus === PAYMENT_VERIFICATION_STATUS.VERIFIED) {
      const error = new Error("Payment already completed");
      error.statusCode = 409;
      error.code = "PAYMENT_ALREADY_COMPLETED";
      throw error;
    }

    if (payload.razorpay_order_id !== payment.razorpayOrderId) {
      const error = new Error("Order mismatch");
      error.statusCode = 400;
      error.code = "ORDER_MISMATCH";
      throw error;
    }

    const isSignatureValid = razorpayService.verifySignature({
      orderId: payload.razorpay_order_id,
      paymentId: payload.razorpay_payment_id,
      signature: payload.razorpay_signature,
    });

    if (!isSignatureValid) {
      const error = new Error("Invalid Razorpay signature");
      error.statusCode = 400;
      error.code = "INVALID_SIGNATURE";
      throw error;
    }

    const paymentData = await razorpayService.fetchPayment(payload.razorpay_payment_id);
    if (!paymentData || Number(paymentData.amount) !== Number(payment.amount) * 100) {
      const error = new Error("Amount mismatch");
      error.statusCode = 400;
      error.code = "AMOUNT_MISMATCH";
      throw error;
    }

    if (paymentData.currency !== "INR" || payment.currency !== "INR") {
      const error = new Error("Currency mismatch");
      error.statusCode = 400;
      error.code = "AMOUNT_MISMATCH";
      throw error;
    }

    if (paymentData.status === "failed") {
      payment.status = PAYMENT_STATUS.FAILED;
      payment.verificationStatus = PAYMENT_VERIFICATION_STATUS.FAILED;
      payment.razorpayPaymentId = payload.razorpay_payment_id;
      await payment.save();

      await auditService.logEvent({
        actorId: governmentUserId,
        actorRole: "GOVERNMENT_USER",
        action: PAYMENT_EVENT_TYPES.PAYMENT_FAILED,
        entityType: "PAYMENT",
        entityId: payment._id.toString(),
        traceId,
        status: "FAILURE",
        metadata: { paymentId: payment._id.toString(), razorpayPaymentId: payload.razorpay_payment_id },
      });

      const error = new Error("Payment verification failed");
      error.statusCode = 400;
      error.code = "PAYMENT_VERIFICATION_FAILED";
      throw error;
    }

    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const latest = await Payment.findOne({ _id: payment._id }).session(session);
      if (latest.status === PAYMENT_STATUS.SUCCESSFUL && latest.verificationStatus === PAYMENT_VERIFICATION_STATUS.VERIFIED) {
        throw new Error("PAYMENT_ALREADY_COMPLETED");
      }

      latest.status = PAYMENT_STATUS.SUCCESSFUL;
      latest.verificationStatus = PAYMENT_VERIFICATION_STATUS.VERIFIED;
      latest.razorpayPaymentId = payload.razorpay_payment_id;
      latest.paidAt = new Date();
      latest.amount = Number(latest.amount || 0);
      await latest.save({ session });

      await PaymentEvent.findOneAndUpdate(
        { paymentId: latest._id, eventType: PAYMENT_EVENT_TYPES.PAYMENT_VERIFIED },
        { paymentId: latest._id, eventType: PAYMENT_EVENT_TYPES.PAYMENT_VERIFIED, razorpayPaymentId: payload.razorpay_payment_id, metadata: { traceId } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).session(session);

      await auditService.logEvent({
        actorId: governmentUserId,
        actorRole: "GOVERNMENT_USER",
        action: PAYMENT_EVENT_TYPES.PAYMENT_VERIFIED,
        entityType: "PAYMENT",
        entityId: latest._id.toString(),
        traceId,
        status: "SUCCESS",
        metadata: {
          paymentId: latest._id.toString(),
          governmentUser: governmentUserId,
          startup: latest.startup,
          project: latest.project,
          razorypayOrderId: latest.razorpayOrderId,
          razorpayPaymentId: payload.razorpay_payment_id,
          amount: latest.amount,
        },
      });
    });
    await session.endSession();

    const updatedPayment = await Payment.findById(paymentId).lean();
    await sendPaymentConfirmationEmail(updatedPayment);

    return {
      payment: updatedPayment,
      message: "Payment verified successfully",
    };
  },

  async listGovernmentPayments({ governmentUserId }) {
    let payments = await Payment.find({ governmentUser: governmentUserId })
      .populate("startup", "organizationId")
      .populate({ path: "startup", populate: { path: "organizationId", model: "organizations" } })
      .sort({ createdAt: -1 })
      .lean();

    if (!payments.length) {
      const govUser = await User.findById(governmentUserId).lean();
      const startupMembers = await organizationMemberModel.find({ status: "ACTIVE" }).lean();
      const startupUser = startupMembers.find((member) => member.userId && String(member.userId) !== String(governmentUserId));
      if (govUser && startupUser) {
        const created = await this.createDemoPaymentIfNeeded({ governmentUserId, startupUserId: startupUser.userId });
        if (created) {
          payments = [created];
        }
      }
    }

    return payments;
  },

  async listStartupPayments({ startupUserId }) {
    const startupOrg = await organizationMemberModel.findOne({ userId: startupUserId, status: "ACTIVE" }).lean();
    const startupProfile = await startupProfileModel.findOne({ organizationId: startupOrg?.organizationId }).lean();

    if (!startupProfile) {
      return [];
    }

    let payments = await Payment.find({ startup: startupProfile._id })
      .populate("governmentUser", "userName email role")
      .sort({ createdAt: -1 })
      .lean();

    if (!payments.length) {
      const govUser = await organizationMemberModel.findOne({ status: "ACTIVE", organizationId: { $ne: startupOrg?.organizationId } }).lean();
      if (govUser) {
        const created = await this.createDemoPaymentIfNeeded({ governmentUserId: govUser.userId, startupUserId });
        if (created) {
          payments = [created];
        }
      }
    }

    return payments;
  },

  async handleWebhook({ rawBody, signature, traceId }) {
    const isValid = razorpayService.verifyWebhookSignature({ payload: rawBody, signature, secret: process.env.RAZORPAY_WEBHOOK_SECRET });
    if (!isValid) {
      const error = new Error("Invalid Razorpay webhook signature");
      error.statusCode = 400;
      error.code = "INVALID_WEBHOOK_SIGNATURE";
      throw error;
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      const error = new Error("Invalid webhook payload");
      error.statusCode = 400;
      error.code = "INVALID_WEBHOOK_SIGNATURE";
      throw error;
    }

    const event = body?.event;
    const paymentEntity = body?.payload?.payment?.entity;
    if (!event || !paymentEntity) {
      const error = new Error("Invalid Razorpay webhook payload");
      error.statusCode = 400;
      error.code = "INVALID_WEBHOOK_SIGNATURE";
      throw error;
    }

    const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id }).exec();
    if (!payment) {
      return { acknowledged: true, ignored: true };
    }

    const idempotencyKey = `${payment._id}:${paymentEntity.id}:${event}`;
    const existing = await PaymentEvent.findOne({ paymentId: payment._id, eventType: `WEBHOOK_${event}` }).lean();
    if (existing) {
      return { acknowledged: true, ignored: true };
    }

    await PaymentEvent.create({
      paymentId: payment._id,
      eventType: `WEBHOOK_${event}`,
      razorpayPaymentId: paymentEntity.id,
      metadata: {
        event,
        traceId,
      },
    });

    if (event === "payment.captured" || event === "payment.authorized") {
      const paymentDocument = await Payment.findById(payment._id);
      if (paymentDocument.status !== PAYMENT_STATUS.SUCCESSFUL) {
        paymentDocument.status = PAYMENT_STATUS.SUCCESSFUL;
        paymentDocument.verificationStatus = PAYMENT_VERIFICATION_STATUS.VERIFIED;
        paymentDocument.razorpayPaymentId = paymentEntity.id;
        paymentDocument.paidAt = new Date();
        await paymentDocument.save();

        await auditService.logEvent({
          actorId: paymentDocument.governmentUser,
          actorRole: "GOVERNMENT_USER",
          action: PAYMENT_EVENT_TYPES.PAYMENT_WEBHOOK_RECEIVED,
          entityType: "PAYMENT",
          entityId: paymentDocument._id.toString(),
          traceId,
          status: "SUCCESS",
          metadata: { razorpayOrderId: paymentDocument.razorpayOrderId, razorpayPaymentId: paymentEntity.id },
        });

        await sendPaymentConfirmationEmail(paymentDocument);
      }
    }

    return { acknowledged: true, success: true };
  },
};
