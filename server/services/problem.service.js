import problemModel, { PROBLEM_STATUS } from "../models/problem.model.js";
import organizationModel from "../models/organization.model.js";
import organizationMemberModel from "../models/organizationmember.model.js";
import { ROLES } from "../constants/role.constant.js";
import { auditService } from "./audit.service.js";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "../models/auditEvent.model.js";
import { notificationService } from "./notification.service.js";

export const problemService = {
    // problem creation
    async createProblem({ actor, input }) {
        // Verify organization exists and is a government department or agency
        const org = await organizationModel.findById(input.organizationId);
        if (!org || (org.type !== "GOVERNMENT_DEPT" && org.type !== "AGENCY")) {
            const error = new Error("Problems can only be published on behalf of a government department or agency");
            error.statusCode = 400;
            error.code = "INVALID_ORGANIZATION";
            throw error;
        }

        const membership = await organizationMemberModel.findOne({
            organizationId: input.organizationId,
            userId: actor._id,
            status: "ACTIVE",
        });

        const isAuthorized = actor.role === ROLES.ADMIN || (membership && ["OWNER", "ADMIN"].includes(membership.orgRole));
        if (!isAuthorized) {
            const error = new Error("You are not authorized to create problem statements for this organization");
            error.statusCode = 403;
            error.code = "PERMISSION_DENIED";
            throw error;
        }

        const problemData = {
            ...input,
            fullStatement: input.fullStatement?.trim() || input.shortSummary?.trim(),
            createdById: actor._id,
            status: PROBLEM_STATUS.DRAFT,
        };

        const problem = await problemModel.create(problemData);

        // Audit log
        auditService.logEvent({
            actorId: actor._id,
            actorRole: actor.role,
            action: AUDIT_ACTIONS.PROBLEM_CREATED,
            entityType: AUDIT_ENTITY_TYPES.PROBLEM,
            entityId: problem._id,
            metadata: { title: problem.title, organizationId: problem.organizationId },
        }).catch(() => {});

        return problem;
    },

    // publish ps
    async publishProblem({ actor, problemId }) {
        const problem = await problemModel.findById(problemId);
        if (!problem) {
            const error = new Error("Problem statement not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        const membership = await organizationMemberModel.findOne({
            organizationId: problem.organizationId,
            userId: actor._id,
            status: "ACTIVE",
        });

        const isAuthorized = actor.role === ROLES.ADMIN || (membership && ["OWNER", "ADMIN"].includes(membership.orgRole));
        if (!isAuthorized) {
            const error = new Error("You are not authorized to publish this problem statement");
            error.statusCode = 403;
            error.code = "PERMISSION_DENIED";
            throw error;
        }

        const previousStatus = problem.status;
        problem.status = PROBLEM_STATUS.PUBLISHED;
        problem.publishedAt = new Date();
        await problem.save();

        auditService.logEvent({
            actorId: actor._id,
            actorRole: actor.role,
            action: AUDIT_ACTIONS.PROBLEM_PUBLISHED,
            entityType: AUDIT_ENTITY_TYPES.PROBLEM,
            entityId: problem._id,
            changes: { before: { status: previousStatus }, after: { status: problem.status } },
            metadata: { title: problem.title },
        }).catch(() => {});

        notificationService.onProblemPublished({ problem }).catch((err) => {
            console.warn("!! Notification dispatch failed for problem publish:", err.message);
        });

        return problem;
    },

    async getProblemById({ actor, problemId }) {
        const problem = await problemModel.findById(problemId)
            .populate("organizationId", "name type state website verificationStatus");

        if (!problem) {
            const error = new Error("Problem statement not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (problem.status === PROBLEM_STATUS.DRAFT) {
            if (!actor) {
                const error = new Error("Authentication required to view draft problem");
                error.statusCode = 401;
                error.code = "UNAUTHORIZED";
                throw error;
            }

            const membership = await organizationMemberModel.findOne({
                organizationId: problem.organizationId._id,
                userId: actor._id,
                status: "ACTIVE",
            });

            if (actor.role !== ROLES.ADMIN && !membership) {
                const error = new Error("Problem statement is not published");
                error.statusCode = 403;
                error.code = "ACCESS_DENIED";
                throw error;
            }
        }

        return problem;
    },

    async listProblems({ query }) {
        const { page = 1, limit = 10, sector, status, search, sortBy = "newest" } = query;
        const filter = {};

        if (status) {
            filter.status = status;
        } else {
            filter.status = { $in: [PROBLEM_STATUS.PUBLISHED, PROBLEM_STATUS.ACCEPTING, PROBLEM_STATUS.UNDER_REVIEW, PROBLEM_STATUS.PILOTING] };
        }

        if (sector) {
            filter.sectors = sector;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        let sort = { publishedAt: -1, createdAt: -1 };
        if (sortBy === "closingSoon") {
            sort = { applicationCloseAt: 1, publishedAt: -1 };
        } else if (sortBy === "alphabetical") {
            sort = { title: 1 };
        } else if (sortBy === "budgetHigh") {
            sort = { procurementPath: 1, publishedAt: -1 };
        }

        const skip = (page - 1) * limit;

        const [problems, total] = await Promise.all([
            problemModel.find(filter)
                .populate("organizationId", "name type state")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select("title shortSummary sectors status procurementPath applicationCloseAt publishedAt organizationId"),
            problemModel.countDocuments(filter),
        ]);

        return {
            items: problems,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    },
};
