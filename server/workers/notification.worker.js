import { createWorker } from "../queues/queue.factory.js";
import { NOTIFICATION_QUEUE_NAME } from "../queues/notification.queue.js";
import { notificationService } from "../services/notification.service.js";


export const notificationWorker = createWorker(
    NOTIFICATION_QUEUE_NAME,
    async (job) => {
        const { recipientIds, type, title, message, context, sendEmailFlag } = job.data;
        console.log(` Processing bulk notification [${job.id}] for ${recipientIds.length} recipients...`);

        // Process recipients in chunks of 50 to avoid overloading DB
        const chunkSize = 50;
        for (let i = 0; i < recipientIds.length; i += chunkSize) {
            const chunk = recipientIds.slice(i, i + chunkSize);
            await Promise.all(
                chunk.map((recipientId) =>
                    notificationService.notify({
                        recipientId,
                        type,
                        title,
                        message,
                        context,
                        sendEmailFlag
                    })
                )
            );
        }
        console.log(` Completed bulk notification [${job.id}]`);
    },
    {
        concurrency: 3
    }
);

export default notificationWorker;
