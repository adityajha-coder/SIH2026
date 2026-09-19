import { paymentService } from "../services/payment/payment.service.js";
import { createOrderSchema, paymentVerifySchema } from "../validators/payment.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { ROLES } from "../constants/role.constant.js";
import { auditService } from "../services/audit.service.js";
import Payment from "../models/Payment.js";
import PaymentEvent from "../models/PaymentEvent.js";
import organizationMemberModel from "../models/organizationmember.model.js";
import startupProfileModel from "../models/startupProfile.model.js";

export const paymentController = {
  createOrder: [
    requireAuth,
    requireRole(ROLES.GOVERNMENT_USER),
    validate(createOrderSchema),
    async (req, res, next) => {
      try {
        const result = await paymentService.createPaymentOrder({
          paymentId: req.body.paymentId,
          governmentUserId: req.user._id,
          traceId: req.id,
        });

        return res.status(200).json({
          data: result,
          meta: { traceId: req.id, timestamp: new Date().toISOString() },
          error: null,
        });
      } catch (error) {
        next(error);
      }
    },
  ],

  verify: [
    requireAuth,
    requireRole(ROLES.GOVERNMENT_USER),
    validate(paymentVerifySchema),
    async (req, res, next) => {
      try {
        const result = await paymentService.verifyPayment({
          paymentId: req.body.paymentId,
          governmentUserId: req.user._id,
          payload: req.body,
          traceId: req.id,
        });

        return res.status(200).json({
          data: result,
          meta: { traceId: req.id, timestamp: new Date().toISOString() },
          error: null,
        });
      } catch (error) {
        next(error);
      }
    },
  ],

  handleWebhook: async (req, res, next, injected = {}) => {
    try {
      const rawBody = injected.rawBody ?? req.body;
      const signature = injected.signature ?? req.headers["x-razorpay-signature"];
      const traceId = req.id || "webhook";

      const result = await paymentService.handleWebhook({ rawBody, signature, traceId });
      return res.status(200).json({
        data: result,
        meta: { traceId, timestamp: new Date().toISOString() },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  listGovernmentPayments: [
    requireAuth,
    requireRole(ROLES.GOVERNMENT_USER),
    async (req, res, next) => {
      try {
        const payments = await paymentService.listGovernmentPayments({ governmentUserId: req.user._id });
        return res.status(200).json({ data: payments, meta: { traceId: req.id, timestamp: new Date().toISOString() }, error: null });
      } catch (error) {
        next(error);
      }
    },
  ],

  listStartupPayments: [
    requireAuth,
    requireRole(ROLES.STARTUP_USER),
    async (req, res, next) => {
      try {
        const payments = await paymentService.listStartupPayments({ startupUserId: req.user._id });
        return res.status(200).json({ data: payments, meta: { traceId: req.id, timestamp: new Date().toISOString() }, error: null });
      } catch (error) {
        next(error);
      }
    },
  ],

  getPayment: [
    requireAuth,
    async (req, res, next) => {
      try {
        const payment = await Payment.findById(req.params.id).lean();
        if (!payment) {
          throw Object.assign(new Error("Payment not found"), { statusCode: 404, code: "PAYMENT_NOT_FOUND" });
        }

        if (req.user.role === ROLES.GOVERNMENT_USER) {
          if (String(payment.governmentUser) !== String(req.user._id)) throw Object.assign(new Error("Forbidden"), { statusCode: 403, code: "PAYMENT_FORBIDDEN" });
        }

        if (req.user.role === ROLES.STARTUP_USER) {
          const startupOrg = await organizationMemberModel.findOne({ userId: req.user._id, status: "ACTIVE" }).lean();
          const startupProfile = await startupProfileModel.findOne({ organizationId: startupOrg?.organizationId }).lean();
          if (String(payment.startup) !== String(startupProfile?._id)) throw Object.assign(new Error("Forbidden"), { statusCode: 403, code: "PAYMENT_FORBIDDEN" });
        }

        return res.status(200).json({
          data: payment,
          meta: { traceId: req.id, timestamp: new Date().toISOString() },
          error: null,
        });
      } catch (error) {
        next(error);
      }
    },
  ],
};
