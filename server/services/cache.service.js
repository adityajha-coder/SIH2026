import getRedisClient, { isRedisReady } from "../config/redis.js";

export const cacheService = {
    /**
     * Get an item from Redis cache
     * @param {string} key 
     * @returns {Promise<any|null>}
     */
    async get(key) {
        if (!isRedisReady()) return null;
        try {
            const client = getRedisClient();
            const data = await client.get(key);
            if (!data) return null;
            return JSON.parse(data);
        } catch (err) {
            console.warn(` !! Cache GET error for key "${key}":`, err.message);
            return null;
        }
    },

    /**
     * Store an item in Redis cache with TTL in seconds
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttlSeconds Default 60 seconds
     */
    async set(key, value, ttlSeconds = 60) {
        if (!isRedisReady()) return;
        try {
            const client = getRedisClient();
            const serialized = JSON.stringify(value);
            await client.setex(key, ttlSeconds, serialized);
        } catch (err) {
            console.warn(` !! Cache SET error for key "${key}":`, err.message);
        }
    },

    /**
     * Delete a specific cache key
     * @param {string} key 
     */
    async del(key) {
        if (!isRedisReady()) return;
        try {
            const client = getRedisClient();
            await client.del(key);
        } catch (err) {
            console.warn(` !! Cache DEL error for key "${key}":`, err.message);
        }
    },

    /**
     * Delete all keys matching a pattern (e.g. "cache:/v1/problems*")
     * Uses SCAN stream to avoid blocking the Redis event loop in production.
     * @param {string} pattern 
     */
    async delByPattern(pattern) {
        if (!isRedisReady()) return;
        try {
            const client = getRedisClient();
            const stream = client.scanStream({
                match: pattern,
                count: 100
            });

            stream.on("data", async (keys = []) => {
                if (keys.length) {
                    const pipeline = client.pipeline();
                    keys.forEach((k) => pipeline.del(k));
                    await pipeline.exec();
                }
            });
        } catch (err) {
            console.warn(` !! Cache DEL pattern error for "${pattern}":`, err.message);
        }
    }
};

export default cacheService;
