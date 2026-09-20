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
    grantAmount: {
        type: Number,
        default: 2500000,
    },
    paymentDescription: {
        type: String,
        trim: true,
        default: "Three-phase milestone disbursement via Maharashtra Sovereign Treasury Escrow (PFMS) under Rule 173(i) GFR 2017.",
    },
    tranches: [{
        trancheId: { type: String, required: true },
        name: { type: String, required: true },
        percentage: { type: Number, required: true },
        amount: { type: Number, required: true },
        deliverable: { type: String, required: true },
    }],
    planDetails: {
        type: String,
        trim: true,
        default: "",
    },
    durationDays: {
        type: Number,
        default: 90,
    },
    planDocumentUrl: {
        type: String,
        default: "",
    },
    planDocumentName: {
        type: String,
        default: "",
    },
    planDocumentHash: {
        type: String,
        default: "",
    },
    startupResponse: {
        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED"],
            default: "PENDING",
        },
        respondedAt: {
            type: Date,
            default: null,
        },
        rejectionReason: {
            type: String,
            default: "",
        },
    },
}, { timestamps: true });

const decisionRecordModel = mongoose.model("decision_records", decisionRecordSchema);

export default decisionRecordModel;
