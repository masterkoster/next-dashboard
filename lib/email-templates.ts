const APP_NAME = 'AviationHub';
const PRIMARY_COLOR = '#10b981'; // emerald-500
const BG_COLOR = '#0f172a'; // slate-900

/**
 * Base email template wrapper
 */
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${APP_NAME}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${BG_COLOR}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BG_COLOR}; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 500px; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
              
              <!-- Header -->
              <tr>
                <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #334155;">
                  <div style="font-size: 32px; margin-bottom: 8px;">✈️</div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f8fafc;">
                    ${APP_NAME}
                  </h1>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #94a3b8;">
                    Flight Planning & Aviation Tools
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 32px 40px;">
                  ${content}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px 32px; text-align: center; border-top: 1px solid #334155;">
                  <p style="margin: 0; font-size: 12px; color: #64748b;">
                    © ${new Date().getFullYear()} ${APP_NAME}. Built by pilots, for pilots.
                  </p>
                  <p style="margin: 8px 0 0; font-size: 11px; color: #475569;">
                    🔒 We never sell your data. No ads. No BS.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Email verification template
 */
export function verificationEmailTemplate(verifyUrl: string, username: string): string {
  const content = `
    <p style="margin: 0 0 8px; font-size: 16px; color: #f8fafc;">
      Hey ${username || 'there'},
    </p>
    <p style="margin: 0 0 24px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
      Thanks for signing up for ${APP_NAME}! Click the button below to verify your email address and start planning your flights.
    </p>
    
    <a href="${verifyUrl}" style="display: inline-block; background-color: ${PRIMARY_COLOR}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
      Verify Email Address
    </a>
    
    <p style="margin: 24px 0 0; font-size: 13px; color: #64748b;">
      This link will expire in <strong style="color: #94a3b8;">24 hours</strong>.
    </p>
    
    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px dashed #334155;">
      <p style="margin: 0; font-size: 12px; color: #475569;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 8px 0 0; font-size: 11px; color: #64748b; word-break: break-all;">
        ${verifyUrl}
      </p>
    </div>
    
    <p style="margin: 24px 0 0; font-size: 12px; color: #475569;">
      Didn't create an account? You can safely ignore this email.
    </p>
  `;
  
  return baseTemplate(content);
}

/**
 * Password reset template
 */
export function resetPasswordEmailTemplate(resetUrl: string, username: string): string {
  const content = `
    <p style="margin: 0 0 8px; font-size: 16px; color: #f8fafc;">
      Hey ${username || 'there'},
    </p>
    <p style="margin: 0 0 24px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
      We received a request to reset your password for ${APP_NAME}. Click the button below to create a new password.
    </p>
    
    <a href="${resetUrl}" style="display: inline-block; background-color: ${PRIMARY_COLOR}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
      Reset Password
    </a>
    
    <p style="margin: 24px 0 0; font-size: 13px; color: #64748b;">
      This link will expire in <strong style="color: #94a3b8;">1 hour</strong> for your security.
    </p>
    
    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px dashed #334155;">
      <p style="margin: 0; font-size: 12px; color: #475569;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 8px 0 0; font-size: 11px; color: #64748b; word-break: break-all;">
        ${resetUrl}
      </p>
    </div>
    
    <p style="margin: 24px 0 0; font-size: 12px; color: #475569;">
      Didn't request a password reset? You can safely ignore this email. Your password will remain unchanged.
    </p>
  `;
  
  return baseTemplate(content);
}

/**
 * Welcome email template (after verification)
 */
export function welcomeEmailTemplate(username: string): string {
  const content = `
    <p style="margin: 0 0 8px; font-size: 16px; color: #f8fafc;">
      Welcome to ${APP_NAME}, ${username}! 🎉
    </p>
    <p style="margin: 0 0 24px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
      Your email is verified and you're all set. Here's what you can do:
    </p>
    
    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #f8fafc;">⛽ <strong>Fuel Saver</strong></p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">Find the cheapest fuel along your route</p>
    </div>
    
    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #f8fafc;">✈️ <strong>Flying Club</strong></p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">Manage aircraft, bookings, and members</p>
    </div>
    
    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #f8fafc;">🧮 <strong>E6B Calculator</strong></p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">Wind correction, fuel burn, conversions</p>
    </div>
    
    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #f8fafc;">🎓 <strong>Training Tracker</strong></p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">Track your PPL progress</p>
    </div>
    
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/modules/fuel-saver" style="display: inline-block; margin-top: 24px; background-color: ${PRIMARY_COLOR}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
      Start Planning
    </a>
    
    <p style="margin: 24px 0 0; font-size: 12px; color: #475569;">
      Blue skies! ✈️
    </p>
  `;
  
  return baseTemplate(content);
}
