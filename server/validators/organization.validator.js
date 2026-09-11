import { z } from "zod";
import { STARTUP_STAGES } from "../models/startupProfile.model.js";

export const createOrganizationSchema = z.object({
    name: z
        .string({ required_error: "Organization name is required" })
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),

    type: z.enum(["STARTUP", "GOVERNMENT_DEPT", "AGENCY"], {
        errorMap: () => ({ message: "Type must be STARTUP, GOVERNMENT_DEPT, or AGENCY" }),
    }),

    state: z.string().trim().optional().default(""),
    website: z.string().trim().url("Invalid website URL").optional().or(z.literal("")),
});

export const updateStartupProfileSchema = z.object({
    sectors: z.array(z.string().trim()).optional(),
    solutionTags: z.array(z.string().trim()).optional(),
    stage: z.enum(Object.values(STARTUP_STAGES)).optional(),
    capabilities: z.array(z.string().trim()).optional(),
    geography: z.object({
        state: z.string().trim().optional(),
        districts: z.array(z.string().trim()).optional(),
    }).optional(),
    teamSize: z.number().int().min(1, "Team size must be at least 1").optional(),
    dpiitRecognitionNumber: z.string().trim().nullable().optional(),
    evidenceRefs: z.array(z.string().trim()).optional(),
});
