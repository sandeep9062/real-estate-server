import nodemailer from "nodemailer";
import {
  generateForgotPasswordTemplate,
  generateEmailTemplate,
} from "./email-template.js";

export function isEmailConfigured() {
  return Boolean(
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_FROM &&
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT,
  );
}
const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured()) {
    throw new Error("EMAIL credentials missing at sendEmail()");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("SMTP Error Details:", error);
    throw error;
  } finally {
    transporter.close(); // Connection close karna zaroori hai Render par space bachane ke liye
  }
};
export const sendForgotPasswordEmail = async ({ to, userName, resetLink }) => {
  const subject =
    "🔐 Reset Your Password - Property Bulbul (Tricity Real Estate Partner)";
  const html = generateForgotPasswordTemplate({ userName, resetLink });

  return await sendEmail({ to, subject, html });
};

export const sendReminderEmail = async ({ to, type, subscription }) => {
  // Extract days left from type (e.g., "Reminder 7 days before" -> 7)
  const daysMatch = type.match(/(\d+)/);
  const daysLeft = daysMatch ? parseInt(daysMatch[1]) : 7;

  // Format renewal date
  const renewalDate = new Date(subscription.renewalDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // Prepare template data
  const templateData = {
    userName: subscription.user.name,
    subscriptionName: subscription.name,
    renewalDate,
    planName: subscription.name,
    price: `${subscription.currency} ${subscription.price}`,
    paymentMethod: subscription.paymentMethod,
    accountSettingsLink: "#", // Placeholder - would need actual link
    supportLink: "#", // Placeholder - would need actual link
    daysLeft,
  };

  // Generate subject based on days left
  let subject;
  switch (daysLeft) {
    case 7:
      subject = `📅 Reminder: Your ${subscription.name} Subscription Renews in 7 Days!`;
      break;
    case 5:
      subject = `⏳ ${subscription.name} Renews in 5 Days – Stay Subscribed!`;
      break;
    case 2:
      subject = `🚀 2 Days Left!  ${subscription.name} Subscription Renewal`;
      break;
    case 1:
      subject = `⚡ Final Reminder: ${subscription.name} Renews Tomorrow!`;
      break;
    default:
      subject = `📅 Subscription Renewal Reminder - ${subscription.name}`;
  }

  const html = generateEmailTemplate(templateData);

  return await sendEmail({ to, subject, html });
};

/** Non-throwing: skips when SMTP is not configured; logs failures without throwing. */
export async function sendEmailSafe({ to, subject, html }) {
  if (!isEmailConfigured()) {
    return false;
  }
  try {
    await sendEmail({ to, subject, html });
    return true;
  } catch (e) {
    console.warn("[sendEmailSafe]", e.message);
    return false;
  }
}

export default sendEmail;
