import mongoose from "mongoose";
import { ROLES } from "../constants/role.constant.js";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email must be unique"],
        trim: true,
    },
    emailNormalized: {
        type: String,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === "local";
        },
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.STARTUP_USER,
        index: true,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "SUSPENDED", "PENDING"],
        default: "ACTIVE",
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    avatar: {
        type: String,
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    verified: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const userModel = mongoose.model("users", userSchema)

export default userModel;