import { createQueue } from "./queue.factory.js";
import { isRedisReady } from "../config/redis.js";

export const CRON_QUEUE_NAME = "cron-scheduler-queue";

export const cronQueue = createQueue(CRON_QUEUE_NAME);

export const initCronScheduler = async () => {
    if (!isRedisReady()) {
        console.log(" !! Redis offline: Cron scheduler will not initialize repeatable jobs.");
        return;
    }

    try {
        const repeatableJobs = await cronQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await cronQueue.removeRepeatableByKey(job.key);
        }

        await cronQueue.add(
            "sla-daily-audit",
            {},
            {
                repeat: {
                    pattern: "0 8 * * *", // Daily at 08:00 AM
                },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );

        console.log(" [Cron Scheduler] Daily 30-Day SLA audit scheduled for 08:00 AM IST");
    } catch (err) {
        console.error(" !! Failed to initialize Cron scheduler:", err.message);
    }
};
