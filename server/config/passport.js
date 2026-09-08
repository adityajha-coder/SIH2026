import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";
import config from "./config.js";

// 1. Google OAuth
if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.BACKEND_URL || "http://localhost:3001"}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const googleId = profile.id;
                    const avatar = profile.photos?.[0]?.value;
                    const baseUserName = profile.displayName || email.split("@")[0];

                    // Find by googleId or existing email
                    let user = await userModel.findOne({
                        $or: [
                            { googleId }, { email }
                        ],
                    });

                    if (user) {
                        // Link googleId if user registered previously
                        if (!user.googleId) {
                            user.googleId = googleId;
                            user.avatar = user.avatar || avatar;
                            user.verified = true; 
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Ensure unique username if collision exists
                    let userName = baseUserName;
                    const existingUserWithUsername = await userModel.findOne({ userName });
                    if (existingUserWithUsername) {
                        userName = `${baseUserName}_${Math.floor(1000 + Math.random() * 9000)}`;
                    }

                    user = await userModel.create({
                        userName,
                        email,
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
