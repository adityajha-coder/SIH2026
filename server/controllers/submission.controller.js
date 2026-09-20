import { submissionService } from "../services/submission.service.js";

export const submissionController = {
    async createSubmission(req, res, next) {
        try {
            const submission = await submissionService.createSubmission({
                actor: req.user,
                input: req.body,
            });
            return res.status(201).json({
                data: submission,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async getSubmission(req, res, next) {
        try {
            const submission = await submissionService.getSubmissionById({
                actor: req.user,
                submissionId: req.params.id,
            });
            return res.status(200).json({
                data: submission,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async getCertificate(req, res, next) {
        try {
            const certificate = await submissionService.getCertificate({
                actor: req.user,
                submissionId: req.params.id,
            });
            return res.status(200).json({
                data: certificate,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async listSubmissions(req, res, next) {
        try {
            const result = await submissionService.listSubmissions({
                actor: req.user,
                query: req.query,
            });
            return res.status(200).json({
                data: result.items,
                meta: {
                    traceId: req.id,
                    timestamp: new Date().toISOString(),
                    pagination: result.pagination,
                },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async transitionSubmission(req, res, next) {
        try {
            const submission = await submissionService.transitionSubmission({
                actor: req.user,
                submissionId: req.params.id,
                toStatus: req.body.toStatus,
                note: req.body.note,
            });
            return res.status(200).json({
                data: submission,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteSubmission(req, res, next) {
        try {
            const result = await submissionService.deleteSubmission({
                actor: req.user,
                submissionId: req.params.id,
            });
            return res.status(200).json({
                data: result,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },
};
