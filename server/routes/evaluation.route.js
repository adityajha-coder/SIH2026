import { Router } from "express";
import { evaluationController } from "../controllers/evaluation.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { PERMISSIONS } from "../constants/role.constant.js";
import {
    createTemplateSchema,
    createAssignmentSchema,
    submitScoresSchema,
    createDecisionSchema,
} from "../validators/evaluation.validator.js";

const evaluationRouter = Router();


// POST /v1/evaluations/templates
evaluationRouter.post("/templates", requireAuth, requirePermission(PERMISSIONS.EVALUATION_DECIDE), validate(createTemplateSchema), evaluationController.createTemplate);

// GET /v1/evaluations/templates/problem/:problemId
evaluationRouter.get("/templates/problem/:problemId", requireAuth, evaluationController.getTemplates);


// GET /v1/evaluations/evaluators
evaluationRouter.get("/evaluators", requireAuth, requirePermission(PERMISSIONS.EVALUATION_DECIDE), evaluationController.getEvaluators);

// POST /v1/evaluations/assignments
evaluationRouter.post("/assignments", requireAuth, requirePermission(PERMISSIONS.EVALUATION_DECIDE), validate(createAssignmentSchema), evaluationController.createAssignment);

// GET /v1/evaluations/assignments/me
evaluationRouter.get("/assignments/me", requireAuth, requirePermission(PERMISSIONS.EVALUATION_SCORE), evaluationController.getMyAssignments);

// GET /v1/evaluations/assignments/submission/:submissionId
evaluationRouter.get("/assignments/submission/:submissionId", requireAuth, requirePermission(PERMISSIONS.SUBMISSION_VIEW), evaluationController.getSubmissionAssignments);

// POST /v1/evaluations/assignments/:assignmentId/scores
evaluationRouter.post("/assignments/:assignmentId/scores", requireAuth, requirePermission(PERMISSIONS.EVALUATION_SCORE), validate(submitScoresSchema), evaluationController.submitScores);

// GET /v1/evaluations/responses/submission/:submissionId
evaluationRouter.get("/responses/submission/:submissionId", requireAuth, requirePermission(PERMISSIONS.SUBMISSION_VIEW), evaluationController.getSubmissionResponses);

// POST /v1/evaluations/decisions
evaluationRouter.post("/decisions", requireAuth, requirePermission(PERMISSIONS.EVALUATION_DECIDE), validate(createDecisionSchema), evaluationController.createDecision);

// GET /v1/evaluations/decisions/submission/:submissionId
evaluationRouter.get("/decisions/submission/:submissionId", requireAuth, requirePermission(PERMISSIONS.SUBMISSION_VIEW), evaluationController.getDecision);

export default evaluationRouter;
