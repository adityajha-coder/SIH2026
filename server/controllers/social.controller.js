import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { hashSHA256 } from "../utils/crypto.utils.js";


export async function handleSocialCallback(req, res) {
    const user = req.user;
    const host = req.headers.host || "";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1") || process.env.NODE_ENV !== "production";
    const candidates = (process.env.FRONTEND_URL || "")
        .split(",")
        .map((s) => s.trim().replace(/\/+$/, ""))
        .filter(Boolean);

    const frontendUrl = isLocalhost
        ? (candidates.find((u) => u.includes("localhost")) || "http://localhost:5173")
        : (candidates.find((u) => !u.includes("localhost")) || candidates[0] || "http://localhost:5173");

    if (!user) {
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }

    // 1. Issue Refresh Token (7 days)
    const refreshToken = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const refreshTokenHash = hashSHA256(refreshToken);

    // 2. Create Session
    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    // 3. Issue Access Token (15m)
    const accessToken = jwt.sign(
        { id: user._id, sessionId: session._id, role: user.role },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    // 4. Set httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Redirect user to frontend dashboard with accessToken
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
}
