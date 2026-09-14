import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

connectDB().catch((err) => {
    console.error("Database connection error:", err.message);
});

app.listen(3001, () => {
    console.log(" 🔊 Server is running on port http://localhost:3001")
})