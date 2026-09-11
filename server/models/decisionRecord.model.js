import mongoose from "mongoose";

export const DECISION_OUTCOME = Object.freeze({
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
});

const decisionRecordSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "submissions",
        required: true,
        unique: true, // one decision per submission
        index: true,
    },
    outcome: {
        type: String,
        enum: Object.values(DECISION_OUTCOME),
        required: [true, "Decision outcome is required"],
    },
    aggregateScore: {
        type: Number,
        default: null,
    },
    rationale: {
        type: String,
        required: [true, "Decision rationale is required"],
        trim: true,
    },
    decidedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    evaluationResponseIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "evaluation_responses",
    }],
    decidedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const decisionRecordModel = mongoose.model("decision_records", decisionRecordSchema);

export default decisionRecordModel;
