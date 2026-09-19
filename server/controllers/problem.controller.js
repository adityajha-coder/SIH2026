import { problemService } from "../services/problem.service.js";
import { cacheService } from "../services/cache.service.js";

export const problemController = {
    
     // POST /v1/problems 
    async createProblem(req, res, next) {
        try {
            const problem = await problemService.createProblem({
                actor: req.user,
                input: req.body,
            });

            await cacheService.delByPattern("cache:/v1/problems*");

            return res.status(201).json({
                data: {
                    message: "Problem statement created successfully (Draft)",
                    problem,
                },
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (err) {
            next(err);
        }
    },

     // POST /v1/problems/:id/publish
    async publishProblem(req, res, next) {
        try {
            const problem = await problemService.publishProblem({
                actor: req.user,
                problemId: req.params.id,
            });

            await cacheService.delByPattern("cache:/v1/problems*");

            return res.status(200).json({
                data: {
                    message: "Problem statement published successfully",
                    problem,
                },
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (err) {
            next(err);
        }
    },


    // GET /v1/problems/:id
    async getProblem(req, res, next) {
        try {
            const problem = await problemService.getProblemById({
                actor: req.user,
                problemId: req.params.id,
            });

            return res.status(200).json({
                data: problem,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (err) {
            next(err);
        }
    },

     //GET /v1/problems
     // Public search & listing with cursor/page pagination
    async listProblems(req, res, next) {
        try {
            const result = await problemService.listProblems({
                query: req.query,
            });

            return res.status(200).json({
                data: result.items,
                meta: {
                    traceId: req.id,
                    timestamp: new Date().toISOString(),
                    pagination: result.pagination,
                },
                error: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
