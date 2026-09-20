import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const aiGenerateSchema = z.object({
    task: z.string({ required_error: "Task is required" }).trim().min(3),
    userInput: z.string({ required_error: "User input is required" }).trim().min(5),
    evidence: z.array(z.string()).default([]),
});

export const aiVerifySchema = z.object({
    task: z.string({ required_error: "Task is required" }).trim().min(3),
    userInput: z.string({ required_error: "User input is required" }).trim().min(5),
    evidence: z.array(z.string()).default([]),
    entityType: z.enum(["SUBMISSION", "PROBLEM", "ORGANIZATION", "MATCH"], {
        required_error: "Entity type is required",
    }),
    entityId: z
        .string({ required_error: "Entity ID is required" })
        .regex(objectIdRegex, "Invalid entity ID format"),
});

export const aiMatchSchema = z.object({
    problemId: z
        .string({ required_error: "Problem ID is required" })
        .regex(objectIdRegex, "Invalid problem ID format"),
    organizationId: z
        .string()
        .regex(objectIdRegex, "Invalid organization ID format")
        .optional(),
});

export const legalQuerySchema = z.object({
    query: z
        .string({ required_error: "Query is required" })
        .trim()
        .min(2, "Query must be at least 2 characters")
        .max(1000, "Query cannot exceed 1000 characters"),
    conversationHistory: z
        .array(
            z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().max(2000),
            })
        )
        .optional()
        .default([]),
});

