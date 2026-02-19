'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    if (success === 'verified') {
      setStatus('success');
      setMessage('Your email has been verified! You can now sign in and start planning flights.');
    } else if (success === 'already-verified') {
      setStatus('success');
      setMessage('Your email is already verified. You can sign in anytime.');
    } else if (error === 'missing-params') {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    } else if (error === 'user-not-found') {
      setStatus('error');
      setMessage('Account not found. Please sign up first.');
    } else if (error === 'invalid-token') {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new one.');
    } else if (error === 'token-expired') {
      setStatus('error');
      setMessage('Verification link expired. Please request a new one.');
    } else if (error === 'server-error') {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    } else {
      // No params - this is the initial page load
      setStatus('loading');
    }
  }, [success, error, emailParam]);

  const handleResend = async () => {
    if (!email) {
      const emailInput = prompt('Enter your email address:');
      if (emailInput) {
        setEmail(emailInput);
        await resendEmail(emailInput);
      }
    } else {
      await resendEmail(email);
    }
  };

  const resendEmail = async (emailAddress: string) => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress }),
      });

      if (res.ok) {
        alert('Verification email sent! Check your inbox.');
      } else {
        alert('Failed to send email. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="text-6xl mb-6">
            {status === 'loading' && '📧'}
            {status === 'success' && '✅'}
            {status === 'error' && '❌'}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            {status === 'loading' && 'Check Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-slate-400 mb-6">
            {message || 'We sent you a verification link. Click the link in your email to verify your account.'}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={() => signIn()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Sign In
              </button>
            )}

            {status === 'error' && (
              <button
                onClick={handleResend}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Resend Verification Email
              </button>
            )}

            <Link
              href="/"
              className="block w-full text-center text-slate-400 hover:text-white py-2 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Didn&apos;t receive an email? Check your spam folder or{' '}
          <button onClick={handleResend} className="text-emerald-400 hover:underline">
            request a new one
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-6">📧</div>
            <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
            <p className="text-slate-400">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
