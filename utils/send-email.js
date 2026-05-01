import { Resend } from "resend";
import {
  generateForgotPasswordTemplate,
  generateEmailTemplate,
} from "./email-template.js";

// Resend initialization
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  // Check if API Key exists
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing in environment variables");
  }

  try {
    const { data, error } = await resend.emails.send({
      // Professional "From" address using your verified domain
      from: "Property Bulbul <noreply@propertybulbul.com>",
      to: to,
      subject: subject,
      html: html,
      // User reply karega toh seedha aapke Gmail par aayega
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
