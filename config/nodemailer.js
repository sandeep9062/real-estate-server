import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Port 465 ke liye true hona chahiye
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Naya 16-digit App Password
  },
  // Render connectivity fixes
  connectionTimeout: 15000,
  socketTimeout: 20000,
  greetingTimeout: 15000,
  tls: {
    rejectUnauthorized: false, // Self-signed certificates allow karne ke liye
  },
});
