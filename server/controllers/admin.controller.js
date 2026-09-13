import { auditService } from "../services/audit.service.js";
import User from "../models/user.model.js";
import organizationModel from "../models/organization.model.js";
import problemModel from "../models/problem.model.js";
import submissionModel from "../models/submission.model.js";
import DecisionRecord from "../models/decisionRecord.model.js";
import AiRun from "../models/aiRun.model.js";

export const adminController = {
    // GET /v1/admin/audit-logs
    async getAuditLogs(req, res, next) {
        try {
            const {
                page = 1,
                limit = 20,
                actorId,
                entityType,
                entityId,
                action,
                status,
                startDate,
                endDate,
            } = req.query;

            const result = await auditService.queryAuditLogs({
                page: Number(page),
                limit: Number(limit),
                actorId,
                entityType,
                entityId,
                action,
                status,
                startDate,
                endDate,
            });

            return res.status(200).json({
                data: result,
                meta: {
                    traceId: req.id,
                    timestamp: new Date().toISOString(),
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /v1/admin/audit-logs/:id
    async getAuditLogById(req, res, next) {
        try {
            const { id } = req.params;
            const event = await auditService.getAuditLogById(id);

            return res.status(200).json({
                data: event,
                meta: {
                    traceId: req.id,
                    timestamp: new Date().toISOString(),
                },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /v1/admin/stats
    async getPlatformStats(req, res, next) {
        try {
            const [
                totalUsers,
                usersByRole,
                totalOrgs,
                totalProblems,
                problemsByStatus,
                totalSubmissions,
                submissionsByStatus,
                totalDecisions,
                totalAiRuns,
            ] = await Promise.all([
                User.countDocuments(),
                User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
                organizationModel.countDocuments(),
                problemModel.countDocuments(),
                problemModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
                submissionModel.countDocuments(),
                submissionModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
                DecisionRecord.countDocuments(),
                AiRun.countDocuments(),
            ]);

            return res.status(200).json({
                data: {
                    users: {
                        total: totalUsers,
                        byRole: usersByRole.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
                    },
                    organizations: { total: totalOrgs },
                    problems: {
                        total: totalProblems,
                        byStatus: problemsByStatus.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
                    },
                    submissions: {
                        total: totalSubmissions,
                        byStatus: submissionsByStatus.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
                    },
                    governance: {
                        totalDecisions,
                        totalAiRuns,
                    },
                },
                meta: {
                    traceId: req.id,
                    timestamp: new Date().toISOString(),
                },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },
};
