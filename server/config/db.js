import mongoose, { connect } from "mongoose";
import config from "./config.js";

async function connectDB(){
    await mongoose.connect(config.MONGO_URI)
    try {
        await mongoose.connection.collection("users").dropIndex("userName_1");
    } catch {
    }
    console.log("Connected to DataBase")
}

export default connectDB;