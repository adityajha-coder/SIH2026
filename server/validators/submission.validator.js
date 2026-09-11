import { z } from "zod";
import { SUBMISSION_STATUS } from "../models/submission.model.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createSubmissionSchema = z.object({
    problemId: z
        .string({ required_error: "Problem ID is required" })
        .regex(objectIdRegex, "Invalid problem ID"),

    organizationId: z
        .string({ required_error: "Organization ID is required" })
        .regex(objectIdRegex, "Invalid organization ID"),

    solutionTitle: z
        .string({ required_error: "Solution title is required" })
        .trim()
        .min(5, "Solution title must be at least 5 characters")
        .max(200, "Solution title cannot exceed 200 characters"),

    executiveSummary: z
        .string({ required_error: "Executive summary is required" })
        .trim()
        .min(10, "Executive summary must be at least 10 characters")
        .max(500, "Executive summary cannot exceed 500 characters"),

    proposalDetails: z
        .string({ required_error: "Proposal details are required" })
        .trim()
        .min(20, "Proposal details must be at least 20 characters"),

    evidenceFileIds: z.array(z.string().trim()).optional().default([]),
});

export const transitionSubmissionSchema = z.object({
    toStatus: z.enum(Object.values(SUBMISSION_STATUS), {
        required_error: "Target status is required",
        invalid_type_error: "Invalid target status",
    }),
    note: z.string().trim().max(1000).optional().default(""),
});

export const listSubmissionsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    problemId: z.string().regex(objectIdRegex, "Invalid problem ID").optional(),
    status: z.enum(Object.values(SUBMISSION_STATUS)).optional(),
});
