import "./config/env.js";

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import PingLog from "./models/PingLog.js";
import authRoutes from "./routes/authRoutes.js";
import siteSettingsRoutes from "./routes/siteSettingsRoutes.js";
import websiteImageRoutes from "./routes/websiteImageRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import enquiryRoutes from "./routes/enquiryRoute.js";
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import chatbotRouter from "./routes/chatbotRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import workflowRouter from "./routes/workflow.routes.js";
import betterAuthRouter from "./routes/betterAuthRoutes.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://www.propertybulbul.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send(`Server is running on PORT: ${PORT}`);
});

// Ping endpoint for health check and keep-alive
app.get("/api/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pong! Server is awake",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes

app.use("/api/users", userRoutes);
app.use("/api/v1/website-images", websiteImageRoutes);
app.use("/api/v1/site-settings", siteSettingsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/v1/enquiry", enquiryRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/chatbot", chatbotRouter);
app.use("/api/ai", aiRoutes);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api/better-auth", betterAuthRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File too large'
    });
  }
  
  // Default error
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server Running at http://localhost:${PORT}`);
  
  // Setup cron job to ping the server every 2 minutes to keep it awake
  const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
  
  cron.schedule("*/2 * * * *", async () => {
    const startTime = Date.now();
    const pingTime = new Date();
    
    try {
      const response = await fetch(`${SERVER_URL}/api/ping`);
      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      // Save successful ping log to database
      const pingLog = new PingLog({
        pingTime,
        status: "success",
        responseTime,
        message: data.message,
        serverUrl: SERVER_URL,
        statusCode: response.status,
      });
      await pingLog.save();
      
      console.log(`🔄 [${pingTime.toISOString()}] Ping cron: ${data.message} (${responseTime}ms)`);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Save failed ping log to database
      const pingLog = new PingLog({
        pingTime,
        status: "failed",
        responseTime,
        message: error.message,
        serverUrl: SERVER_URL,
        statusCode: null,
      });
      await pingLog.save();
      
      console.error(`❌ [${pingTime.toISOString()}] Ping cron failed:`, error.message);
    }
  });
  
  console.log(`⏰ Ping cron job scheduled to run every 2 minutes`);
});
