import mongoose from "mongoose";

export const PROBLEM_STATUS = Object.freeze({
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ACCEPTING: "ACCEPTING",
    UNDER_REVIEW: "UNDER_REVIEW",
    PILOTING: "PILOTING",
    CLOSED: "CLOSED",
    ARCHIVED: "ARCHIVED",
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Problem title is required"],
        trim: true,
        index: true,
    },
    shortSummary: {
        type: String,
        required: [true, "Short summary is required"],
        trim: true,
        maxlength: 2000,
    },
    fullStatement: {
        type: String,
        required: [true, "Full problem statement is required"],
        trim: true,
    },

    // 2. Ownership & Authority
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: true,
        index: true,
    },
    createdById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },

    //  Requirements 
    mandatoryRequirements: {
        type: [String],
        default: [],
    },
    preferredRequirements: {
        type: [String],
        default: [],
    },
    constraints: {
        type: [String],
        default: [],
    },

    sectors: {
        type: [String],
        default: [],
        index: true,
    },
    geography: {
        state: {
            type: String,
            trim: true,
            default: "",
        },
        districts: {
            type: [String],
            default: [],
        },
    },
    eligibleApplicantTypes: {
        type: [String],
        enum: ["STARTUP", "MSME", "INDIVIDUAL_INNOVATOR"],
        default: ["STARTUP"],
    },
    procurementPath: {
        type: String,
        enum: ["DIRECT_PILOT", "CHALLENGE_PROCUREMENT", "RESEARCH_GRANT", "SCALE_UP"],
        default: "DIRECT_PILOT",
    },

    status: {
        type: String,
        enum: Object.values(PROBLEM_STATUS),
        default: PROBLEM_STATUS.DRAFT,
        index: true,
    },

    // Application Window & Timeline
    publishedAt: {
        type: Date,
        default: null,
    },
    applicationOpenAt: {
        type: Date,
        default: null,
    },
    applicationCloseAt: {
        type: Date,
        default: null,
    },

    // evidence & refrence
    sourceUrls: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

// Compound text index for search queries
problemSchema.index({ title: "text", shortSummary: "text", fullStatement: "text" });

const problemModel = mongoose.model("problems", problemSchema);

export default problemModel;
