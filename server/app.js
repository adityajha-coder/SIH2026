import "dotenv/config";
import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { requestMiddleware } from "./middleware/requestId.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import organizationRouter from "./routes/organization.route.js";
import problemRouter from "./routes/problem.route.js";
import submissionRouter from "./routes/submission.route.js";
import evaluationRouter from "./routes/evaluation.route.js";
import evidenceRouter from "./routes/evidence.route.js";
import aiRouter from "./routes/ai.route.js";
import notificationRouter from "./routes/notification.route.js";
import adminRouter from "./routes/admin.route.js";
import healthRouter from "./routes/health.route.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();

app.use(requestMiddleware); // tracking myst be first

app.use(helmet());

const configuredOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);

const allowedOrigins = new Set([
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3001",
    ...configuredOrigins,
]);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/$/, "");
        if (allowedOrigins.has(normalized) || /\.vercel\.app$/.test(normalized)) {
            return callback(null, true);
        }
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
}));

app.post("/v1/payments/webhook", express.raw({ type: "application/json", limit: "1mb" }), async (req, res, next) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const payload = req.body;
        const controller = await import("./controllers/payment.controller.js");
        await controller.paymentController.handleWebhook(req, res, next, { rawBody: payload, signature });
    } catch (error) {
        next(error);
    }
});

app.use(express.json());
app.use(cookieParser());

morgan.token("id", (req) => req.id);
app.use(morgan("[:id] :method :url :status :response-time ms"));

app.use(healthRouter);

// Local dev mock storage handler
app.put("/v1/mock-storage/upload", express.raw({ type: "*/*", limit: "50mb" }), (req, res) => {
    res.status(200).send("Mock upload successful");
});
app.get("/v1/mock-storage/download", (req, res) => {
    res.status(200).json({ message: "Mock download" });
});

// routing
app.use("/api/auth", authRouter);
app.use("/v1/auth", authRouter);
app.use("/v1/organizations", organizationRouter);
app.use("/api/organizations", organizationRouter);
app.use("/v1/problems", problemRouter);
app.use("/api/problems", problemRouter);
app.use("/v1/submissions", submissionRouter);
app.use("/api/submissions", submissionRouter);
app.use("/v1/evaluations", evaluationRouter);
app.use("/api/evaluations", evaluationRouter);
app.use("/v1/evidence", evidenceRouter);
app.use("/api/evidence", evidenceRouter);
app.use("/v1/ai", aiRouter);
app.use("/api/ai", aiRouter);
app.use("/v1/notifications", notificationRouter);
app.use("/api/notifications", notificationRouter);
app.use("/v1/admin", adminRouter);
app.use("/api/admin", adminRouter);
app.use("/v1/payments", paymentRouter);
app.use("/api/payments", paymentRouter);

app.use(errorHandler); // must be after all routes

export default app;