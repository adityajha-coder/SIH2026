import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { ROLES } from "../constants/role.constant.js";
import {
    aiGenerateSchema,
    aiVerifySchema,
    aiMatchSchema,
    legalQuerySchema,
} from "../validators/ai.validator.js";

const aiRouter = Router();

// POST /v1/ai/generate
aiRouter.post("/generate", requireAuth, validate(aiGenerateSchema), aiController.generateReport);

// POST /v1/ai/verify
aiRouter.post("/verify", requireAuth, validate(aiVerifySchema), aiController.verifyProposal);

// GET /v1/ai/runs/:id
aiRouter.get("/runs/:id", requireAuth, aiController.getRunById);

// POST /v1/ai/match
aiRouter.post("/match", requireAuth, validate(aiMatchSchema), aiController.matchAndExplain);

// POST /v1/ai/legal-chat — Exclusive for authenticated startups and admins
aiRouter.post(
    "/legal-chat",
    requireAuth,
    requireRole(ROLES.STARTUP_USER, ROLES.ADMIN),
    validate(legalQuerySchema),
    aiController.chatLegalAssistant
);

export default aiRouter;

