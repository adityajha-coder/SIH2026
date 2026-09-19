import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if(!MONGO_URI){
    throw new Error("MONGO_URI or MONGODB_URI is not defined in env");
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT is not defined in env");
}

if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE_CLIENT_ID is not defined in env")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in env")
}

if(!process.env.EMAIL_USER){
    throw new Error("EMAIL_USER is not defined in env")
}

if(!process.env.EMAIL_APP_PASSWORD){
    throw new Error("EMAIL_APP_PASSWORD is not defined in env")
}

if(!process.env.RAZORPAY_KEY_ID){
    throw new Error("RAZORPAY_KEY_ID is not defined in env")
}

if(!process.env.RAZORPAY_KEY_SECRET){
    throw new Error("RAZORPAY_KEY_SECRET is not defined in env")
}

if(!process.env.RAZORPAY_WEBHOOK_SECRET){
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not defined in env")
}

const config = {
    MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
}

export default config;