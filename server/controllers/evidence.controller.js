import { evidenceService } from "../services/evidence.service.js";

export const evidenceController = {
    async createUploadIntent(req, res, next) {
        try {
            const result = await evidenceService.createUploadIntent({
                actor: req.user,
                input: req.body,
            });
            return res.status(201).json({
                data: result,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async finalizeUpload(req, res, next) {
        try {
            const evidence = await evidenceService.finalizeUpload({
                actor: req.user,
                evidenceId: req.params.id,
                input: req.body,
            });
            return res.status(200).json({
                data: evidence,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async getEvidence(req, res, next) {
        try {
            const evidence = await evidenceService.getEvidenceById({
                actor: req.user,
                evidenceId: req.params.id,
            });
            return res.status(200).json({
                data: evidence,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async listByEntity(req, res, next) {
        try {
            const items = await evidenceService.listEvidenceByEntity({
                actor: req.user,
                entityType: req.params.entityType.toUpperCase(),
                entityId: req.params.entityId,
            });
            return res.status(200).json({
                data: items,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },
};
