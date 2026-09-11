import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import { hashSHA256 } from "../utils/crypto.utils.js";


export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    if (!user.verified) {
        return res.status(401).json({
            message: "Email not verified"
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const refreshToken = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const refreshTokenHash = hashSHA256(refreshToken);

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });

    const accessToken = jwt.sign(
        {
            id: user._id,
            sessionId: session._id,
            role: user.role,
        },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
        data: {
            message: "Logged in successfully",
            user: {
                userName: user.userName,
                email: user.email,
                id: user.id,
                role: user.role,
                status: user.status,
            },
            accessToken,
        },meta: {
            traceId: req.id,
            timestamp: new Date().toISOString(),
        },
        error: null,
    });
}

export async function getMe(req, res) {

    return res.status(200).json({
        data: {
            message: "User fetched successfully",
            user: {
                userName: req.user.userName,
                email: req.user.email,
                id: req.user.id,
                role: req.user.role,
                status: req.user.status,
                verified: req.user.verified,
                emailVerifiedAt: req.user.emailVerifiedAt,
            }
        }, meta: {
            traceId: req.id,
            timestamp: new Date().toISOString(),
        },
        error: null,
    });
}
