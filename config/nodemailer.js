import nodemailer from "nodemailer";

export const accountEmail = "sandeepsaini157219@gmail.com";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: accountEmail,
    pass: process.env.EMAIL_PASSWORD,
  },
});
