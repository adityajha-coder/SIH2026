import submissionModel, { SUBMISSION_STATUS } from "../models/submission.model.js";
import problemModel, { PROBLEM_STATUS } from "../models/problem.model.js";
import organizationModel from "../models/organization.model.js";
import organizationMemberModel from "../models/organizationmember.model.js";
import { ROLES } from "../constants/role.constant.js";
import { assertTransition } from "./submission/transitionGuard.js";
import { eligibilityService } from "./eligibility.service.js";
import { auditService } from "./audit.service.js";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../models/auditEvent.model.js";
import { notificationService } from "./notification.service.js";

export const submissionService = {
    async createSubmission({ actor, input }) {
        // Verify problem exists and ACCEPTING submissions
        const problem = await problemModel.findById(input.problemId);
        if (!problem) {
            const error = new Error("Problem statement not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }
        if (![PROBLEM_STATUS.PUBLISHED, PROBLEM_STATUS.ACCEPTING].includes(problem.status)) {
            const error = new Error("This problem is not currently accepting submissions");
            error.statusCode = 400;
            error.code = "NOT_ACCEPTING";
            throw error;
        }

        // Verify org exists and is a STARTUP
        const org = await organizationModel.findById(input.organizationId);
        if (!org || org.type !== "STARTUP") {
            const error = new Error("Submissions can only be made by startup organizations");
            error.statusCode = 400;
            error.code = "INVALID_ORGANIZATION";
            throw error;
        }

        const membership = await organizationMemberModel.findOne({
            organizationId: input.organizationId,
            userId: actor._id,
            status: "ACTIVE",
        });
        const isAuthorized = actor.role === ROLES.ADMIN || (membership && ["OWNER", "ADMIN", "MEMBER"].includes(membership.orgRole));
        if (!isAuthorized) {
            const error = new Error("You are not a member of this organization");
            error.statusCode = 403;
            error.code = "PERMISSION_DENIED";
            throw error;
        }

        // Duplicate check 
        const existing = await submissionModel.findOne({
            problemId: input.problemId,
            organizationId: input.organizationId,
        });
        if (existing) {
            const error = new Error("Your organization already has a submission for this problem");
            error.statusCode = 409;
            error.code = "DUPLICATE_SUBMISSION";
            throw error;
        }

        // Eligibility pre-check
        const eligibility = await eligibilityService.evaluateEligibility({
            actor,
            problemId: input.problemId,
            organizationId: input.organizationId,
        });
        if (!eligibility.eligible) {
            const error = new Error("Your organization is not eligible for this problem");
            error.statusCode = 400;
            error.code = "NOT_ELIGIBLE";
            error.details = eligibility.blockers;
            throw error;
        }

        const targetStatus = input.status || SUBMISSION_STATUS.SUBMITTED;
        const initialTransitions = targetStatus === SUBMISSION_STATUS.SUBMITTED
            ? [{
                from: SUBMISSION_STATUS.DRAFT,
                to: SUBMISSION_STATUS.SUBMITTED,
                actorId: actor._id,
                note: "Initial proposal submission via Innovation Compact Wizard",
                timestamp: new Date(),
            }]
            : [];

        const submission = await submissionModel.create({
            problemId: input.problemId,
            organizationId: input.organizationId,
            submittedById: actor._id,
            solutionTitle: input.solutionTitle,
            executiveSummary: input.executiveSummary,
            proposalDetails: input.proposalDetails,
            evidenceFileIds: input.evidenceFileIds || [],
            status: targetStatus,
            transitionHistory: initialTransitions,
        });

        // Audit log
        auditService.logEvent({
            actorId: actor._id,
            actorRole: actor.role,
            action: AUDIT_ACTIONS.SUBMISSION_CREATED,
            entityType: AUDIT_ENTITY_TYPES.SUBMISSION,
            entityId: submission._id,
            metadata: {
                problemId: submission.problemId,
                solutionTitle: submission.solutionTitle,
                status: targetStatus,
            },
        }).catch(() => {});

        // If submitted, notify the problem owner (Government officer)
        if (targetStatus === SUBMISSION_STATUS.SUBMITTED) {
            notificationService.onSubmissionReceived({ submission, problem }).catch((err) => {
                console.warn("!! Notification dispatch failed for submission received:", err.message);
            });
        }

        return submission;
    },

    async getSubmissionById({ actor, submissionId }) {
        const submission = await submissionModel.findById(submissionId)
            .populate("problemId", "title shortSummary status organizationId")
            .populate("organizationId", "name type state")
            .populate("submittedById", "name email");

        if (!submission) {
            const error = new Error("Submission not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (actor.role === ROLES.ADMIN) return submission;

        if (actor.role === ROLES.STARTUP_USER) {
            const membership = await organizationMemberModel.findOne({
                organizationId: submission.organizationId._id,
                userId: actor._id,
                status: "ACTIVE",
            });
            if (!membership) {
                const error = new Error("You do not have access to this submission");
                error.statusCode = 403;
                error.code = "ACCESS_DENIED";
                throw error;
            }
            return submission;
        }

        // GOV_USER / EVALUATOR — can see submissions for problems owned by their org
        if (actor.role === ROLES.GOVERNMENT_USER || actor.role === ROLES.EVALUATOR) {
            const problem = await problemModel.findById(submission.problemId._id || submission.problemId);
            if (problem) {
                const membership = await organizationMemberModel.findOne({
                    organizationId: problem.organizationId,
                    userId: actor._id,
                    status: "ACTIVE",
                });
                if (membership) return submission;
            }
            const error = new Error("You do not have access to this submission");
            error.statusCode = 403;
            error.code = "ACCESS_DENIED";
            throw error;
        }

        const error = new Error("Access denied");
        error.statusCode = 403;
        error.code = "ACCESS_DENIED";
        throw error;
    },

    async listSubmissions({ actor, query }) {
        const { page = 1, limit = 10, problemId, status } = query;
        const filter = {};

        if (problemId) filter.problemId = problemId;
        if (status) filter.status = status;

        if (actor.role === ROLES.STARTUP_USER) {
            const membership = await organizationMemberModel.findOne({
                userId: actor._id,
                status: "ACTIVE",
            });
            if (!membership) {
                return { items: [], pagination: { total: 0, page, limit, totalPages: 0 } };
            }
            filter.organizationId = membership.organizationId;
        } else if (actor.role === ROLES.GOVERNMENT_USER || actor.role === ROLES.EVALUATOR) {
            const membership = await organizationMemberModel.findOne({
                userId: actor._id,
                status: "ACTIVE",
            });
            if (!membership) {
                return { items: [], pagination: { total: 0, page, limit, totalPages: 0 } };
            }
            const ownedProblems = await problemModel.find({ organizationId: membership.organizationId }).select("_id");
            const problemIds = ownedProblems.map(p => p._id);
            filter.problemId = { $in: problemIds };
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            submissionModel.find(filter)
                .populate("problemId", "title shortSummary status")
                .populate("organizationId", "name type")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("solutionTitle executiveSummary status createdAt problemId organizationId submittedById"),
            submissionModel.countDocuments(filter),
        ]);

        return {
            items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    },


    async transitionSubmission({ actor, submissionId, toStatus, note }) {
        const submission = await submissionModel.findById(submissionId);
        if (!submission) {
            const error = new Error("Submission not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        assertTransition({
            fromStatus: submission.status,
            toStatus,
            actorRole: actor.role,
        });

        // ownership check
        if (actor.role === ROLES.STARTUP_USER) {
            const membership = await organizationMemberModel.findOne({
                organizationId: submission.organizationId,
                userId: actor._id,
                status: "ACTIVE",
            });
            if (!membership) {
                const error = new Error("You are not authorized to transition this submission");
                error.statusCode = 403;
                error.code = "PERMISSION_DENIED";
                throw error;
            }
        } else if (actor.role === ROLES.GOVERNMENT_USER || actor.role === ROLES.EVALUATOR) {
            const problem = await problemModel.findById(submission.problemId);
            if (problem) {
                const membership = await organizationMemberModel.findOne({
                    organizationId: problem.organizationId,
                    userId: actor._id,
                    status: "ACTIVE",
                });
                if (!membership) {
                    const error = new Error("You are not authorized to transition this submission");
                    error.statusCode = 403;
                    error.code = "PERMISSION_DENIED";
                    throw error;
                }
            }
        }

        const previousStatus = submission.status;
        submission.status = toStatus;
        submission.transitionHistory.push({
            from: previousStatus,
            to: toStatus,
            actorId: actor._id,
            note: note || "",
            timestamp: new Date(),
        });

        await submission.save();

        auditService.logEvent({
            actorId: actor._id,
            actorRole: actor.role,
            action: AUDIT_ACTIONS.SUBMISSION_STATUS_TRANSITIONED,
            entityType: AUDIT_ENTITY_TYPES.SUBMISSION,
            entityId: submission._id,
            changes: { before: { status: previousStatus }, after: { status: toStatus } },
            metadata: { note: note || "", solutionTitle: submission.solutionTitle },
        }).catch(() => {});

        notificationService.onSubmissionStatusChanged({ submission, newStatus: toStatus, note }).catch((err) => {
            console.warn("!! Notification dispatch failed for submission status transition:", err.message);
        });

        if (toStatus === SUBMISSION_STATUS.CLARIFICATION) {
            notificationService.onClarificationRequested({ submission, note }).catch((err) => {
                console.warn("!! Notification dispatch failed for clarification request:", err.message);
            });
        }

        return submission;
    },

    async deleteSubmission({ actor, submissionId }) {
        const submission = await submissionModel.findById(submissionId);
        if (!submission) {
            const error = new Error("Submission not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        // Only DRAFT can be deleted
        if (submission.status !== SUBMISSION_STATUS.DRAFT) {
            const error = new Error("Only draft submissions can be deleted. Use withdrawal instead.");
            error.statusCode = 403;
            error.code = "DELETE_NOT_ALLOWED";
            throw error;
        }

        // 24-hour window check
        const hoursSinceCreation = (Date.now() - submission.createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreation > 24) {
            const error = new Error("Draft submissions can only be deleted within 24 hours of creation");
            error.statusCode = 403;
            error.code = "DELETE_WINDOW_EXPIRED";
            throw error;
        }

        if (actor.role !== ROLES.ADMIN) {
            const membership = await organizationMemberModel.findOne({
                organizationId: submission.organizationId,
                userId: actor._id,
                status: "ACTIVE",
            });
            if (!membership || !["OWNER", "ADMIN"].includes(membership.orgRole)) {
                // Also allow the original submitter
                if (submission.submittedById.toString() !== actor._id.toString()) {
                    const error = new Error("You are not authorized to delete this submission");
                    error.statusCode = 403;
                    error.code = "PERMISSION_DENIED";
                    throw error;
                }
            }
        }

        await submissionModel.findByIdAndDelete(submissionId);
        return { deleted: true };
    },
};
