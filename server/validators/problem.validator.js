import { z } from "zod";
import { PROBLEM_STATUS } from "../models/problem.model.js";

export const createProblemSchema = z.object({
    title: z
        .string({ required_error: "Problem title is required" })
        .trim()
        .min(5, "Title must be at least 5 characters")
        .max(150, "Title cannot exceed 150 characters"),

    shortSummary: z
        .string({ required_error: "Short summary is required" })
        .trim()
        .min(10, "Summary must be at least 10 characters")
        .max(300, "Summary cannot exceed 300 characters"),

    fullStatement: z
        .string({ required_error: "Full problem statement is required" })
        .trim()
        .min(20, "Problem statement must be at least 20 characters"),

    organizationId: z
        .string({ required_error: "Organization ID is required" })
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid organization ID"),

    mandatoryRequirements: z.array(z.string().trim()).optional().default([]),
    preferredRequirements: z.array(z.string().trim()).optional().default([]),
    constraints: z.array(z.string().trim()).optional().default([]),

    sectors: z.array(z.string().trim()).optional().default([]),
    geography: z.object({
        state: z.string().trim().optional().default(""),
        districts: z.array(z.string().trim()).optional().default([]),
    }).optional(),

    eligibleApplicantTypes: z.array(z.enum(["STARTUP", "MSME", "INDIVIDUAL_INNOVATOR"])).optional().default(["STARTUP"]),
    procurementPath: z.enum(["DIRECT_PILOT", "CHALLENGE_PROCUREMENT", "RESEARCH_GRANT", "SCALE_UP"]).optional().default("DIRECT_PILOT"),

    applicationOpenAt: z.string().datetime().optional().nullable(),
    applicationCloseAt: z.string().datetime().optional().nullable(),
    sourceUrls: z.array(z.string().url("Invalid source URL")).optional().default([]),
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
