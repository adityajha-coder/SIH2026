import { organizationService } from "../services/organization.service.js";

export const organizationController = {
    // POST /v1/organizations
    async createOrganization(req, res, next) {
        try {
            const result = await organizationService.createOrganization({
                actor: req.user,
                input: req.body,
            });

            return res.status(201).json({
                data: {
                    message: "Organization created successfully",
                    organization: result.organization,
                    startupProfile: result.startupProfile,
                },
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (err) {
            next(err);
        }
    },

    // GET /v1/organizations/my/current
    async getMyOrganization(req, res, next) {
        try {
            const result = await organizationService.getMyOrganization({
                actor: req.user,
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

    // GET /v1/organizations/:id
    async getOrganization(req, res, next) {
        try {
            const result = await organizationService.getOrganizationById({
                actor: req.user,
                organizationId: req.params.id,
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

    // PUT /v1/organizations/:id/profile
    async updateProfile(req, res, next) {
        try {
            const updatedProfile = await organizationService.updateStartupProfile({
                actor: req.user,
                organizationId: req.params.id,
                input: req.body,
            });

            return res.status(200).json({
                data: {
                    message: "Startup profile updated successfully",
                    profile: updatedProfile,
                },
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (err) {
            next(err);
        }
    },
};
