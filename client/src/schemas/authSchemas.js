import { z } from "zod";

export const USER_ROLES = Object.freeze({
  STARTUP_USER: "STARTUP_USER",
  GOVERNMENT_USER: "GOVERNMENT_USER",
  EVALUATOR: "EVALUATOR",
  ADMIN: "ADMIN",
});

export const ORGANIZATION_TYPES = Object.freeze({
  STARTUP: "STARTUP",
  GOVERNMENT_DEPT: "GOVERNMENT_DEPT",
  AGENCY: "AGENCY",
});

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username cannot exceed 15 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      passwordRegex,
      "Use uppercase, lowercase, number, and special character (@$!%*?&)"
    ),
  role: z
    .enum([
      USER_ROLES.STARTUP_USER,
      USER_ROLES.GOVERNMENT_USER,
      USER_ROLES.EVALUATOR,
    ])
    .default(USER_ROLES.STARTUP_USER),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  otp: z
    .string()
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    token: z.string().min(32, "Reset token is missing or malformed"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        passwordRegex,
        "Use uppercase, lowercase, number, and special character (@$!%*?&)"
      ),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(50, "Organization name cannot exceed 50 characters"),
  type: z.enum([
    ORGANIZATION_TYPES.STARTUP,
    ORGANIZATION_TYPES.GOVERNMENT_DEPT,
    ORGANIZATION_TYPES.AGENCY,
  ]),
  state: z.string().trim().optional().default(""),
  website: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\/.+\..+/.test(value), {
      message: "Enter a valid website URL starting with http:// or https://",
    }),
});

export function getPasswordChecks(password = "") {
  return [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Lowercase", met: /[a-z]/.test(password) },
    { label: "Number", met: /\d/.test(password) },
    { label: "Special", met: /[@$!%*?&]/.test(password) },
  ];
}
