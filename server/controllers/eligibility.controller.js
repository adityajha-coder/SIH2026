import { eligibilityService } from "../services/eligibility.service.js";

export const eligibilityController = {
    //GET /v1/problems/:id/eligibility
    async checkEligibility(req, res, next) {
        try {
            const result = await eligibilityService.evaluateEligibility({
                actor: req.user,
                problemId: req.params.id,
                organizationId: req.query.organizationId,
            });

            return res.status(200).json({
                data: result,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
