import { describe, it, expect } from "vitest";
import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
} from "../server/validators/auth.validator.js";
import { ROLES } from "../server/constants/role.constant.js";

describe("Authentication & Identity Validators", () => {
    describe("registerSchema (User Registration Security)", () => {
        const validPayload = {
            userName: "aditya_coder",
            email: "aditya@innovate.gov.in",
            password: "StrongPassword@123",
            role: ROLES.STARTUP_USER,
        };

        it("should accept valid registration details", () => {
            const result = registerSchema.safeParse(validPayload);
            expect(result.success).toBe(true);
        });

        it("should reject passwords that lack a special character", () => {
            const payload = { ...validPayload, password: "NoSpecialChar123" };
            const result = registerSchema.safeParse(payload);
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain("special character");
        });

        it("should reject passwords that lack an uppercase letter", () => {
            const payload = { ...validPayload, password: "lowercase@123" };
            const result = registerSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });

        it("should reject passwords shorter than 8 characters", () => {
            const payload = { ...validPayload, password: "Sh@1" };
            const result = registerSchema.safeParse(payload);
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain("at least 8 characters");
        });

        it("should reject usernames containing invalid characters or spaces", () => {
            const payload = { ...validPayload, userName: "bad user!name" };
            const result = registerSchema.safeParse(payload);
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain("letters, numbers, and underscores");
        });

        it("should reject usernames shorter than 3 characters", () => {
            const payload = { ...validPayload, userName: "ab" };
            const result = registerSchema.safeParse(payload);
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain("at least 3 characters");
        });

        it("should reject invalid email formats", () => {
            const payload = { ...validPayload, email: "not-an-email-address" };
            const result = registerSchema.safeParse(payload);
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toContain("Invalid email");
        });

        it("should default role to STARTUP_USER if not provided", () => {
            const { role, ...withoutRole } = validPayload;
            const result = registerSchema.safeParse(withoutRole);
            expect(result.success).toBe(true);
            expect(result.data.role).toBe(ROLES.STARTUP_USER);
        });
    });

    describe("loginSchema", () => {
        it("should validate well-formed login credentials", () => {
            const result = loginSchema.safeParse({
                email: "officer@pune.gov.in",
                password: "AnyPasswordString",
            });
            expect(result.success).toBe(true);
        });

        it("should reject empty password", () => {
            const result = loginSchema.safeParse({
                email: "officer@pune.gov.in",
                password: "",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("verifyEmailSchema (OTP Security)", () => {
        it("should accept valid 6-digit numeric OTPs", () => {
            const result = verifyEmailSchema.safeParse({
                email: "user@domain.com",
                otp: "849201",
            });
            expect(result.success).toBe(true);
        });

        it("should reject OTPs that are not exactly 6 characters", () => {
            const shortResult = verifyEmailSchema.safeParse({
                email: "user@domain.com",
                otp: "1234",
            });
            expect(shortResult.success).toBe(false);

            const longResult = verifyEmailSchema.safeParse({
                email: "user@domain.com",
                otp: "12345678",
            });
            expect(longResult.success).toBe(false);
        });
    });
});
