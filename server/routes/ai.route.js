import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { aiGenerateSchema, aiVerifySchema, aiMatchSchema } from "../validators/ai.validator.js";

const aiRouter = Router();

// POST /v1/ai/generate
aiRouter.post("/generate", requireAuth, validate(aiGenerateSchema), aiController.generateReport);

// POST /v1/ai/verify
aiRouter.post("/verify", requireAuth, validate(aiVerifySchema), aiController.verifyProposal);

// GET /v1/ai/runs/:id
aiRouter.get("/runs/:id", requireAuth, aiController.getRunById);

// POST /v1/ai/match
aiRouter.post("/match", requireAuth, validate(aiMatchSchema), aiController.matchAndExplain);

export default aiRouter;
