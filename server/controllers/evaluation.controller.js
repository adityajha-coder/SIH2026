import { evaluationService } from "../services/evaluation.service.js";

export const evaluationController = {
    async createTemplate(req, res, next) {
        try {
            const template = await evaluationService.createTemplate({
                actor: req.user,
                input: req.body,
            });
            return res.status(201).json({
                data: template,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async getTemplates(req, res, next) {
        try {
            const templates = await evaluationService.getTemplatesByProblem({
                actor: req.user,
                problemId: req.params.problemId,
            });
            return res.status(200).json({
                data: templates,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async createAssignment(req, res, next) {
        try {
            const assignment = await evaluationService.createAssignment({
                actor: req.user,
                input: req.body,
            });
            return res.status(201).json({
                data: assignment,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async getMyAssignments(req, res, next) {
        try {
            const assignments = await evaluationService.getAssignmentsForEvaluator({
                actor: req.user,
            });
            return res.status(200).json({
                data: assignments,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async getSubmissionAssignments(req, res, next) {
        try {
            const assignments = await evaluationService.getAssignmentsForSubmission({
                submissionId: req.params.submissionId,
            });
            return res.status(200).json({
                data: assignments,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async submitScores(req, res, next) {
        try {
            const response = await evaluationService.submitScores({
                actor: req.user,
                assignmentId: req.params.assignmentId,
                input: req.body,
            });
            return res.status(201).json({
                data: response,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async getSubmissionResponses(req, res, next) {
        try {
            const responses = await evaluationService.getResponsesForSubmission({
                submissionId: req.params.submissionId,
            });
            return res.status(200).json({
                data: responses,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async createDecision(req, res, next) {
        try {
            const decision = await evaluationService.createDecision({
                actor: req.user,
                input: req.body,
            });
            return res.status(201).json({
                data: decision,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async getDecision(req, res, next) {
        try {
            const decision = await evaluationService.getDecisionForSubmission({
                submissionId: req.params.submissionId,
            });
            if (!decision) {
                return res.status(404).json({
                    data: null,
                    meta: { traceId: req.id, timestamp: new Date().toISOString() },
                    error: { code: "NOT_FOUND", message: "No decision record found for this submission" },
                });
            }
            return res.status(200).json({
                data: decision,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },
};
