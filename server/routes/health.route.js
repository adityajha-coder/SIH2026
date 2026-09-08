import express from "express";
import mongoose from "mongoose"

const healthRouter = express.Router();

healthRouter.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

healthRouter.get("/ready", (req, res) => {
    const isDbReady = mongoose.connection.readyState === 1; // 1 = connected
    if (!isDbReady) {
        return res.status(503).json({
            status: "not_ready",
            database: "disconnected",
            timestamp: new Date().toISOString(),
        });
    }
    res.status(200).json({
        status: "ready",
        database: "connected",
        timestamp: new Date().toISOString(),
    });
});

export default healthRouter;