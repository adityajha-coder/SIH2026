import { notificationService } from "../services/notification.service.js";

export const notificationController = {
    // GET /v1/notifications
    async getMyNotifications(req, res, next) {
        try {
            const { page = 1, limit = 20, unreadOnly } = req.query;
            const result = await notificationService.getUserNotifications({
                userId: req.user._id,
                page: parseInt(page),
                limit: Math.min(parseInt(limit) || 20, 50),
                unreadOnly: unreadOnly === "true",
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

    // PUT /v1/notifications/:id/read
    async markAsRead(req, res, next) {
        try {
            const notification = await notificationService.markAsRead({
                notificationId: req.params.id,
                userId: req.user._id,
            });

            return res.status(200).json({
                data: notification,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: null,
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /v1/notifications/read-all
    async markAllAsRead(req, res, next) {
        try {
            const result = await notificationService.markAllAsRead({
                userId: req.user._id,
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
};
