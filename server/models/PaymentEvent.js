import mongoose from "mongoose";

const paymentEventSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      default: "SUCCESS",
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

paymentEventSchema.index({ paymentId: 1, eventType: 1 }, { unique: true });

export default mongoose.model("PaymentEvent", paymentEventSchema);
