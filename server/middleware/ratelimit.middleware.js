import rateLimit from "express-rate-limit";

// rate limiter for login (max attempts per 15 minutes)
export const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        message: "Too many login attempts. Please try again after 1 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// rate limiter for register (max 5 registrations per hour)
export const registerLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 mint (will be change later)
    max: 5,
    message: {
        message: "Too many accounts created, please try again after an hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// rate limiter for otp verification (max 3 attempts per 10 minutes)
export const otpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes (change later)
    max: 3,
    message: {
        message: "Too many otp verification attempts, please request new otp or try again in 10 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for Password Reset requests (Max 3 requests per hour)
export const passwordResetLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 mint (will be change later)
    max: 3,
    message: {
        message: "Too many password reset requests. Please try again after an hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
