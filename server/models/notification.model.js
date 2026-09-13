import mongoose from "mongoose";

export const NOTIFICATION_TYPES = Object.freeze({
    PROBLEM_PUBLISHED: "PROBLEM_PUBLISHED",
    SUBMISSION_RECEIVED: "SUBMISSION_RECEIVED",
    SUBMISSION_STATUS_CHANGED: "SUBMISSION_STATUS_CHANGED",
    CLARIFICATION_REQUESTED: "CLARIFICATION_REQUESTED",
    EVALUATION_ASSIGNED: "EVALUATION_ASSIGNED",
    DECISION_RELEASED: "DECISION_RELEASED",
    EVIDENCE_UPLOADED: "EVIDENCE_UPLOADED",
    SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
});

const notificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPES),
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        context: {
            entityType: {
                type: String,
                enum: ["PROBLEM", "SUBMISSION", "EVALUATION", "EVIDENCE", "ORGANIZATION", "SYSTEM"],
            },
            entityId: {
                type: mongoose.Schema.Types.ObjectId,
            },
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
            default: null,
        },
        emailSent: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
