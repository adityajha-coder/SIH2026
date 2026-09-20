import Notification, { NOTIFICATION_TYPES } from "../models/notification.model.js";
import { sendEmail } from "./email.service.js";
import User from "../models/user.model.js";
import problemModel from "../models/problem.model.js";
import organizationMemberModel from "../models/organizationmember.model.js";
import { enqueueBulkNotifications } from "../queues/notification.queue.js";
import { isRedisReady } from "../config/redis.js";

export const notificationService = {
    async notify({ recipientId, type, title, message, context = {}, sendEmailFlag = true }) {
        // in-app notification
        const notification = await Notification.create({
            recipientId,
            type,
            title,
            message,
            context,
        });

        // transactional email
        if (sendEmailFlag) {
            try {
                const user = await User.findById(recipientId).select("email userName").lean();
                if (user?.email) {
                    await sendEmail(
                        user.email,
                        `[Pragati-GovX] ${title}`,
                        message,
                        `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                            <h2 style="color:#1a1a2e;">${title}</h2>
                            <p style="color:#444;line-height:1.6;">${message}</p>
                            <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;" />
                            <p style="color:#888;font-size:12px;">This is an automated notification from Pragati-GovX Platform. Do not reply to this email.</p>
                        </div>`
                    );
                    notification.emailSent = true;
                    await notification.save();
                }
            } catch (emailErr) {
                console.warn("!! Email delivery failed (non-blocking):", emailErr.message);
            }
        }

        return notification;
    },

    // bulk notify to all
    async notifyMany({ recipientIds, type, title, message, context = {}, sendEmailFlag = true }) {
        if (!recipientIds || recipientIds.length === 0) return [];
        // Offload to background BullMQ worker if Redis is active
        if (isRedisReady() && recipientIds.length > 1) {
            const result = await enqueueBulkNotifications({
                recipientIds,
                type,
                title,
                message,
                context,
                sendEmailFlag
            });
            if (result.queued) {
                return [{ queued: true, count: recipientIds.length }];
            }
        }

        const results = [];
        for (const recipientId of recipientIds) {
            const n = await this.notify({ recipientId, type, title, message, context, sendEmailFlag });
            results.push(n);
        }
        return results;
    },


    // problem published by government → notify all STARTUP_USERs
    async onProblemPublished({ problem }) {
        const startups = await User.find({ role: "STARTUP_USER", status: "ACTIVE" }).select("_id").lean();
        const recipientIds = startups.map((u) => u._id);

        return this.notifyMany({
            recipientIds,
            type: NOTIFICATION_TYPES.PROBLEM_PUBLISHED,
            title: "New Government Challenge Published",
            message: `A new challenge "${problem.title}" has been published and is now accepting submissions. Check if your startup qualifies!`,
            context: { entityType: "PROBLEM", entityId: problem._id },
        });
    },

    // submission received → notify the problem owner (GOVERNMENT_USER)
    async onSubmissionReceived({ submission, problem }) {
        return this.notify({
            recipientId: problem.createdById,
            type: NOTIFICATION_TYPES.SUBMISSION_RECEIVED,
            title: "New Proposal Submission Received",
            message: `A new submission "${submission.solutionTitle}" has been received for your challenge "${problem.title}".`,
            context: { entityType: "SUBMISSION", entityId: submission._id },
        });
    },

    // submission status changed → notify the submitting startup
    async onSubmissionStatusChanged({ submission, newStatus, note = "" }) {
        return this.notify({
            recipientId: submission.submittedById,
            type: NOTIFICATION_TYPES.SUBMISSION_STATUS_CHANGED,
            title: `Submission Status Updated: ${newStatus}`,
            message: `Your submission "${submission.solutionTitle}" has been moved to "${newStatus}".${note ? ` Note: ${note}` : ""}`,
            context: { entityType: "SUBMISSION", entityId: submission._id },
        });
    },

    // clarification requested → notify startup
    async onClarificationRequested({ submission, note }) {
        return this.notify({
            recipientId: submission.submittedById,
            type: NOTIFICATION_TYPES.CLARIFICATION_REQUESTED,
            title: "Clarification Requested on Your Submission",
            message: `The review panel has requested clarification on "${submission.solutionTitle}": "${note}"`,
            context: { entityType: "SUBMISSION", entityId: submission._id },
        });
    },

    async onEvaluationAssigned({ assignment, submission }) {
        return this.notify({
            recipientId: assignment.evaluatorId,
            type: NOTIFICATION_TYPES.EVALUATION_ASSIGNED,
            title: "New Evaluation Assignment",
            message: `You have been assigned to evaluate submission "${submission.solutionTitle}". Deadline: ${assignment.deadline?.toISOString().split("T")[0] || "TBD"}.`,
            context: { entityType: "EVALUATION", entityId: assignment._id },
        });
    },

    // decision released → notify the startup
    async onDecisionReleased({ decisionRecord, submission }) {
        const isAccepted = decisionRecord.outcome === "ACCEPTED";
        const grantFormatted = decisionRecord.grantAmount ? `₹${decisionRecord.grantAmount.toLocaleString("en-IN")}` : "₹25,00,000";
        
        let message = `A final decision has been released for your submission "${submission.solutionTitle}". Outcome: ${decisionRecord.outcome}.`;
        if (isAccepted) {
            message = `Congratulations! Your proposal "${submission.solutionTitle}" has been ACCEPTED for a 90-day sandbox pilot with a grant corpus of ${grantFormatted}. The disbursement will be released in 3 milestone phases under Rule 173(i) GFR 2017. Please review the official pilot plan & sanction document on your portal to accept or decline the offer.`;
            if (decisionRecord.planDocumentUrl) {
                message += ` Download Plan Document: ${decisionRecord.planDocumentUrl}`;
            }
        }

        return this.notify({
            recipientId: submission.submittedById,
            type: NOTIFICATION_TYPES.DECISION_RELEASED,
            title: isAccepted ? `Pilot Offer Sanctioned: ${grantFormatted}` : `Decision Released: ${decisionRecord.outcome}`,
            message,
            context: {
                entityType: "SUBMISSION",
                entityId: submission._id,
                planDocumentUrl: decisionRecord.planDocumentUrl || "",
                grantAmount: decisionRecord.grantAmount || 2500000,
            },
            sendEmailFlag: true,
        });
    },


    async getUserNotifications({ userId, page = 1, limit = 20, unreadOnly = false }) {
        const filter = { recipientId: userId };
        if (unreadOnly) filter.read = false;

        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Notification.countDocuments(filter),
        ]);

        const unreadCount = await Notification.countDocuments({ recipientId: userId, read: false });

        return { notifications, total, unreadCount, page, limit };
    },

    async markAsRead({ notificationId, userId }) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipientId: userId, read: false },
            { read: true, readAt: new Date() },
            { new: true }
        );
        if (!notification) {
            const err = new Error("Notification not found or already read");
            err.statusCode = 404;
            err.code = "NOT_FOUND";
            throw err;
        }
        return notification;
    },

    async markAllAsRead({ userId }) {
        const result = await Notification.updateMany(
            { recipientId: userId, read: false },
            { read: true, readAt: new Date() }
        );
        return { markedCount: result.modifiedCount };
    },

    async inviteStartupToApply({ actor, organizationId, problemId, customMessage }) {
        const problem = await problemModel.findById(problemId).select("title").lean();
        if (!problem) {
            const err = new Error("Problem statement not found");
            err.statusCode = 404;
            throw err;
        }

        const members = await organizationMemberModel.find({
            organizationId,
            status: "ACTIVE",
        }).select("userId").lean();

        if (!members.length) {
            const err = new Error("No active registered users found for candidate organization");
            err.statusCode = 404;
            throw err;
        }

        const recipientIds = members.map((m) => m.userId);
        const title = `Official Nodal Invitation: ${problem.title}`;
        const message =
            customMessage ||
            `Your organization has been identified by the Explainable AI matching engine as a high-affinity candidate for "${problem.title}". You are formally invited to file a proposal under statutory GFR 173(i) waivers.`;

        const results = await this.notifyMany({
            recipientIds,
            type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
            title,
            message,
            context: { entityType: "PROBLEM", entityId: problem._id },
            sendEmailFlag: true,
        });

        return {
            dispatchedCount: results.length,
            title,
            message,
        };
    },
};
