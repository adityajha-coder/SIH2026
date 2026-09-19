import { createQueue } from "./queue.factory.js";
import { isRedisReady } from "../config/redis.js";
import { sendEmailDirect } from "../services/email.service.js";

export const EMAIL_QUEUE_NAME = "email-dispatch-queue";

export const emailQueue = createQueue(EMAIL_QUEUE_NAME);

/**
 * Enqueue an email job to BullMQ, with automatic fallback to direct send if Redis is offline.
 * @param {object} param0
 * @param {string} param0.to
 * @param {string} param0.subject
 * @param {string} param0.text
 * @param {string} param0.html
 */
export const enqueueEmail = async ({ to, subject, text, html }) => {
    if (isRedisReady()) {
        try {
            const job = await emailQueue.add("send-email", {
                to,
                subject,
                text,
                html,
                enqueuedAt: new Date().toISOString()
            });
            console.log(` Enqueued email to [${to}] (Job ID: ${job.id})`);
            return { queued: true, jobId: job.id };
        } catch (err) {
            console.warn(` !! Failed to enqueue email, falling back to direct dispatch: ${err.message}`);
        }
    }

    // Fallback: Direct send if Redis is offline
    await sendEmailDirect(to, subject, text, html);
    return { queued: false, direct: true };
};
