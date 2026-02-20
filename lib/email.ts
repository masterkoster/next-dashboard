import { Resend } from 'resend';
import { 
  verificationEmailTemplate, 
  resetPasswordEmailTemplate 
} from './email-templates';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

const APP_NAME = 'AviationHub';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function getFromAddress() {
  const fromEnv = process.env.RESEND_FROM;
  if (fromEnv && fromEnv.includes('@')) return fromEnv;

  const domain = process.env.RESEND_DOMAIN;
  if (domain) {
    return `${APP_NAME} <noreply@${domain}>`;
  }

  // Resend default sender for unverified domains.
  return `${APP_NAME} <onboarding@resend.dev>`;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Send a verification email to a new user
 */
export async function sendVerificationEmail(
  email: string, 
  token: string,
  username: string
): Promise<SendEmailResult> {
  // Link to API endpoint which verifies then redirects to success page
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  try {
    if (!resendApiKey) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: `Verify your email - ${APP_NAME}`,
      html: verificationEmailTemplate(verifyUrl, username),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Failed to send verification email:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string, 
  token: string,
  username: string
): Promise<SendEmailResult> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  
  try {
    if (!resendApiKey) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: `Reset your password - ${APP_NAME}`,
      html: resetPasswordEmailTemplate(resetUrl, username),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Failed to send password reset email:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Generic send email function for future use
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  try {
    if (!resendApiKey) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}
