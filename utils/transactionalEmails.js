import User from "../models/User.js";
import { sendEmailSafe } from "./send-email.js";
import {
  generateWelcomeEmailHtml,
  generatePasswordChangedEmailHtml,
  generateContactAdminEmailHtml,
  generateContactConfirmationEmailHtml,
  generateBookingUserConfirmationHtml,
  generateBookingOwnerAlertHtml,
  generateBookingStatusEmailHtml,
  generateVisitCancelledUserHtml,
  generateVisitCancelledOwnerHtml,
} from "./email-template.js";

function publicSiteUrl() {
  return process.env.FRONTEND_URL || "http://localhost:3000";
}

function adminDashboardBase() {
  return (
    process.env.ADMIN_DASHBOARD_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000"
  );
}

export async function resolveAdminNotificationEmails() {
  const csv = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (csv?.trim()) {
    return [...new Set(csv.split(",").map((s) => s.trim()).filter(Boolean))];
  }
  const admins = await User.find({ role: "admin" }).select("email").lean();
  return [...new Set(admins.map((a) => a.email).filter(Boolean))];
}

export function notifyWelcomeEmail({ to, userName }) {
  return sendEmailSafe({
    to,
    subject: "Welcome to Property Bulbul",
    html: generateWelcomeEmailHtml({
      userName,
      siteUrl: publicSiteUrl(),
    }),
  });
}

export function notifyPasswordChangedEmail({ to, userName }) {
  return sendEmailSafe({
    to,
    subject: "Your Property Bulbul password was changed",
    html: generatePasswordChangedEmailHtml({ userName }),
  });
}

export async function notifyContactFormEmails(contactDoc) {
  const { name, email, phone, subject, message } = contactDoc;
  const adminRecipients = await resolveAdminNotificationEmails();
  const htmlAdmin = generateContactAdminEmailHtml({
    name,
    email,
    phone,
    subject,
    message,
  });

  await Promise.all(
    adminRecipients.map((to) =>
      sendEmailSafe({
        to,
        subject: `[Property Bulbul] Contact: ${subject || "New enquiry"}`,
        html: htmlAdmin,
      }),
    ),
  );

  if (email) {
    await sendEmailSafe({
      to: email,
      subject: "We received your message — Property Bulbul",
      html: generateContactConfirmationEmailHtml({ name }),
    });
  }
}

export async function notifyBookingCreatedEmails({
  visitorEmail,
  visitorName,
  visitorUserId,
  visitDateStr,
  propertyTitle,
  bookingId,
  ownerUserId,
}) {
  const listingsUrl = publicSiteUrl();
  const dashBase = adminDashboardBase();
  const bookingPath = `/dashboard/bookings/${bookingId}`;

  await sendEmailSafe({
    to: visitorEmail,
    subject: `Visit booked: ${propertyTitle}`,
    html: generateBookingUserConfirmationHtml({
      userName: visitorName,
      propertyTitle,
      visitDate: visitDateStr,
      listingsUrl,
    }),
  });

  if (!ownerUserId) return;
  const ownerIdStr = ownerUserId.toString();
  if (visitorUserId && visitorUserId.toString() === ownerIdStr) return;

  const owner = await User.findById(ownerUserId).select("email name").lean();
  if (!owner?.email) return;

  await sendEmailSafe({
    to: owner.email,
    subject: `New visit request: ${propertyTitle}`,
    html: generateBookingOwnerAlertHtml({
      ownerName: owner.name,
      visitorName,
      visitorEmail,
      propertyTitle,
      visitDate: visitDateStr,
      dashboardBookingUrl: `${dashBase}${bookingPath}`,
    }),
  });
}

export async function notifyBookingStatusEmail({
  userEmail,
  userName,
  propertyTitle,
  status,
  visitDateStr,
}) {
  if (!userEmail) return;
  const dashBase = adminDashboardBase();
  await sendEmailSafe({
    to: userEmail,
    subject: `Booking update: ${status} — ${propertyTitle}`,
    html: generateBookingStatusEmailHtml({
      userName,
      propertyTitle,
      status,
      visitDate: visitDateStr,
      dashboardUrl: `${dashBase}/dashboard/bookings`,
    }),
  });
}

export async function notifyVisitCancelledEmails({
  visitorEmail,
  visitorName,
  visitorUserId,
  ownerUserId,
  propertyTitle,
  visitDateStr,
}) {
  if (visitorEmail) {
    await sendEmailSafe({
      to: visitorEmail,
      subject: `Cancelled visit: ${propertyTitle}`,
      html: generateVisitCancelledUserHtml({
        userName: visitorName,
        propertyTitle,
        visitDate: visitDateStr,
      }),
    });
  }

  if (!ownerUserId) return;
  const ownerIdStr = ownerUserId.toString();
  if (visitorUserId && visitorUserId.toString() === ownerIdStr) return;

  const owner = await User.findById(ownerUserId).select("email name").lean();
  if (!owner?.email) return;

  await sendEmailSafe({
    to: owner.email,
    subject: `Visit cancelled: ${propertyTitle}`,
    html: generateVisitCancelledOwnerHtml({
      ownerName: owner.name,
      visitorName,
      propertyTitle,
      visitDate: visitDateStr,
    }),
  });
}
