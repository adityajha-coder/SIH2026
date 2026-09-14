import { Router } from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const notificationRouter = Router();

// GET /v1/notifications?page=1&limit=20&unreadOnly=true
notificationRouter.get("/", requireAuth, notificationController.getMyNotifications);

// PUT /v1/notifications/:id/read
notificationRouter.put("/:id/read", requireAuth, notificationController.markAsRead);

// PUT /v1/notifications/read-all
notificationRouter.put("/read-all", requireAuth, notificationController.markAllAsRead);

// POST /v1/notifications/invite
notificationRouter.post("/invite", requireAuth, notificationController.inviteStartup);

export default notificationRouter;
