import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const initializeEscrowSchema = z.object({
    submissionId: z
        .string({ required_error: "Submission ID is required" })
        .regex(objectIdRegex, "Invalid submission ID")
        .optional(),
    totalGrantAmount: z.number().min(10000).optional().default(2500000),
});

export const submitEvidenceSchema = z.object({
    submissionId: z
        .string({ required_error: "Submission ID is required" })
        .regex(objectIdRegex, "Invalid submission ID")
        .optional(),
    trancheId: z
        .string({ required_error: "Tranche ID is required" })
        .trim()
        .min(1, "Tranche ID is required"),
    name: z
        .string({ required_error: "Evidence file name is required" })
        .trim()
        .min(1, "Evidence file name is required"),
    size: z
        .string({ required_error: "File size is required" })
        .trim()
        .min(1, "File size is required"),
    hash: z
        .string({ required_error: "SHA-256 hash is required" })
        .trim()
        .regex(/^(sha256:)?[0-9a-fA-F]{64}$/, "Must be a valid 64-character SHA-256 hash"),
    fileUrl: z.string().optional().default(""),
    description: z.string().trim().optional().default(""),
});

export const disburseMilestoneSchema = z.object({
    submissionId: z
        .string({ required_error: "Submission ID is required" })
        .regex(objectIdRegex, "Invalid submission ID")
        .optional(),
    trancheId: z
        .string({ required_error: "Tranche ID is required" })
        .trim()
        .min(1, "Tranche ID is required"),
    remarks: z.string().trim().optional().default("Disbursed under GFR 173(i) PFMS verification"),
});

export const scalePilotSchema = z.object({
    submissionId: z
        .string({ required_error: "Submission ID is required" })
        .regex(objectIdRegex, "Invalid submission ID")
        .optional(),
    gemContractId: z
        .string({ required_error: "GeM Contract ID is required" })
        .trim()
        .min(3, "GeM Contract ID must be at least 3 characters"),
    sanctionMemo: z
        .string({ required_error: "Scale sanction memo is required" })
        .trim()
        .min(10, "Sanction memo must be at least 10 characters"),
});
