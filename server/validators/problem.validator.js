import { z } from "zod";
import { PROBLEM_STATUS } from "../models/problem.model.js";

export const createProblemSchema = z.object({
    title: z
        .string({ required_error: "Problem title is required" })
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(250, "Title cannot exceed 250 characters"),

    shortSummary: z
        .string({ required_error: "Short summary is required" })
        .trim()
        .min(5, "Summary must be at least 5 characters")
        .max(2000, "Summary cannot exceed 2000 characters"),

    fullStatement: z
        .string()
        .trim()
        .min(5, "Problem statement must be at least 5 characters")
        .optional()
        .or(z.literal("")),

    organizationId: z
        .string({ required_error: "Organization ID is required" })
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid organization ID"),

    mandatoryRequirements: z.array(z.string().trim()).optional().default([]),
    preferredRequirements: z.array(z.string().trim()).optional().default([]),
    constraints: z.array(z.string().trim()).optional().default([]),

    sectors: z.array(z.string().trim()).optional().default([]),
    geography: z.object({
        state: z.string().trim().optional().default("Maharashtra"),
        districts: z.array(z.string().trim()).optional().default([]),
    }).optional().default({ state: "Maharashtra", districts: [] }),

    eligibleApplicantTypes: z.array(z.string().trim()).optional().default(["STARTUP"]),
    procurementPath: z.enum(["DIRECT_PILOT", "CHALLENGE_PROCUREMENT", "RESEARCH_GRANT", "SCALE_UP"]).optional().default("DIRECT_PILOT"),

    applicationOpenAt: z.union([z.string().datetime(), z.string(), z.date()]).optional().nullable(),
    applicationCloseAt: z.union([z.string().datetime(), z.string(), z.date()]).optional().nullable(),
    sourceUrls: z.array(z.string()).optional().default([]),
});

export const updateProblemSchema = createProblemSchema.partial().omit({ organizationId: true });

export const listProblemsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    sector: z.string().trim().optional(),
    status: z.enum(Object.values(PROBLEM_STATUS)).optional(),
    search: z.string().trim().optional(),
    sortBy: z.enum(["newest", "closingSoon", "budgetHigh", "alphabetical"]).optional().default("newest"),
});
