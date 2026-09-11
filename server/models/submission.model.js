import mongoose from "mongoose";

export const SUBMISSION_STATUS = Object.freeze({
    DRAFT: "DRAFT",
    SUBMITTED: "SUBMITTED",
    UNDER_REVIEW: "UNDER_REVIEW",
    CLARIFICATION: "CLARIFICATION",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
    WITHDRAWN: "WITHDRAWN",
    PILOT_PROPOSED: "PILOT_PROPOSED",
    PILOT_ACTIVE: "PILOT_ACTIVE",
    PILOT_COMPLETED: "PILOT_COMPLETED",
    SCALED: "SCALED",
    CLOSED: "CLOSED",
});

const transitionEntrySchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    note: { type: String, trim: true, default: "" },
    timestamp: { type: Date, default: Date.now },
}, { _id: false });

const submissionSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problems",
        required: true,
        index: true,
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: true,
        index: true,
    },
    submittedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },

    solutionTitle: {
        type: String,
        required: [true, "Solution title is required"],
        trim: true,
    },
    executiveSummary: {
        type: String,
        required: [true, "Executive summary is required"],
        trim: true,
        maxlength: 500,
    },
    proposalDetails: {
        type: String,
        required: [true, "Proposal details are required"],
        trim: true,
    },
    evidenceFileIds: {
        type: [String],
        default: [],
    },

    status: {
        type: String,
        enum: Object.values(SUBMISSION_STATUS),
        default: SUBMISSION_STATUS.DRAFT,
        index: true,
    },

    // Audit Trail
    transitionHistory: {
        type: [transitionEntrySchema],
        default: [],
    },
}, { timestamps: true });

// One active submission per org per problem
submissionSchema.index({ problemId: 1, organizationId: 1 }, { unique: true });

const submissionModel = mongoose.model("submissions", submissionSchema);

export default submissionModel;
