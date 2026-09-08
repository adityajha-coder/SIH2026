import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
    const traceId = req.id || "unknown";
    const timestamp = new Date().toISOString();

    //  Zod Validation Errors
    if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return res.status(400).json({
            data: null,
            meta: { traceId, timestamp },
            error: {
                code: "VALIDATION_ERROR",
                message: "Input validation failed",
                details,
            },
        });
    }

    //  HTTP operational errors
    const statusCode = err.status || err.statusCode || 500;
    const errorCode = err.code || (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR");
    
    // detection of traces if leaked
    const message = statusCode === 500 && process.env.NODE_ENV === "production"
        ? "An internal server error occurred"
        : err.message || "An error occurred";

    return res.status(statusCode).json({
        data: null,
        meta: { traceId, timestamp },
        error: {
            code: errorCode,
            message,
            ...(process.env.NODE_ENV !== "production" && err.stack ? { stack: err.stack } : {}),
        },
    });
}
