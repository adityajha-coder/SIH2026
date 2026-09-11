import { Router } from "express";
import { submissionController } from "../controllers/submission.controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { PERMISSIONS } from "../constants/role.constant.js";
import {
    createSubmissionSchema,
    transitionSubmissionSchema,
} from "../validators/submission.validator.js";

const submissionRouter = Router();

/**
 * POST /v1/submissions
 */
submissionRouter.post("/", requireAuth, requirePermission(PERMISSIONS.SUBMISSION_CREATE), validate(createSubmissionSchema), submissionController.createSubmission);

/**
 * GET /v1/submissions
 */
submissionRouter.get("/", requireAuth, requirePermission(PERMISSIONS.SUBMISSION_VIEW), submissionController.listSubmissions);

/**
 * GET /v1/submissions/:id
 */
submissionRouter.get("/:id", requireAuth, requirePermission(PERMISSIONS.SUBMISSION_VIEW), submissionController.getSubmission);

/**
 * POST /v1/submissions/:id/transition
 */
submissionRouter.post("/:id/transition", requireAuth, validate(transitionSubmissionSchema), submissionController.transitionSubmission);

/**
 * DELETE /v1/submissions/:id
 * Delete a draft submission (within 24h window)
 */
submissionRouter.delete("/:id", requireAuth, requirePermission(PERMISSIONS.SUBMISSION_CREATE), submissionController.deleteSubmission);

export default submissionRouter;
