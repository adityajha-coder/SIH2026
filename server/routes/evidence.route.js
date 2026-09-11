import { Router } from "express";
import { evidenceController } from "../controllers/evidence.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    createUploadIntentSchema,
    finalizeUploadSchema,
} from "../validators/evidence.validator.js";

const evidenceRouter = Router();

// POST /v1/evidence/upload-intent
evidenceRouter.post("/upload-intent", requireAuth, validate(createUploadIntentSchema), evidenceController.createUploadIntent);

// POST /v1/evidence/:id/finalize 
evidenceRouter.post( "/:id/finalize", requireAuth, validate(finalizeUploadSchema), evidenceController.finalizeUpload);

// GET /v1/evidence/:id — get metadata + fresh pre-signed download URL
evidenceRouter.get( "/:id", requireAuth, evidenceController.getEvidence);

// GET /v1/evidence/entity/:entityType/:entityId — list all attachments for an entity
evidenceRouter.get("/entity/:entityType/:entityId", requireAuth, evidenceController.listByEntity);

export default evidenceRouter;
