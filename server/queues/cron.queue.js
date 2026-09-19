import { createQueue } from "./queue.factory.js";
import { isRedisReady, waitForRedis } from "../config/redis.js";

export const CRON_QUEUE_NAME = "cron-scheduler-queue";

export const cronQueue = createQueue(CRON_QUEUE_NAME);

export const initCronScheduler = async () => {
    await waitForRedis(3000); // wait upto 3s for redis init handshake
    if (!isRedisReady()) {
        console.log(" !! Redis offline: Cron scheduler will not initialize repeatable jobs.");
        return;
    }

    try {
        await cronQueue.upsertJobScheduler(
            "sla-daily-audit",
             { pattern: "0 8 * * *" }, // Daily at 08:00 AM
            {
                name: "sla-daily-audit",
                data: {},
                opts: {
                    removeOnComplete: true,
                    removeOnFail: false,
                }
            }
        );

        console.log(" [Cron Scheduler] Daily 30-Day SLA audit scheduled for 08:00 AM IST");
    } catch (err) {
        console.error(" !! Failed to initialize Cron scheduler:", err.message);
    }
};
