import { emailQueue } from "../queues/email.queue.js";
import { notificationQueue } from "../queues/notification.queue.js";
import { aiQueue } from "../queues/ai.queue.js";
import { cronQueue } from "../queues/cron.queue.js";
import { isRedisReady } from "../config/redis.js";
import { runSlaAudit } from "../workers/cron.worker.js";

export const queueController = {
    /**
     * GET /v1/admin/queues/metrics
     * Returns real-time health and depth of all BullMQ queues
     */
    async getQueueMetrics(req, res, next) {
        try {
            if (!isRedisReady()) {
                return res.status(200).json({
                    data: {
                        redisConnected: false,
                        mode: "Synchronous Fallback",
                        queues: {},
                    },
                    meta: { traceId: req.id, timestamp: new Date().toISOString() },
                    error: null,
                });
            }

            const [emailCounts, notifCounts, aiCounts, cronCounts] = await Promise.all([
                emailQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
                notificationQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
                aiQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
                cronQueue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
            ]);

            return res.status(200).json({
                data: {
                    redisConnected: true,
                    mode: "BullMQ Distributed Event Architecture",
                    queues: {
                        emailQueue: emailCounts,
                        notificationQueue: notifCounts,
                        aiVerificationQueue: aiCounts,
                        cronSchedulerQueue: cronCounts,
                    },
                },
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (err) {
            next(err);
        }
    },

    /**
     * POST /v1/admin/queues/sla/trigger
     * Manually triggers the statutory 30-day SLA audit on demand
     */
    async triggerSlaAudit(req, res, next) {
        try {
            const auditReport = await runSlaAudit();

            return res.status(200).json({
                data: {
                    message: "Statutory 30-Day SLA Audit executed successfully",
                    report: auditReport,
                },
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (err) {
            next(err);
        }
    },
};

export default queueController;
