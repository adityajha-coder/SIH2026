import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        });
        console.log("Connected to DataBase");
        try {
            await mongoose.connection.collection("users").dropIndex("userName_1");
        } catch {
        }
    } catch (error) {
        console.error("MongoDB initial connection error:", error.message);
        console.log("Retrying MongoDB connection in 3 seconds...");
        setTimeout(connectDB, 3000);
    }
}

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to MongoDB cluster");
});

mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
    console.warn("Mongoose disconnected from MongoDB. Reconnecting...");
});

export default connectDB;