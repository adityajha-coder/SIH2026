import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

connectDB().catch((err) => {
    console.error("Database connection error:", err.message);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(` 🔊 Server is running on port ${PORT}`);
});