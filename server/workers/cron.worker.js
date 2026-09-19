import { createWorker } from "../queues/queue.factory.js";
import { CRON_QUEUE_NAME } from "../queues/cron.queue.js";
import submissionModel, { SUBMISSION_STATUS } from "../models/submission.model.js";
import problemModel from "../models/problem.model.js";
import { notificationService } from "../services/notification.service.js";

export const runSlaAudit = async () => {
    console.log("[SLA Audit] Running statutory 30-day pilot milestone inspection...");

    const activePilots = await submissionModel
        .find({ status: SUBMISSION_STATUS.PILOT_ACTIVE })
        .populate("problemId", "title createdById")
        .populate("submittedById", "email userName")
        .lean();

    const results = {
        totalAudited: activePilots.length,
        warnings: 0,
        breaches: 0,
        compliant: 0,
        timestamp: new Date().toISOString(),
    };

    const NOW = Date.now();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    for (const pilot of activePilots) {
        // Find the date pilot became active from transitionHistory or updatedAt
        const activeTransition = (pilot.transitionHistory || [])
            .filter((t) => t.to === SUBMISSION_STATUS.PILOT_ACTIVE)
            .pop();

        const startDate = activeTransition?.timestamp
            ? new Date(activeTransition.timestamp).getTime()
            : new Date(pilot.updatedAt).getTime();

        const daysElapsed = Math.floor((NOW - startDate) / MS_PER_DAY);
        const daysRemaining = 30 - daysElapsed;

        const problemTitle = pilot.problemId?.title || "Field Pilot";
        const officerId = pilot.problemId?.createdById;

        if (daysElapsed >= 30) {
            // STATUTORY BREACH
            results.breaches++;
            console.warn(`[SLA BREACH] Pilot "${pilot.solutionTitle}" has exceeded 30 days (${daysElapsed} days elapsed)!`);

            if (officerId) {
                await notificationService.notify({
                    recipientId: officerId,
                    type: "SYSTEM_ANNOUNCEMENT",
                    title: ` Statutory SLA Breach: ${problemTitle}`,
                    message: `Pilot "${pilot.solutionTitle}" has exceeded the 30-day statutory evaluation SLA under GFR 173(i) (${daysElapsed} days elapsed). Immediate departmental action required.`,
                    context: { entityType: "SUBMISSION", entityId: pilot._id },
                    sendEmailFlag: true,
                }).catch(() => {});
            }
        } else if (daysElapsed >= 25) {
            // APPROACHING DEADLINE (Warning at Day 25+)
            results.warnings++;
            console.warn(` [SLA WARNING] Pilot "${pilot.solutionTitle}" is at day ${daysElapsed}/30 (${daysRemaining} days remaining)`);

            if (officerId) {
                await notificationService.notify({
                    recipientId: officerId,
                    type: "SYSTEM_ANNOUNCEMENT",
                    title: ` Statutory SLA Warning (${daysRemaining} days left): ${problemTitle}`,
                    message: `Pilot "${pilot.solutionTitle}" has ${daysRemaining} days remaining before the 30-day statutory milestone deadline. Please complete field review.`,
                    context: { entityType: "SUBMISSION", entityId: pilot._id },
                    sendEmailFlag: true,
                }).catch(() => {});
            }
        } else {
            results.compliant++;
        }
    }

    console.log(` [SLA Audit Complete] Audited: ${results.totalAudited}, Warnings: ${results.warnings}, Breaches: ${results.breaches}, Compliant: ${results.compliant}`);
    return results;
};

export const cronWorker = createWorker(
    CRON_QUEUE_NAME,
    async (job) => {
        if (job.name === "sla-daily-audit") {
            return await runSlaAudit();
        }
    },
    { concurrency: 1 }
);

export default cronWorker;
