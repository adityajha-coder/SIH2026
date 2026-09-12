import { z } from "zod";

export const aiTaskInputSchema = z.object({
    task: z.string().trim().min(1, "Task description is required"),
    userInput: z.string().trim().min(1, "User input is required"),
    evidence: z.array(z.string()).default([]),
    policyVersion: z.string().default("1.0"),
    promptVersion: z.string().default("1.0"),
});

export const aiOutputContractSchema = z.object({
    conclusion: z.string().trim(),
    claims: z.array(z.string()).default([]),
    evidenceUsed: z.array(z.string()).default([]),
    uncertainties: z.array(z.string()).default([]),
    issues: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(1).default(1.0),
    model: z.string(),
    provider: z.string(),
    latencyMs: z.number().nonnegative(),
});
