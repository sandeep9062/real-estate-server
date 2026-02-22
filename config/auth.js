import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createTransport } from "nodemailer";
import mongoose from "mongoose";
import User from "../models/User.js";
import { createNotification } from "../controllers/notificationController.js";

// Email transporter for sending emails
const emailTransporter = createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to send emails
const sendEmail = async ({ to, subject, html }) => {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL || "http://localhost:9000/api/better-auth",
  database: mongodbAdapter(mongoose.connection, {
    generateId: () => new mongoose.Types.ObjectId().toString(),
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password - Property Bulbul",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4161df;">Reset Your Password</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4161df; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
            <p>Best regards,<br>Property Bulbul Team</p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email - Property Bulbul",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4161df;">Verify Your Email Address</h2>
            <p>Hello ${user.name},</p>
            <p>Thank you for registering at Property Bulbul. Please verify your email address by clicking the button below:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4161df; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>Property Bulbul Team</p>
          </div>
        `,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (update session every day)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    // Cookie settings for cross-site requests
    cookie: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
    // Return session token in response body for cross-origin clients
    storeSessionInDatabase: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  user: {
    modelName: "users", // Use the same collection as Mongoose User model
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        unique: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      image: {
        type: "string",
        required: false,
      },
      bookedVisits: {
        type: "array",
        required: false,
        defaultValue: [],
      },
      favProperties: {
        type: "array",
        required: false,
        defaultValue: [],
      },
      ownedProperties: {
        type: "array",
        required: false,
        defaultValue: [],
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-here",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://www.propertybulbul.com",
    "https://propertybulbul.com",
    // Add production frontend URL from environment variable
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  advanced: {
    generateId: false,
    // Return session token in response for cross-origin clients
    returnSessionToken: true,
  },
});

export default auth;