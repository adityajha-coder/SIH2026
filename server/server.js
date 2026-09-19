import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import getRedisClient, { disconnectRedis} from "./config/redis.js";

connectDB().catch((err) => {
    console.error("Database connection error:", err.message);
});

getRedisClient();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
    console.log(` 🔊 Server is running on port ${PORT}`);
});

const shutdown = async (signal) => {
    console.log(`\n!! Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
        await disconnectRedis();
        process.exit(0);
    });
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));