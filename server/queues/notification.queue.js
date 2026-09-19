import { createQueue } from "./queue.factory.js";
import { isRedisReady } from "../config/redis.js";

export const NOTIFICATION_QUEUE_NAME = "notification-queue";

export const notificationQueue = createQueue(NOTIFICATION_QUEUE_NAME);

// Bulk notification job to BULLMQ
export const enqueueBulkNotifications = async (payload) => {
    if (isRedisReady()) {
        try {
            const job = await notificationQueue.add("bulk-notification", payload);
            console.log(` Enqueued bulk notification (Job ID: ${job.id}, Recipients: ${payload.recipientIds?.length})`);
            return { queued: true, jobId: job.id };
        } catch (err) {
            console.warn(`!! Failed to enqueue bulk notification: ${err.message}`);
        }
    }
    return { queued: false };
};
