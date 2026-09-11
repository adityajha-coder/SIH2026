import mongoose from "mongoose";

const criterionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Criterion name is required"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
    maxScore: {
        type: Number,
        required: [true, "Max score is required"],
        min: 1,
    },
    weight: {
        type: Number,
        required: [true, "Weight is required"],
        min: 0,
        max: 1,
    },
}, { _id: false });

const evaluationTemplateSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problems",
        required: true,
        index: true,
    },
    createdById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    title: {
        type: String,
        required: [true, "Template title is required"],
        trim: true,
    },
    criteria: {
        type: [criterionSchema],
        validate: {
            validator: (v) => v.length >= 1,
            message: "At least one evaluation criterion is required",
        },
    },
    status: {
        type: String,
        enum: ["ACTIVE", "ARCHIVED"],
        default: "ACTIVE",
        index: true,
    },
}, { timestamps: true });

// One active template per problem
evaluationTemplateSchema.index({ problemId: 1, status: 1 });

const evaluationTemplateModel = mongoose.model("evaluation_templates", evaluationTemplateSchema);

export default evaluationTemplateModel;
