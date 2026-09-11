import mongoose from "mongoose";

export const ENTITY_TYPES = Object.freeze({
    SUBMISSION: "SUBMISSION",
    ORGANIZATION: "ORGANIZATION",
    PROBLEM: "PROBLEM",
    OTHER: "OTHER",
});

export const EVIDENCE_STATUS = Object.freeze({
    PENDING_UPLOAD: "PENDING_UPLOAD",
    UPLOADED: "UPLOADED",
    VERIFIED: "VERIFIED",
    REJECTED: "REJECTED",
});

const evidenceSchema = new mongoose.Schema(
    {
        fileKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        fileName: {
            type: String,
            required: true,
            trim: true,
        },
        mimeType: {
            type: String,
            required: true,
            trim: true,
        },
        sizeBytes: {
            type: Number,
            required: true,
            min: 1,
        },
        checksumSHA256: {
            type: String,
            default: null,
            trim: true,
        },
        uploadedById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        entityType: {
            type: String,
            enum: Object.values(ENTITY_TYPES),
            required: true,
            index: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(EVIDENCE_STATUS),
            default: EVIDENCE_STATUS.PENDING_UPLOAD,
            index: true,
        },
        verificationNote: {
            type: String,
            default: null,
        },
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Compound index
evidenceSchema.index({ entityType: 1, entityId: 1, status: 1 });

export const Evidence = mongoose.model("Evidence", evidenceSchema);
export default Evidence;
