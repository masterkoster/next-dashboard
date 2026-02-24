import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendInvoiceEmailParams {
  to: string;
  clubName: string;
  memberName: string;
  totalAmount: number;
  invoiceId: string;
  pdfBuffer?: Buffer;
}

export async function sendInvoiceEmail({
  to,
  clubName,
  memberName,
  totalAmount,
  invoiceId,
  pdfBuffer,
}: SendInvoiceEmailParams) {
  if (!resend) {
    console.log('Resend not configured - would send email to:', to);
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'AviationHub Billing <billing@aviationhub.com>',
      to,
      subject: `${clubName} - Invoice #${invoiceId.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Monthly Invoice</h2>
          <p>Hi ${memberName},</p>
          <p>Your invoice from ${clubName} is ready.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 24px; font-weight: bold;">$${totalAmount.toFixed(2)}</p>
          </div>
          <p>Log in to AviationHub to view your full invoice details and flight history.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Thanks for flying with us!
          </p>
        </div>
      `,
      attachments: pdfBuffer ? [{
        filename: `invoice-${invoiceId.slice(0, 8)}.pdf`,
        content: pdfBuffer.toString('base64'),
      }] : undefined,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(to: string, name: string, clubName: string) {
  if (!resend) {
    console.log('Resend not configured - would send welcome email to:', to);
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'AviationHub <welcome@aviationhub.com>',
      to,
      subject: `Welcome to ${clubName}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${clubName}!</h2>
          <p>Hi ${name},</p>
          <p>You've been added as a member. You can now:</p>
          <ul>
            <li>Book aircraft through our scheduling system</li>
            <li>Log your flights and track your hours</li>
            <li>View your billing and invoices</li>
          </ul>
          <p>Log in to get started!</p>
        </div>
      `,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function sendCurrencyAlertEmail(
  to: string,
  name: string,
  alertType: string,
  daysRemaining: number
) {
  if (!resend) {
    console.log('Resend not configured - would send alert to:', to);
    return { success: false, error: 'Resend not configured' };
  }

  const urgency = daysRemaining <= 14 ? 'URGENT' : 'Reminder';
  
  try {
    const result = await resend.emails.send({
      from: 'AviationHub <alerts@aviationhub.com>',
      to,
      subject: `${urgency}: ${alertType} expires in ${daysRemaining} days`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Currency Alert</h2>
          <p>Hi ${name},</p>
          <p>Your <strong>${alertType}</strong> will expire in <strong>${daysRemaining} days</strong>.</p>
          <p>Please ensure you complete any required items before expiration to maintain your currency.</p>
          <p>Log in to AviationHub for more details.</p>
        </div>
      `,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send currency alert:', error);
    return { success: false, error };
  }
}
