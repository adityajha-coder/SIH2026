import mongoose from "mongoose";

const organizationMemberSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },
    orgRole: {
        type: String,
        enum: ["OWNER", "ADMIN", "MEMBER"],
        default: "MEMBER",
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INVITED", "REVOKED"],
        default: "ACTIVE",
    },
}, { timestamps: true });

// Prevent duplicate membership for the same user in the same organization
organizationMemberSchema.index({ 
    organizationId: 1,
    userId: 1
    }, 
    {
        unique: true 
    }
);

const organizationMemberModel = mongoose.model("organization_members", organizationMemberSchema);

export default organizationMemberModel;
