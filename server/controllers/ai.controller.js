import { verificationService } from "../services/ai/verification.service.js";
import { geminiProvider } from "../services/ai/providers/gemini.provider.js";
import { aiPolicy } from "../services/ai/ai.policy.js";
import { AIRun } from "../models/aiRun.model.js";
import { matchingService } from "../services/matching.service.js";

export const aiController = {
    
    //POST /v1/ai/generate — Model 1 advisory generation
    
    async generateReport(req, res, next) {
        try {
            const { task, userInput, evidence } = req.body;
            const cleanInput = aiPolicy.sanitizeInput(userInput);
            const cleanEvidence = (evidence || []).map((e) => aiPolicy.sanitizeInput(e));

            aiPolicy.validateCall({ provider: "google", model: "gemini-3.5-flash-lite" });
            const result = await geminiProvider.execute({
                task,
                userInput: cleanInput,
                evidence: cleanEvidence,
            });

            return res.status(200).json({
                data: result,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    
    //POST /v1/ai/verify — Multi-model anti-cascade verification
     
    async verifyProposal(req, res, next) {
        try {
            const result = await verificationService.verifyProposal({
                actor: req.user,
                ...req.body,
            });

            return res.status(200).json({
                data: result,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    //GET /v1/ai/runs/:id — View prior audit record
    async getRunById(req, res, next) {
        try {
            const run = await AIRun.findById(req.params.id);
            if (!run) {
                return res.status(404).json({
                    data: null,
                    meta: { traceId: req.id, timestamp: new Date().toISOString() },
                    error: { code: "NOT_FOUND", message: "AI Run record not found" },
                });
            }

            return res.status(200).json({
                data: run,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /v1/ai/match — Explain deterministic match between startup + problem
    async matchAndExplain(req, res, next) {
        try {
            const result = await matchingService.matchAndExplain({
                actor: req.user,
                problemId: req.body.problemId,
                organizationId: req.body.organizationId,
            });

            return res.status(200).json({
                data: result,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        }catch (error) {
            next(error);
            }
    },

};
