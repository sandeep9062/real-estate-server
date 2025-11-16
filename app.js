import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import siteSettingsRoutes from "./routes/siteSettingsRoutes.js";
import websiteImageRoutes from "./routes/websiteImageRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import enquiryRoutes from "./routes/enquiryRoute.js";
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://real-estate-client-cyan.vercel.app",
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

// API routes

app.use("/api/users", userRoutes);
app.use("/api/v1/website-images", websiteImageRoutes);
app.use("/api/v1/site-settings", siteSettingsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/v1/enquiry", enquiryRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/v1/contacts", contactRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server Running at http://localhost:${PORT}`);
});
