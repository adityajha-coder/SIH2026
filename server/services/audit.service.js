import AuditEvent from "../models/auditEvent.model.js";

function redactSensitiveData(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

    const sensitiveKeys = ["password", "token", "jwt", "authorization", "secret", "apiKey", "refreshToken"];

    for (const key of Object.keys(redacted)) {
        if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
            redacted[key] = "[REDACTED]";
        } else if (typeof redacted[key] === "object" && redacted[key] !== null) {
            redacted[key] = redactSensitiveData(redacted[key]);
        }
    }
    return redacted;
}

export const auditService = {
    async logEvent({
        actorId = null,
        actorRole = "SYSTEM",
        action,
        entityType,
        entityId,
        traceId = null,
        ip = null,
        userAgent = null,
        status = "SUCCESS",
        changes = null,
        metadata = {},
    }) {
        try {
            const sanitizedChanges = changes ? redactSensitiveData(changes) : null;
            const sanitizedMetadata = metadata ? redactSensitiveData(metadata) : {};

            const event = await AuditEvent.create({
                actorId,
                actorRole,
                action,
                entityType,
                entityId: String(entityId),
                traceId,
                ip,
                userAgent,
                status,
                changes: sanitizedChanges,
                metadata: sanitizedMetadata,
            });

            return event;
        } catch (err) {
            console.error("!! [AUDIT_FAILURE] Failed to record audit event:", err.message);
            return null;
        }
    },

    async queryAuditLogs({
        page = 1,
        limit = 20,
        actorId,
        entityType,
        entityId,
        action,
        status,
        startDate,
        endDate,
    } = {}) {
        const filter = {};

        if (actorId) filter.actorId = actorId;
        if (entityType) filter.entityType = entityType;
        if (entityId) filter.entityId = String(entityId);
        if (action) filter.action = action;
        if (status) filter.status = status;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const [events, total] = await Promise.all([
            AuditEvent.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("actorId", "userName email role")
                .lean(),
            AuditEvent.countDocuments(filter),
        ]);

        return {
            events,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
    },

    async getAuditLogById(id) {
        const event = await AuditEvent.findById(id)
            .populate("actorId", "userName email role")
            .lean();

        if (!event) {
            const error = new Error("Audit event not found");
            error.statusCode = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        return event;
    },
};
