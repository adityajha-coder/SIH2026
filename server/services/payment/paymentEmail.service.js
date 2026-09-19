import Payment from "../../models/Payment.js";
import User from "../../models/user.model.js";
import EmailNotification from "../../models/EmailNotification.js";
import { sendEmail } from "../email.service.js";
import { PAYMENT_EVENT_TYPES } from "../../constants/payment.constants.js";

export async function sendPaymentConfirmationEmail(payment) {
  try {
    if (!payment || !payment._id) return null;

    const existing = await EmailNotification.findOne({
      paymentId: payment._id,
      eventType: PAYMENT_EVENT_TYPES.PAYMENT_VERIFIED,
    }).lean();

    if (existing?.status === "SENT") {
      return existing;
    }

    const startupUser = await User.findById(payment.startup).select("email userName").lean();
    const paymentAmount = Number(payment.amount || 0);
    const transactionRef = payment.governmentReferenceId || "N/A";

    if (!startupUser?.email) {
      return null;
    }

    const subject = "Payment received – Pragati-GovX";
    const text = `Payment received for ${payment.metadata?.projectName || "project"}. Department: ${payment.metadata?.department || "Government Department"}. Startup: ${payment.metadata?.startupName || startupUser.userName || "Startup"}. Amount: ₹${paymentAmount.toLocaleString("en-IN")}. Transaction: ${transactionRef}. Payment ID: ${payment.razorpayPaymentId || "N/A"}. Status: ${payment.status}. Verification: ${payment.verificationStatus}.`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:28px;color:#10233F;">
        <h2 style="margin:0 0 16px;">Payment received</h2>
        <p>We have successfully received the payment for your startup milestone.</p>
        <ul style="padding-left:18px;line-height:1.8;">
          <li><strong>Government Department:</strong> ${payment.metadata?.department || "Government Department"}</li>
          <li><strong>Startup:</strong> ${payment.metadata?.startupName || startupUser.userName || "Startup"}</li>
          <li><strong>Project:</strong> ${payment.metadata?.projectName || "Digital Service Project"}</li>
          <li><strong>Amount:</strong> ₹${paymentAmount.toLocaleString("en-IN")}</li>
          <li><strong>Transaction Reference:</strong> ${transactionRef}</li>
          <li><strong>Payment ID:</strong> ${payment.razorpayPaymentId || "N/A"}</li>
          <li><strong>Payment Status:</strong> ${payment.status}</li>
          <li><strong>Verification Status:</strong> ${payment.verificationStatus}</li>
        </ul>
        <p style="margin-top:18px;">Thank you for using Pragati-GovX.</p>
      </div>
    `;

    await sendEmail(startupUser.email, subject, text, html);

    const result = await EmailNotification.findOneAndUpdate(
      { paymentId: payment._id, eventType: PAYMENT_EVENT_TYPES.PAYMENT_VERIFIED },
      {
        paymentId: payment._id,
        eventType: PAYMENT_EVENT_TYPES.PAYMENT_VERIFIED,
        toEmail: startupUser.email,
        status: "SENT",
        metadata: {
          governmentDepartment: payment.metadata?.department || "Government Department",
          startupName: payment.metadata?.startupName || startupUser.userName,
          projectName: payment.metadata?.projectName || "Digital Service Project",
          amount: payment.amount,
          governmentReferenceId: transactionRef,
          razorpayPaymentId: payment.razorpayPaymentId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return result;
  } catch (err) {
    console.error("Failed to send payment confirmation email", err.message);
    return null;
  }
}
