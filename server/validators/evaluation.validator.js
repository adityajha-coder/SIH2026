import { z } from "zod";
import { ASSIGNMENT_STATUS } from "../models/evaluationAssignment.model.js";
import { DECISION_OUTCOME } from "../models/decisionRecord.model.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Template
export const createTemplateSchema = z.object({
    problemId: z
        .string({ required_error: "Problem ID is required" })
        .regex(objectIdRegex, "Invalid problem ID"),

    title: z
        .string({ required_error: "Template title is required" })
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(200, "Title cannot exceed 200 characters"),

    criteria: z
        .array(z.object({
            name: z.string().trim().min(1, "Criterion name is required"),
            description: z.string().trim().optional().default(""),
            maxScore: z.number().int().min(1, "Max score must be at least 1"),
            weight: z.number().min(0, "Weight must be >= 0").max(1, "Weight must be <= 1"),
        }))
        .min(1, "At least one criterion is required"),
});

// Assignment
export const createAssignmentSchema = z.object({
    submissionId: z
        .string({ required_error: "Submission ID is required" })
        .regex(objectIdRegex, "Invalid submission ID"),

    evaluatorId: z
        .string({ required_error: "Evaluator ID is required" })
        .regex(objectIdRegex, "Invalid evaluator ID"),

    templateId: z
        .string({ required_error: "Template ID is required" })
        .regex(objectIdRegex, "Invalid template ID"),

    deadline: z
        .string({ required_error: "Deadline is required" })
        .datetime("Invalid deadline format"),
});

// Scoring
export const submitScoresSchema = z.object({
    scores: z
        .array(z.object({
            criterionName: z.string().trim().min(1, "Criterion name is required"),
            score: z.number().min(0, "Score must be >= 0"),
            maxScore: z.number().int().min(1, "Max score must be >= 1"),
            comment: z.string().trim().optional().default(""),
        }))
        .min(1, "At least one score is required"),

    overallComment: z.string().trim().max(2000).optional().default(""),
});

// Decision
export const createDecisionSchema = z.object({
    submissionId: z
        .string({ required_error: "Submission ID is required" })
        .regex(objectIdRegex, "Invalid submission ID"),

    outcome: z.enum(Object.values(DECISION_OUTCOME), {
        required_error: "Decision outcome is required",
    }),

    rationale: z
        .string({ required_error: "Rationale is required" })
        .trim()
        .min(10, "Rationale must be at least 10 characters")
        .max(5000, "Rationale cannot exceed 5000 characters"),

    grantAmount: z.number().min(0).optional(),
    paymentDescription: z.string().trim().max(5000).optional(),
    tranches: z.array(z.object({
        trancheId: z.string(),
        name: z.string(),
        percentage: z.number().min(1).max(100),
        amount: z.number().min(0),
        deliverable: z.string(),
    })).optional(),
    planDetails: z.string().trim().max(5000).optional(),
    durationDays: z.number().int().min(1).max(365).optional(),
    planDocumentUrl: z.string().trim().optional(),
    planDocumentName: z.string().trim().optional(),
    planDocumentHash: z.string().trim().optional(),
});
