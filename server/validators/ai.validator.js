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
