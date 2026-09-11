import { Router } from "express";
import { problemController } from "../controllers/problem.controller.js";
import { requireAuth, optionalAuth, requirePermission } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { eligibilityController } from "../controllers/eligibility.controller.js";
import { PERMISSIONS } from "../constants/role.constant.js";
import {
    createProblemSchema,
    listProblemsQuerySchema,
} from "../validators/problem.validator.js";

const problemRouter = Router();

/**
 * GET /v1/problems
 */
problemRouter.get("/", problemController.listProblems
);

/**
 * GET /v1/problems/:id/eligibility
 * Deterministic check for a startup against a problem statement
 */
problemRouter.get("/:id/eligibility", requireAuth, eligibilityController.checkEligibility);

/**
 * GET /v1/problems/:id
 */
problemRouter.get("/:id", optionalAuth, problemController.getProblem);

/**
 * POST /v1/problems
 */
problemRouter.post("/", requireAuth, requirePermission(PERMISSIONS.PROBLEM_CREATE), validate(createProblemSchema), problemController.createProblem);

/**
 * POST /v1/problems/:id/publish
 */
problemRouter.post("/:id/publish", requireAuth, requirePermission(PERMISSIONS.PROBLEM_PUBLISH), problemController.publishProblem);


export default problemRouter;
