'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setResetUrl(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to process request' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span>✈️</span>
            <span>Aviation</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-slate-400 mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            autoComplete="on"
          >
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                aria-required="true"
                aria-label="Email address for password reset"
                inputMode="email"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            {message && (
              <div 
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
                role="alert"
                aria-live="polite"
              >
                {message.text}
              </div>
            )}

            {resetUrl && (
              <div className="p-3 rounded-lg text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <p className="font-medium mb-1">Demo Mode - Reset Link:</p>
                <a 
                  href={resetUrl} 
                  className="text-blue-300 underline break-all text-xs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resetUrl}
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
              aria-label={isLoading ? "Sending reset link" : "Send password reset link"}
              aria-busy={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="text-sm text-slate-400 hover:text-slate-300"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
