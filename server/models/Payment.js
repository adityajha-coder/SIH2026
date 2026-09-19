import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    governmentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    governmentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
      default: null,
      index: true,
    },

    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "startup_profiles",
      required: true,
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      default: null,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
    },

    governmentReferenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ORDER_CREATED",
        "PROCESSING",
        "SUCCESSFUL",
        "FAILED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },

    verificationStatus: {
      type: String,
      enum: [
        "UNVERIFIED",
        "VERIFIED",
        "FAILED",
      ],
      default: "UNVERIFIED",
    },

    emailSent: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    metadata: {
      department: String,
      projectName: String,
      startupName: String,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({
  startup: 1,
  createdAt: -1,
});

paymentSchema.index({
  governmentUser: 1,
  createdAt: -1,
});

export default mongoose.model("Payment", paymentSchema);