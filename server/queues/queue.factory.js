import { Queue, Worker } from "bullmq";
import { redisConnectionOptions, isRedisReady } from "../config/redis.js";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

//config for BullMQ
const connection = {
    ...redisConnectionOptions,
    url: REDIS_URL
};

// Default options for all jobs across all queues
export const defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 2000 // Retry after 2s, 4s, 8s...
    },
    removeOnComplete: {
        count: 200, // Keep last 200 completed jobs
        age: 24 * 3600 // Purge after 24 hours
    },
    removeOnFail: {
        count: 500, // Keep last 500 failed jobs for debugging
        age: 7 * 24 * 3600 // Purge after 7 days
    }
};

/**
 * Creates a BullMQ Queue instance with standard defaults
 * @param {string} name - The unique name of the queue
 * @param {object} customOpts - Optional queue settings
 */
export const createQueue = (name, customOpts = {}) => {
    return new Queue(name, {
        connection,
        defaultJobOptions,
        ...customOpts
    });
};

/**
 * Creates a BullMQ Worker instance with standardized logging & error handling
 * @param {string} name - Queue name to process
 * @param {function} processor - Async job processor function
 * @param {object} customOpts - Worker settings (e.g., concurrency)
 */
export const createWorker = (name, processor, customOpts = {}) => {
    const worker = new Worker(name, processor, {
        connection,
        concurrency: 5, // Default 5 concurrent jobs
        ...customOpts
    });

    worker.on("completed", (job) => {
        console.log(` [Job ${job.id}] in queue "${name}" completed successfully.`);
    });

    worker.on("failed", (job, err) => {
        console.error(` !! [Job ${job?.id}] in queue "${name}" failed: ${err.message}`);
    });

    worker.on("error", (err) => {
        console.warn(` !! Worker error in queue "${name}": ${err.message}`);
    });

    return worker;
};

export { isRedisReady };
