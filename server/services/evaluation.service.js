import evaluationTemplateModel from "../models/evaluationTemplate.model.js";
import evaluationAssignmentModel, { ASSIGNMENT_STATUS } from "../models/evaluationAssignment.model.js";
import evaluationResponseModel from "../models/evaluationResponse.model.js";
import decisionRecordModel from "../models/decisionRecord.model.js";
import submissionModel, { SUBMISSION_STATUS } from "../models/submission.model.js";
import problemModel from "../models/problem.model.js";
import organizationMemberModel from "../models/organizationmember.model.js";
import userModel from "../models/user.model.js";
import { ROLES } from "../constants/role.constant.js";

export const evaluationService = {

    async createTemplate({ actor, input }) {
        // Verify problem exists
        const problem = await problemModel.findById(input.problemId);
        if (!problem) {
            const error = new Error("Problem statement not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (actor.role !== ROLES.ADMIN) {
            const membership = await organizationMemberModel.findOne({
                organizationId: problem.organizationId,
                userId: actor._id,
                status: "ACTIVE",
            });
            if (!membership || !["OWNER", "ADMIN"].includes(membership.orgRole)) {
                const error = new Error("You are not authorized to create evaluation templates for this problem");
                error.statusCode = 403;
                error.code = "PERMISSION_DENIED";
                throw error;
            }
        }

        const template = await evaluationTemplateModel.create({
            problemId: input.problemId,
            createdById: actor._id,
            title: input.title,
            criteria: input.criteria,
        });

        return template;
    },

    async getTemplatesByProblem({ actor, problemId }) {
        const templates = await evaluationTemplateModel.find({
            problemId,
            status: "ACTIVE",
        }).sort({ createdAt: -1 });

        return templates;
    },


    async createAssignment({ actor, input }) {
        // Verify submission exists and is UNDER_REVIEW
        const submission = await submissionModel.findById(input.submissionId);
        if (!submission) {
            const error = new Error("Submission not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }
        if (submission.status !== SUBMISSION_STATUS.UNDER_REVIEW) {
            const error = new Error("Submissions can only be assigned for evaluation when under review");
            error.statusCode = 400;
            error.code = "INVALID_STATUS";
            throw error;
        }

        // Verify evaluator exists and has EVALUATOR role
        const evaluator = await userModel.findById(input.evaluatorId).select("role status");
        if (!evaluator || evaluator.role !== ROLES.EVALUATOR) {
            const error = new Error("Target user is not a registered evaluator");
            error.statusCode = 400;
            error.code = "INVALID_EVALUATOR";
            throw error;
        }
        if (evaluator.status !== "ACTIVE") {
            const error = new Error("Evaluator account is not active");
            error.statusCode = 400;
            error.code = "EVALUATOR_INACTIVE";
            throw error;
        }

        const template = await evaluationTemplateModel.findById(input.templateId);
        if (!template || template.status !== "ACTIVE") {
            const error = new Error("Evaluation template not found or inactive");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (actor.role !== ROLES.ADMIN) {
            const problem = await problemModel.findById(submission.problemId);
            const membership = await organizationMemberModel.findOne({
                organizationId: problem.organizationId,
                userId: actor._id,
                status: "ACTIVE",
            });
            if (!membership || !["OWNER", "ADMIN"].includes(membership.orgRole)) {
                const error = new Error("You are not authorized to assign evaluators for this submission");
                error.statusCode = 403;
                error.code = "PERMISSION_DENIED";
                throw error;
            }
        }

        // Duplicate check
        const existing = await evaluationAssignmentModel.findOne({
            submissionId: input.submissionId,
            evaluatorId: input.evaluatorId,
        });
        if (existing) {
            const error = new Error("This evaluator is already assigned to this submission");
            error.statusCode = 409;
            error.code = "DUPLICATE_ASSIGNMENT";
            throw error;
        }

        const assignment = await evaluationAssignmentModel.create({
            submissionId: input.submissionId,
            evaluatorId: input.evaluatorId,
            templateId: input.templateId,
            assignedById: actor._id,
            deadline: new Date(input.deadline),
        });

        return assignment;
    },

    async getAssignmentsForEvaluator({ actor }) {
        const assignments = await evaluationAssignmentModel.find({
            evaluatorId: actor._id,
            status: { $in: [ASSIGNMENT_STATUS.PENDING, ASSIGNMENT_STATUS.IN_PROGRESS] },
        })
            .populate("submissionId", "solutionTitle executiveSummary status organizationId")
            .populate("templateId", "title criteria")
            .sort({ deadline: 1 });

        return assignments;
    },

    async getAssignmentsForSubmission({ submissionId }) {
        const assignments = await evaluationAssignmentModel.find({ submissionId })
            .populate("evaluatorId", "name email")
            .populate("templateId", "title")
            .sort({ createdAt: -1 });

        return assignments;
    },

    // scoring
    async submitScores({ actor, assignmentId, input }) {
        const assignment = await evaluationAssignmentModel.findById(assignmentId)
            .populate("templateId");

        if (!assignment) {
            const error = new Error("Evaluation assignment not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (assignment.evaluatorId.toString() !== actor._id.toString()) {
            const error = new Error("You are not the assigned evaluator for this submission");
            error.statusCode = 403;
            error.code = "PERMISSION_DENIED";
            throw error;
        }

        if (assignment.status === ASSIGNMENT_STATUS.COMPLETED) {
            const error = new Error("Scores have already been submitted for this assignment");
            error.statusCode = 400;
            error.code = "ALREADY_SCORED";
            throw error;
        }

        if (assignment.status === ASSIGNMENT_STATUS.RECUSED) {
            const error = new Error("This assignment has been recused");
            error.statusCode = 400;
            error.code = "ASSIGNMENT_RECUSED";
            throw error;
        }

        const templateCriteria = assignment.templateId.criteria;
        const criteriaNames = new Set(templateCriteria.map(c => c.name));

        for (const score of input.scores) {
            if (!criteriaNames.has(score.criterionName)) {
                const error = new Error(`Unknown criterion: ${score.criterionName}`);
                error.statusCode = 400;
                error.code = "INVALID_CRITERION";
                throw error;
            }
            const criterion = templateCriteria.find(c => c.name === score.criterionName);
            if (score.score > criterion.maxScore) {
                const error = new Error(`Score for "${score.criterionName}" exceeds max score of ${criterion.maxScore}`);
                error.statusCode = 400;
                error.code = "SCORE_EXCEEDS_MAX";
                throw error;
            }
        }

        // Calculate totals
        let totalScore = 0;
        let weightedScore = 0;
        for (const score of input.scores) {
            totalScore += score.score;
            const criterion = templateCriteria.find(c => c.name === score.criterionName);
            weightedScore += (score.score / criterion.maxScore) * criterion.weight;
        }

        const existingResponse = await evaluationResponseModel.findOne({ assignmentId });
        if (existingResponse) {
            const error = new Error("Scores have already been submitted for this assignment");
            error.statusCode = 409;
            error.code = "DUPLICATE_RESPONSE";
            throw error;
        }

        const response = await evaluationResponseModel.create({
            assignmentId: assignment._id,
            evaluatorId: actor._id,
            submissionId: assignment.submissionId,
            templateId: assignment.templateId._id,
            scores: input.scores,
            totalScore,
            weightedScore,
            overallComment: input.overallComment || "",
        });

        assignment.status = ASSIGNMENT_STATUS.COMPLETED;
        await assignment.save();

        return response;
    },

    async getResponsesForSubmission({ submissionId }) {
        const responses = await evaluationResponseModel.find({ submissionId })
            .populate("evaluatorId", "name email")
            .sort({ submittedAt: -1 });

        return responses;
    },

    // decision
    async createDecision({ actor, input }) {
        const submission = await submissionModel.findById(input.submissionId);
        if (!submission) {
            const error = new Error("Submission not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (submission.status !== SUBMISSION_STATUS.UNDER_REVIEW) {
            const error = new Error("Decisions can only be made on submissions that are under review");
            error.statusCode = 400;
            error.code = "INVALID_STATUS";
            throw error;
        }

        if (actor.role !== ROLES.ADMIN) {
            const problem = await problemModel.findById(submission.problemId);
            const membership = await organizationMemberModel.findOne({
                organizationId: problem.organizationId,
                userId: actor._id,
                status: "ACTIVE",
            });
            if (!membership || !["OWNER", "ADMIN"].includes(membership.orgRole)) {
                const error = new Error("You are not authorized to make decisions on this submission");
                error.statusCode = 403;
                error.code = "PERMISSION_DENIED";
                throw error;
            }
        }

        const existing = await decisionRecordModel.findOne({ submissionId: input.submissionId });
        if (existing) {
            const error = new Error("A decision has already been recorded for this submission");
            error.statusCode = 409;
            error.code = "DUPLICATE_DECISION";
            throw error;
        }

        // Gather all completed evaluation responses
        const responses = await evaluationResponseModel.find({ submissionId: input.submissionId });
        const responseIds = responses.map(r => r._id);

        // Calculate aggregate score from all responses
        let aggregateScore = null;
        if (responses.length > 0) {
            const totalWeighted = responses.reduce((sum, r) => sum + r.weightedScore, 0);
            aggregateScore = parseFloat((totalWeighted / responses.length).toFixed(4));
        }

        const decision = await decisionRecordModel.create({
            submissionId: input.submissionId,
            outcome: input.outcome,
            aggregateScore,
            rationale: input.rationale,
            decidedById: actor._id,
            evaluationResponseIds: responseIds,
        });

        const targetStatus = input.outcome === "ACCEPTED"
            ? SUBMISSION_STATUS.ACCEPTED
            : SUBMISSION_STATUS.REJECTED;

        submission.status = targetStatus;
        submission.transitionHistory.push({
            from: SUBMISSION_STATUS.UNDER_REVIEW,
            to: targetStatus,
            actorId: actor._id,
            note: `Decision: ${input.outcome}. ${input.rationale}`,
            timestamp: new Date(),
        });
        await submission.save();

        return decision;
    },

    async getDecisionForSubmission({ submissionId }) {
        const decision = await decisionRecordModel.findOne({ submissionId })
            .populate("decidedById", "name email")
            .populate("evaluationResponseIds");

        return decision;
    },
};
