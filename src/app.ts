import dotenv from "dotenv";
dotenv.config(); // ✅ Ensure env variables load before use

import express from "express";
import http from "http";
import cors from "cors";
import { json, urlencoded } from "express";
import connectdb from "./config/dbConfig";
import authRoutes from "./routes/auth.routes"; // ✅ Ensure file name matches
import adminRoutes from "./routes/admin.routes"

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

app.use(json({ limit: "50mb" }));
app.use(urlencoded({ extended: true, limit: "50mb" }));

app.use(cors({
  origin: "http://localhost:3000", // ✅ Allow frontend origin
  credentials: true, // ✅ Allow cookies and authentication headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


connectdb().then(() => {
    console.log("Database connected successfully");

 
    app.use("/api/auth", authRoutes);
    app.use("/api/admin/",adminRoutes);

    server.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
}).catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Exit process on DB connection failure
});

export default app;
