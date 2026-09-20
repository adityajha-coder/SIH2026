import { createWorker } from "../queues/queue.factory.js";
import { AI_QUEUE_NAME } from "../queues/ai.queue.js";
import { verificationService } from "../services/ai/verification.service.js";
import { AIRun, AI_RUN_STATUS } from "../models/aiRun.model.js";
import { notificationService } from "../services/notification.service.js";

export const aiWorker = createWorker(
    AI_QUEUE_NAME,
    async (job) => {
        const { runId, actorId, task, userInput, evidence, entityType, entityId } = job.data;
        console.log(` [AI Worker] Processing Run [${runId}] for task: "${task}"`);

        // Mark as PROCESSING
        await AIRun.findByIdAndUpdate(runId, { status: AI_RUN_STATUS.PROCESSING });

        try {
            const result = await verificationService.verifyProposal({
                actor: actorId ? { _id: actorId } : null,
                task,
                userInput,
                evidence,
                entityType,
                entityId,
                existingRunId: runId
            });

            await AIRun.findByIdAndUpdate(runId, {
                status: AI_RUN_STATUS.COMPLETED,
                result,
                verdict: result.verdict,
            });

            console.log(` [AI Worker] Finished Run [${runId}] with Verdict: ${result.verdict}`);

            return result;
        } catch (err) {
            console.error(` [AI Worker] Run [${runId}] failed:`, err.message);
            await AIRun.findByIdAndUpdate(runId, {
                status: AI_RUN_STATUS.FAILED,
                errorMessage: err.message
            });
            throw err;
        }
    },
    {
        concurrency: 2 // Max 2 concurrent AI calls to protect API rate limits
    }
);

export default aiWorker;
