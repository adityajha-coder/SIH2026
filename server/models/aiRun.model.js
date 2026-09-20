import mongoose from "mongoose";

export const AI_VERDICTS = Object.freeze({
    PASS: "PASS",
    PASS_WITH_FLAGS: "PASS_WITH_FLAGS",
    FAIL: "FAIL",
    UNKNOWN: "UNKNOWN",
});

export const AI_RUN_STATUS = Object.freeze({
    QUEUED: "QUEUED",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
});

const aiRunSchema = new mongoose.Schema(
    {
        task: {
            type: String,
            required: true,
            trim: true,
        },
        userInputHash: {
            type: String,
            required: true,
            index: true,
        },
        promptVersion: {
            type: String,
            default: "1.0",
        },
        status: {
            type: String,
            enum: Object.values(AI_RUN_STATUS),
            default: AI_RUN_STATUS.COMPLETED,
            index: true,
        },
        verdict: {
            type: String,
            enum: Object.values(AI_VERDICTS),
            default: AI_VERDICTS.UNKNOWN,
            index: true,
        },
        requestedById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        entityType: {
            type: String,
            enum: ["SUBMISSION", "PROBLEM", "ORGANIZATION", "MATCH"],
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        generatorResult: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        verifierResult: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        auditorResult: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        result: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        errorMessage: {
            type: String,
            default: null,
        },
        disagreements: {
            type: [String],
            default: [],
        },
        totalLatencyMs: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const AIRun = mongoose.model("AIRun", aiRunSchema);
export default AIRun;
