import express from "express"
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
import healthRouter from "./routes/health.route.js";

const app = express();

app.use(requestMiddleware); // tracking myst be first

app.use(helmet());

const allowedOrigins = [
    "http://localhost:3000", // react default
    "http://localhost:5173", // vite default
    "http://localhost:3001" ,// mine default
    process.env.FRONTEND_URL // production frontend url (from .env file)
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow req with no origins (mobile apps, postman)
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true);
        } else {
            callback(new Error("CORS policy: Not allowed by origin"));
        }
    },
    credentials: true, //required for httpOnly cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
}));

app.use(express.json());
app.use(cookieParser());

morgan.token("id", (req) => req.id);
app.use(morgan("[:id] :method :url :status :response-time ms"));

app.use(healthRouter);

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

app.use(errorHandler); // must be after all routes

export default app;