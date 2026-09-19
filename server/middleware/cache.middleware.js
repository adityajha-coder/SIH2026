import { cacheService } from "../services/cache.service.js";
import { isRedisReady } from "../config/redis.js";

/**
 * Express middleware to cache GET responses in Redis
 * @param {number} ttlSeconds Duration to cache in seconds (e.g. 60 or 120)
 * @param {string} prefix Optional custom cache prefix
 */
export const cacheMiddleware = (ttlSeconds = 60, prefix = "cache") => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET" || !isRedisReady()) {
            return next();
        }

        const cacheKey = `${prefix}:${req.originalUrl || req.url}`;

        try {
            const cachedData = await cacheService.get(cacheKey);

            if (cachedData) {
                res.setHeader("X-Cache", "HIT");
                return res.status(200).json(cachedData);
            }

            // Cache MISS: Monkey-patch res.json to capture response before sending
            res.setHeader("X-Cache", "MISS");
            const originalJson = res.json.bind(res);

            res.json = (body) => {
                if (res.statusCode === 200) {
                    cacheService.set(cacheKey, body, ttlSeconds).catch(() => {});
                }
                return originalJson(body);
            };

            next();
        } catch (err) {
            console.warn(` !! Cache middleware bypassed:`, err.message);
            next();
        }
    };
};
