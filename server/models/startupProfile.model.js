import mongoose from "mongoose";

export const STARTUP_STAGES = Object.freeze({
    IDEA: "IDEA",
    PROTOTYPE: "PROTOTYPE",
    MVP: "MVP",
    EARLY_TRACTION: "EARLY_TRACTION",
    SCALING: "SCALING",
});

const startupProfileSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: true,
        unique: true, // one startup profile per organization
        index: true,
    },
    sectors: {
        type: [String],
        default: [],
        index: true, // Index
    },
    solutionTags: {
        type: [String],
        default: [],
        index: true,
    },
    stage: {
        type: String,
        enum: Object.values(STARTUP_STAGES),
        default: STARTUP_STAGES.IDEA,
        index: true,
    },
    capabilities: {
        type: [String],
        default: [],
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
    teamSize: {
        type: Number,
        min: 1,
        default: 1,
    },
    dpiitRecognitionNumber: {
        type: String,
        trim: true,
        default: null,
        sparse: true,
    },
    evidenceRefs: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

const startupProfileModel = mongoose.model("startup_profiles", startupProfileSchema);

export default startupProfileModel;
