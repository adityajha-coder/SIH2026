import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import { hasPermission } from "../constants/role.constant.js";

// L-1 : auth middleware
export async function requireAuth(req, res, next){
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res
            .status(401)
            .json({
                data: null,
                meta: {
                    traceId: req.id, timestamp: new Date().toISOString()
                },
                error: {
                    code: "UNAUTHORIZED",
                    message: "Unauthorized access"
                },
            });
        }
        const token = authHeader.split(" ")[1];
        
        // token sign and expiry
        let decoded;
        try {
            decoded= jwt.verify(token, config.JWT_SECRET);
        } catch (jwtError) {
            const isExpired = jwtError.name === "TokenExpiredError";
            return res
            .status(401)
            .json({
                data: null,
                meta: {
                    traceId: req.id, timestamp: new Date().toISOString()
                },
                error: {
                    code: isExpired ? "TOKEN_EXPIRED" : "UNAUTHORIZED",
                    message: isExpired ? "Session expired. Please login again.": "Unauthorized access"
                },
            });
        }
        // Validate session
        if (decoded.sessionId) {
            const session = await sessionModel.findById(decoded.sessionId);
            if (!session || session.revoked) {
                return res.status(401).json({
                    data: null,
                    meta: { traceId: req.id, timestamp: new Date().toISOString() },
                    error: {
                        code: "SESSION_REVOKED",
                        message: "Session has been revoked or expired",
                    },
                });
            }
            req.session = session;
        }
        // Retrieve user & verify account status
        const user = await userModel.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                data: null,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User account no longer exists",
                },
            });
        }
        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                data: null,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: {
                    code: "ACCOUNT_SUSPENDED",
                    message: `Account is currently ${user.status.toLowerCase()}`,
                },
            });
        }
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

// L-2 : Role guard
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res
            .status(401)
            .json({
                data: null,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: { code: "UNAUTHORIZED", message: "Authentication required" },
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res
            .status(403)
            .json({
                data: null,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: {
                    code: "ROLE_FORBIDDEN",
                    message: `Access denied for role: ${req.user.role}`,
                },
            });
        }
        next();
    };
}

// L-3 : Permission guard
export function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res
            .status(401)
            .json({
                data: null,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: { code: "UNAUTHORIZED", message: "Authentication required" },
            });
        }
        const allowed = hasPermission(req.user.role, permission);
        if (!allowed) {
            return res
            .status(403)
            .json({
                data: null,
                meta: { traceId: req.id, timestamp: new Date().toISOString() },
                error: {
                    code: "PERMISSION_DENIED",
                    message: `Missing required permission: ${permission}`,
                },
            });
        }
        next();
    };
}