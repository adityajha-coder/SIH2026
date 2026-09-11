import mongoose from "mongoose";

export const ASSIGNMENT_STATUS = Object.freeze({
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    RECUSED: "RECUSED",
});

const evaluationAssignmentSchema = new mongoose.Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "submissions",
        required: true,
        index: true,
    },
    evaluatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "evaluation_templates",
        required: true,
    },
    assignedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(ASSIGNMENT_STATUS),
        default: ASSIGNMENT_STATUS.PENDING,
        index: true,
    },
    deadline: {
        type: Date,
        required: [true, "Evaluation deadline is required"],
    },
}, { timestamps: true });

// One assignment per evaluator per submission
evaluationAssignmentSchema.index({ submissionId: 1, evaluatorId: 1 }, { unique: true });

const evaluationAssignmentModel = mongoose.model("evaluation_assignments", evaluationAssignmentSchema);

export default evaluationAssignmentModel;
