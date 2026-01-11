export const generateEmailTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  planName,
  price,
  paymentMethod,
  accountSettingsLink,
  supportLink,
  daysLeft,
}) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f7fa;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="background-color: #4a90e2; text-align: center;">
                <p style="font-size: 54px; line-height: 54px; font-weight: 800;">SubDub</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">                
                <p style="font-size: 16px; margin-bottom: 25px;">Hello <strong style="color: #4a90e2;">${userName}</strong>,</p>
                
                <p style="font-size: 16px; margin-bottom: 25px;">Your <strong>${subscriptionName}</strong> subscription is set to renew on <strong style="color: #4a90e2;">${renewalDate}</strong> (${daysLeft} days from today).</p>
                
                <table cellpadding="15" cellspacing="0" border="0" width="100%" style="background-color: #f0f7ff; border-radius: 10px; margin-bottom: 25px;">
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d0e3ff;">
                            <strong>Plan:</strong> ${planName}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d0e3ff;">
                            <strong>Price:</strong> ${price}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px;">
                            <strong>Payment Method:</strong> ${paymentMethod}
                        </td>
                    </tr>
                </table>
                
                <p style="font-size: 16px; margin-bottom: 25px;">If you'd like to make changes or cancel your subscription, please visit your <a href="${accountSettingsLink}" style="color: #4a90e2; text-decoration: none;">account settings</a> before the renewal date.</p>
                
                <p style="font-size: 16px; margin-top: 30px;">Need help? <a href="${supportLink}" style="color: #4a90e2; text-decoration: none;">Contact our support team</a> anytime.</p>
                
                <p style="font-size: 16px; margin-top: 30px;">
                    Best regards,<br>
                    <strong>The SubDub Team</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f7ff; padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0 0 10px;">
                    SubDub Inc. | 123 Main St, Anytown, AN 12345
                </p>
                <p style="margin: 0;">
                    <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
                    <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
                    <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </p>
            </td>
        </tr>
    </table>
</div>
`;
export const generateForgotPasswordTemplate = ({ userName, resetLink }) => `
<div style="background-color: #f1f5f9; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
    
    <tr>
      <td style="padding: 40px 40px 20px 40px; text-align: left;">
        <div style="color: #4f46e5; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; border-left: 4px solid #4f46e5; padding-left: 15px;">
          PROPERTY BULBUL
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding: 20px 40px 40px 40px;">
        <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #0f172a;">Password Reset Request</h1>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
          Hello ${userName},<br><br>
          We received a request to reset the password for your Property Bulbul account. To proceed with the update, please click the secure button below:
        </p>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                Reset My Password
              </a>
            </td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: top; padding-right: 12px; font-size: 18px;">🛡️</td>
              <td>
                <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                  <strong>Security Alert:</strong> This link will expire in <strong>15 minutes</strong> for your protection. If you did not initiate this request, no further action is required; your account remains secure.
                </p>
              </td>
            </tr>
          </table>
        </div>

        <p style="margin: 32px 0 8px; font-size: 13px; color: #94a3b8; text-align: center;">
          Trouble clicking the button? Copy and paste the URL below into your browser:
        </p>
        <p style="margin: 0; font-size: 12px; color: #6366f1; word-break: break-all; text-align: center; background: #fdfdfd; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 4px;">
          ${resetLink}
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #475569; font-weight: 600;">Property Bulbul</p>
        <p style="margin: 0 0 24px; font-size: 13px; color: #94a3b8;">Smart Real Estate Management, Simplified</p>
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="font-size: 12px; color: #cbd5e1;">
              &copy; 2026 Property Bulbul | Sandeep Saini
            </td>
          </tr>
        </table>
        
        <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.4;">
          This is a mandatory system notification regarding your account security.<br>
          Please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</div>
`;

export const emailTemplates = [
  {
    label: "7 days before reminder",
    generateSubject: (data) =>
      `📅 Reminder: Your ${data.subscriptionName} Subscription Renews in 7 Days!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 7 }),
  },
  {
    label: "5 days before reminder",
    generateSubject: (data) =>
      `⏳ ${data.subscriptionName} Renews in 5 Days – Stay Subscribed!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 5 }),
  },
  {
    label: "2 days before reminder",
    generateSubject: (data) =>
      `🚀 2 Days Left!  ${data.subscriptionName} Subscription Renewal`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 2 }),
  },
  {
    label: "1 days before reminder",
    generateSubject: (data) =>
      `⚡ Final Reminder: ${data.subscriptionName} Renews Tomorrow!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 1 }),
  },
  {
    label: "forgot-password",
    generateSubject: () => "🔐 Reset Your Password - Tricity Real Estate",
    generateBody: (data) => generateForgotPasswordTemplate(data),
  },
];
