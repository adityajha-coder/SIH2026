import mongoose from "mongoose";

const scoreEntrySchema = new mongoose.Schema({
    criterionName: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
        min: 0,
    },
    maxScore: {
        type: Number,
        required: true,
        min: 1,
    },
    comment: {
        type: String,
        trim: true,
        default: "",
    },
}, { _id: false });

const evaluationResponseSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "evaluation_assignments",
        required: true,
        unique: true, // one response per assignment
        index: true,
    },
    evaluatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "submissions",
        required: true,
        index: true,
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "evaluation_templates",
        required: true,
    },
    scores: {
        type: [scoreEntrySchema],
        validate: {
            validator: (v) => v.length >= 1,
            message: "At least one score entry is required",
        },
    },
    totalScore: {
        type: Number,
        required: true,
        min: 0,
    },
    weightedScore: {
        type: Number,
        required: true,
        min: 0,
    },
    overallComment: {
        type: String,
        trim: true,
        default: "",
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const evaluationResponseModel = mongoose.model("evaluation_responses", evaluationResponseSchema);

export default evaluationResponseModel;
