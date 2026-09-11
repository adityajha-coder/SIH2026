import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Organization name is required"],
        trim: true,
        index: true,
    },
    type: {
        type: String,
        enum: ["STARTUP", "GOVERNMENT_DEPT", "AGENCY"],
        required: [true, "Organization type is required"],
        index: true,
    },
    state: {
        type: String,
        trim: true,
        default: "",
    },
    website: {
        type: String,
        trim: true,
        default: "",
    },
    verificationStatus: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REJECTED"],
        default: "PENDING",
        index: true,
    },
    createdById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
}, { timestamps: true });

const organizationModel = mongoose.model("organizations", organizationSchema);

export default organizationModel;
