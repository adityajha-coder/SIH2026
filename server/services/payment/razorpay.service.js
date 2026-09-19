import crypto from "crypto";
import Razorpay from "razorpay";
import config from "../../config/config.js";

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

export const razorpayService = {
  createOrder: async ({ amount, currency = "INR", receipt, notes = {} }) => {
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: String(receipt || "payment"),
      notes,
    });

    return order;
  },

  fetchOrder: async (orderId) => {
    return razorpay.orders.fetch(orderId);
  },

  fetchPayment: async (paymentId) => {
    return razorpay.payments.fetch(paymentId);
  },

  verifySignature: ({ orderId, paymentId, signature }) => {
    const generated = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generated === signature;
  },

  verifyWebhookSignature: ({ payload, signature, secret }) => {
    const expected = crypto
      .createHmac("sha256", secret || config.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    return expected === signature;
  },
};
