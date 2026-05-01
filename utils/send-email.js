import { Resend } from "resend";
import {
  generateForgotPasswordTemplate,
  generateEmailTemplate,
} from "./email-template.js";

// Resend initialization
const resend = new Resend(process.env.RESEND_API_KEY);

/** Helper to check if Resend is configured correctly */
export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

const sendEmail = async ({ to, subject, html }) => {
  // Hard fail if API key is missing
  if (!isEmailConfigured()) {
    throw new Error("RESEND_API_KEY missing at sendEmail()");
  }

  try {
    const { data, error } = await resend.emails.send({
      // Verified domain from your Hostinger DNS setup
      from: "Property Bulbul <noreply@propertybulbul.com>",
      to: to,
      subject: subject,
      html: html,
      // Replies will go to your personal Gmail
      reply_to: "bulbulproperty@gmail.com",
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw error;
    }

    console.log("Email sent successfully via Resend API:", data.id);
    return data;
  } catch (error) {
    console.error("Email Service Error:", error.message);
    throw error;
  }
};

export const sendForgotPasswordEmail = async ({ to, userName, resetLink }) => {
  const subject = "🔐 Reset Your Password - Property Bulbul";
  const html = generateForgotPasswordTemplate({ userName, resetLink });
  return await sendEmail({ to, subject, html });
};

export const sendReminderEmail = async ({ to, type, subscription }) => {
  const daysMatch = type.match(/(\d+)/);
  const daysLeft = daysMatch ? parseInt(daysMatch[1]) : 7;

  const renewalDate = new Date(subscription.renewalDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const templateData = {
    userName: subscription.user.name,
    subscriptionName: subscription.name,
    renewalDate,
    planName: subscription.name,
    price: `${subscription.currency} ${subscription.price}`,
    paymentMethod: subscription.paymentMethod,
    accountSettingsLink: "#",
    supportLink: "#",
    daysLeft,
  };

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

/** Non-throwing: logs failures without crashing the server. */
export async function sendEmailSafe({ to, subject, html }) {
  if (!isEmailConfigured()) {
    console.warn("[sendEmailSafe] Skipping: RESEND_API_KEY not set.");
    return false;
  }
  try {
    await sendEmail({ to, subject, html });
    return true;
  } catch (e) {
    console.warn("[sendEmailSafe] Error sending email:", e.message);
    return false;
  }
}

export default sendEmail;
