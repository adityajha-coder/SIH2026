import { Router } from "express";
import { organizationController } from "../controllers/organization.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    createOrganizationSchema,
    updateStartupProfileSchema,
} from "../validators/organization.validator.js";

const organizationRouter = Router();

// All organization endpoints require auth
organizationRouter.use(requireAuth);

// POST /v1/organizations
// Create an organization (STARTUP or GOVERNMENT_DEPT)
organizationRouter.post(
    "/",
    validate(createOrganizationSchema),
    organizationController.createOrganization
);


 // GET /v1/organizations/:id
organizationRouter.get(
    "/:id",
    organizationController.getOrganization
);

/**
 * PUT /v1/organizations/:id/profile
 * Update startup capabilities, sectors, stage & DPIIT info (Owner/Admin only)
 */
organizationRouter.put(
    "/:id/profile",
    validate(updateStartupProfileSchema),
    organizationController.updateProfile
);

export default organizationRouter;
