import crypto from "crypto";
import { createQueue } from "./queue.factory.js";
import { isRedisReady } from "../config/redis.js";
import { AIRun, AI_RUN_STATUS } from "../models/aiRun.model.js";
import { aiPolicy } from "../services/ai/ai.policy.js";

export const AI_QUEUE_NAME = "ai-verification-queue";

export const aiQueue = createQueue(AI_QUEUE_NAME, {
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: "exponential",
            delay: 5000 // Retry after 5s
        },
        removeOnComplete: { count: 100, age: 24 * 3600 },
        removeOnFail: { count: 200, age: 7 * 24 * 3600 }
    }
});

export const enqueueAiVerification = async ({ actor, task, userInput, evidence = [], entityType, entityId }) => {
    const cleanInput = aiPolicy.sanitizeInput(userInput);
    const cleanEvidence = evidence.map((e) => aiPolicy.sanitizeInput(e));
    const inputHash = crypto
        .createHash("sha256")
        .update(cleanInput + JSON.stringify(cleanEvidence))
        .digest("hex");

    const aiRun = await AIRun.create({
        task,
        userInputHash: inputHash,
        promptVersion: "1.0",
        status: AI_RUN_STATUS.QUEUED,
        requestedById: actor?._id || null,
        entityType,
        entityId,
    });

    //Enqueue job to BullMQ if Redis is ready
    if (isRedisReady()) {
        try {
            const job = await aiQueue.add("verify-proposal", {
                runId: aiRun._id.toString(),
                actorId: actor?._id?.toString() || null,
                task,
                userInput: cleanInput,
                evidence: cleanEvidence,
                entityType,
                entityId: entityId.toString(),
            });

            console.log(` [AI Queue] Enqueued verification job (Job ID: ${job.id}, Run ID: ${aiRun._id})`);
            return {
                runId: aiRun._id,
                jobId: job.id,
                status: AI_RUN_STATUS.QUEUED,
                message: "AI verification pipeline enqueued for background evaluation."
            };
        } catch (err) {
            console.warn(` !! Failed to enqueue AI job, falling back to direct run: ${err.message}`);
        }
    }

    //fallback is redis offline
    const { verificationService } = await import("../services/ai/verification.service.js");
    const result = await verificationService.verifyProposal({
        actor,
        task,
        userInput,
        evidence,
        entityType,
        entityId,
        existingRunId: aiRun._id
    });

    return {
        runId: aiRun._id,
        status: AI_RUN_STATUS.COMPLETED,
        ...result
    };
};
