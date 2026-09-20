import { Router } from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    submitEvidenceSchema,
    disburseMilestoneSchema,
    scalePilotSchema,
} from "../validators/payment.validator.js";

const paymentRouter = Router();

// GET /v1/payments/escrow/:submissionId
paymentRouter.get("/escrow/:submissionId", requireAuth, paymentController.getEscrow);

// POST /v1/payments/escrow/:submissionId/initialize
paymentRouter.post("/escrow/:submissionId/initialize", requireAuth, paymentController.initializeEscrow);

// POST /v1/payments/escrow/:submissionId/evidence
paymentRouter.post("/escrow/:submissionId/evidence", requireAuth, validate(submitEvidenceSchema), paymentController.submitEvidence);

// POST /v1/payments/escrow/:submissionId/disburse
paymentRouter.post("/escrow/:submissionId/disburse", requireAuth, validate(disburseMilestoneSchema), paymentController.disburseMilestone);

// POST /v1/payments/escrow/:submissionId/scale
paymentRouter.post("/escrow/:submissionId/scale", requireAuth, validate(scalePilotSchema), paymentController.scalePilot);

export default paymentRouter;
