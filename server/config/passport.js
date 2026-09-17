import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";
import config from "./config.js";

const backendCandidates = (process.env.BACKEND_URL || "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";
const backendUrl = isProduction
    ? (backendCandidates.find((u) => !u.includes("localhost")) || backendCandidates[0] || "https://sih2026-opgc.onrender.com")
    : (backendCandidates.find((u) => u.includes("localhost")) || "http://localhost:3001");

// 1. Google OAuth
if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                callbackURL: `${backendUrl}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const googleId = profile.id;
                    const avatar = profile.photos?.[0]?.value;
                    const baseUserName = profile.displayName || (email ? email.split("@")[0] : "GoogleUser");
                    const emailNormalized = email ? email.trim().toLowerCase() : undefined;

                    // Find by googleId or existing email
                    let user = await userModel.findOne({
                        $or: [
                            { googleId },
                            ...(emailNormalized ? [{ emailNormalized }, { email }] : [{ email }])
                        ],
                    });

                    if (user) {
                        // Link googleId if user registered previously
                        let changed = false;
                        if (!user.googleId) {
                            user.googleId = googleId;
                            changed = true;
                        }
                        if (!user.avatar && avatar) {
                            user.avatar = avatar;
                            changed = true;
                        }
                        if (!user.emailNormalized && emailNormalized) {
                            user.emailNormalized = emailNormalized;
                            changed = true;
                        }
                        if (!user.verified) {
                            user.verified = true;
                            changed = true;
                        }
                        if (changed) {
                            await user.save();
                        }
                        return done(null, user);
                    }

                    user = await userModel.create({
                        userName: baseUserName,
                        email,
                        emailNormalized,
                        googleId,
                        avatar,
                        authProvider: "google",
                        verified: true,
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}


export default passport;
