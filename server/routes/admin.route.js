import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { ROLES } from "../constants/role.constant.js";

const adminRouter = Router();

// require ADMIN role
adminRouter.use(requireAuth);
adminRouter.use(requireRole(ROLES.ADMIN));

// Platform overview stats
adminRouter.get("/stats", adminController.getPlatformStats);

// Audit Trail inspection
adminRouter.get("/audit-logs", adminController.getAuditLogs);
adminRouter.get("/audit-logs/:id", adminController.getAuditLogById);

export default adminRouter;
