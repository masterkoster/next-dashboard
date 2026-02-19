'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface VerificationBannerProps {
  email?: string | null;
}

export default function VerificationBanner({ email: propEmail }: VerificationBannerProps) {
  const { data: session, update } = useSession();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Get email from session or props
  const email = session?.user?.email || propEmail;

  // Don't show if already verified or no email
  if (session?.user?.emailVerified || !email) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        setError('Failed to send email. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-medium text-emerald-400">Verification email sent!</p>
            <p className="text-sm text-emerald-300/80">
              Check your inbox for the verification link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📧</span>
          <div>
            <p className="font-medium text-amber-400">Please verify your email</p>
            <p className="text-sm text-amber-200/80">
              You need to verify your email before you can save flight plans or training progress.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            onClick={handleResend}
            disabled={isSending}
            className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/30 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Resend Verification Email'}
          </button>
          
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-300/60 hover:text-amber-300"
          >
            Open Gmail →
          </a>
        </div>
      </div>
      
      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
