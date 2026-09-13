import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOTP, hashSHA256 } from "../utils/crypto.utils.js";
import { getOTPHtml } from "../emails/otp.template.js";
import { ROLES } from "../constants/role.constant.js";


export async function register(req, res) {
    const { userName, email, password, role } = req.body;
    const emailNormalized = email.toLowerCase().trim();

    const isAlreadyRegistered = await userModel.findOne({ emailNormalized });

    if (isAlreadyRegistered) {
        return res.status(409).json({
            data: null,
            meta: { traceId: req.id, timestamp: new Date().toISOString() },
            error: {
                code: "USER_EXISTS",
                message: "Email is already registered"
            }
        });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userModel.create({
        userName,
        email,
        emailNormalized,
        password: hashedPassword,
        role: role || ROLES.STARTUP_USER,
    });

    const otp = generateOTP();
    const otpHash = hashSHA256(otp);

    await otpModel.create({
        email,
        user: user._id,
        otpHash
    });

    try {
        await sendEmail(
            email,
            "OTP Verification - AuthORS",
            `Your OTP code is ${otp}`,
            getOTPHtml(otp)
        );
    } catch (emailError) {
        return res.status(500).json({
            data: null,
            meta: { traceId: req.id, timestamp: new Date().toISOString() },
            error: {
                code: "EMAIL_SEND_FAILED",
                message: "User created, but failed to send verification email. Please try logging in or requesting a new OTP."
            }
        });
    }

    return res.status(201).json({
        data: {
            message: "User registered successfully",
            user: {
                userName: user.userName,
                email: user.email,
                id: user._id,
                role: user.role,
                verified: user.verified
            }
        },
        meta: { traceId: req.id, timestamp: new Date().toISOString() },
        error: null
    });
}

export async function verifyEmail(req, res) {
    const { otp, email } = req.body;

    const otpHash = hashSHA256(otp);

    const otpDoc = await otpModel.findOne({
        email,
        otpHash
    });

    if (!otpDoc) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    const user = await userModel.findByIdAndUpdate(
        otpDoc.user,
        { 
            verified: true,
            emailVerifiedAt: new Date(),
        },
        { new: true }
    );

    await otpModel.deleteMany({
        user: otpDoc.user
    });

    return res.status(200).json({
        data: {
            message: "Email verified successfully",
            user: {
                userName: user.userName,
                email: user.email,
                id: user._id,
                role: user.role,
                verified: user.verified,
                emailVerifiedAt: user.emailVerifiedAt,
            }
        }, meta : {
            traceId: req.id, 
            timestamp: new Date().toISOString()
        },
        error: null   
    });
}
