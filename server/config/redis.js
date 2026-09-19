import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redisClient = null;
let isConnected = false;


export const redisConnectionOptions = {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
        // Exponential backoff with max 10s delay
        const delay = Math.min(times * 200, 10000);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    }
};


export const getRedisClient = () => {
    if (redisClient) return redisClient;

    try {
        redisClient = new Redis(REDIS_URL, {
            ...redisConnectionOptions,
            lazyConnect: true // Don't crash immediately on boot if Redis is starting up
        });

        redisClient.on("connect", () => {
            console.log(" Redis: Connecting...");
        });

        redisClient.on("ready", () => {
            isConnected = true;
            console.log(" Redis: Connected & Ready");
        });

        redisClient.on("error", (err) => {
            isConnected = false;
            console.warn(` !! Redis Connection Warning: ${err.message}`);
        });

        redisClient.on("close", () => {
            isConnected = false;
            console.log(" Redis: Connection closed");
        });

        // Trigger connection
        redisClient.connect().catch((err) => {
            console.warn(` !! Redis initial connect failed: ${err.message}. System will operate in fallback mode.`);
        });

        return redisClient;
    } catch (error) {
        console.error("Failed to initialize Redis client:", error.message);
        return null;
    }
};


export const isRedisReady = () => {
    return isConnected && redisClient && redisClient.status === "ready";
};


export const disconnectRedis = async () => {
    if (redisClient) {
        try {
            await redisClient.quit();
            console.log(" Redis disconnected cleanly");
        } catch (err) {
            console.error("Error disconnecting Redis:", err.message);
        }
    }
};

export const waitForRedis = (timeoutMs = 3000) => {
    return new Promise((resolve) => {
        if (isRedisReady()) return resolve(true);
        const client = getRedisClient();
        if (!client) return resolve(false);
        const timer = setTimeout(() => {
            cleanup();
            resolve(false);
        }, timeoutMs);
        const onReady = () => {
            cleanup();
            resolve(true);
        };
        const cleanup = () => {
            client.off("ready", onReady);
            clearTimeout(timer);
        };
        client.once("ready", onReady);
    });
};

export default getRedisClient;
