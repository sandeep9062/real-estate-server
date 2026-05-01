import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT), // Port 587 as a number
  secure: false, // TLS ke liye false (Port 465 ke liye true hota hai)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Render connectivity fixes
  connectionTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
});
