import mongoose from "mongoose";

const emailNotificationSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      default: "PAYMENT_VERIFIED",
      index: true,
    },
    toEmail: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

emailNotificationSchema.index({ paymentId: 1, eventType: 1 }, { unique: true, sparse: true });

export default mongoose.model("EmailNotification", emailNotificationSchema);
