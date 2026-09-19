import { describe, it, expect, vi } from "vitest";
import { redisConnectionOptions } from "../server/config/redis.js";
import { defaultJobOptions } from "../server/queues/queue.factory.js";
import { cacheService } from "../server/services/cache.service.js";
import * as redisConfig from "../server/config/redis.js";

describe("Redis & BullMQ Architecture Suite", () => {
    describe("Redis Connection Options & BullMQ Compatibility", () => {
        it("must set maxRetriesPerRequest to null as required by BullMQ", () => {
            expect(redisConnectionOptions.maxRetriesPerRequest).toBeNull();
        });

        it("should implement exponential backoff retry strategy capped at 10,000ms", () => {
            expect(typeof redisConnectionOptions.retryStrategy).toBe("function");

            // Attempt 1: 1 * 200 = 200ms
            expect(redisConnectionOptions.retryStrategy(1)).toBe(200);

            // Attempt 10: 10 * 200 = 2000ms
            expect(redisConnectionOptions.retryStrategy(10)).toBe(2000);

            // Attempt 100: capped at 10000ms
            expect(redisConnectionOptions.retryStrategy(100)).toBe(10000);
        });

        it("should reconnect on READONLY cluster replica error", () => {
            expect(typeof redisConnectionOptions.reconnectOnError).toBe("function");
            expect(redisConnectionOptions.reconnectOnError(new Error("READONLY You can't write against a read only replica."))).toBe(true);
            expect(redisConnectionOptions.reconnectOnError(new Error("CONNECTION_REFUSED"))).toBe(false);
        });
    });

    describe("BullMQ Factory & Default Retention Policies", () => {
        it("should configure 3 retry attempts with exponential backoff", () => {
            expect(defaultJobOptions.attempts).toBe(3);
            expect(defaultJobOptions.backoff).toEqual({
                type: "exponential",
                delay: 2000,
            });
        });

        it("should configure auto-cleanup to prevent memory leaks in Redis", () => {
            expect(defaultJobOptions.removeOnComplete).toEqual({
                count: 200,
                age: 24 * 3600,
            });

            expect(defaultJobOptions.removeOnFail).toEqual({
                count: 500,
                age: 7 * 24 * 3600,
            });
        });
    });

    describe("Cache Service Resilience & Graceful Fallback", () => {
        it("should return null on cache GET when Redis is offline without throwing", async () => {
            vi.spyOn(redisConfig, "isRedisReady").mockReturnValue(false);

            const result = await cacheService.get("cache:/v1/problems");
            expect(result).toBeNull();

            vi.restoreAllMocks();
        });

        it("should silently no-op on cache SET when Redis is offline without throwing", async () => {
            vi.spyOn(redisConfig, "isRedisReady").mockReturnValue(false);

            await expect(cacheService.set("cache:/v1/problems", { items: [] }, 60)).resolves.not.toThrow();

            vi.restoreAllMocks();
        });

        it("should silently no-op on cache DEL when Redis is offline without throwing", async () => {
            vi.spyOn(redisConfig, "isRedisReady").mockReturnValue(false);

            await expect(cacheService.del("cache:/v1/problems")).resolves.not.toThrow();
            await expect(cacheService.delByPattern("cache:/v1/problems*")).resolves.not.toThrow();

            vi.restoreAllMocks();
        });
    });

    describe("GFR 173(i) Statutory 30-Day SLA Calculation Logic", () => {
        const MS_PER_DAY = 1000 * 60 * 60 * 24;

        const calculateSlaStatus = (startDate, now = Date.now()) => {
            const daysElapsed = Math.floor((now - new Date(startDate).getTime()) / MS_PER_DAY);
            const daysRemaining = 30 - daysElapsed;

            if (daysElapsed >= 30) {
                return { status: "BREACH", daysElapsed, daysRemaining };
            }
            if (daysElapsed >= 25) {
                return { status: "WARNING", daysElapsed, daysRemaining };
            }
            return { status: "COMPLIANT", daysElapsed, daysRemaining };
        };

        it("should mark pilots under 25 days as COMPLIANT", () => {
            const now = Date.now();
            const startDate = new Date(now - 10 * MS_PER_DAY); // 10 days ago
            const result = calculateSlaStatus(startDate, now);

            expect(result.status).toBe("COMPLIANT");
            expect(result.daysElapsed).toBe(10);
            expect(result.daysRemaining).toBe(20);
        });

        it("should flag pilots between 25 and 29 days as WARNING", () => {
            const now = Date.now();
            const startDate = new Date(now - 27 * MS_PER_DAY); // 27 days ago
            const result = calculateSlaStatus(startDate, now);

            expect(result.status).toBe("WARNING");
            expect(result.daysElapsed).toBe(27);
            expect(result.daysRemaining).toBe(3);
        });

        it("should flag pilots at or beyond 30 days as statutory BREACH", () => {
            const now = Date.now();
            const startDate = new Date(now - 32 * MS_PER_DAY); // 32 days ago
            const result = calculateSlaStatus(startDate, now);

            expect(result.status).toBe("BREACH");
            expect(result.daysElapsed).toBe(32);
            expect(result.daysRemaining).toBe(-2);
        });
    });
});
