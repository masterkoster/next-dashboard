'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!token || !email) {
      setMessage({ type: 'error', text: 'Invalid reset link. Please request a new password reset.' });
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password reset successful! Redirecting to dashboard...' });
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reset password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
      <p className="text-slate-400 mb-6">
        Enter your new password below.
      </p>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        autoComplete="on"
      >
        <div>
          <label 
            htmlFor="newPassword" 
            className="block text-sm font-medium text-slate-300 mb-1"
          >
            New Password
          </label>
          <input
            id="newPassword"
            name="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            autoFocus
            aria-required="true"
            aria-label="New password - minimum 6 characters"
            aria-describedby="new-password-help"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            placeholder="Enter new password"
          />
          <p id="new-password-help" className="mt-1 text-xs text-slate-500">
            Minimum 6 characters
          </p>
        </div>

        <div>
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium text-slate-300 mb-1"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            aria-required="true"
            aria-label="Confirm new password"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            placeholder="Confirm new password"
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

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
          aria-label={isLoading ? "Resetting password" : "Reset password"}
          aria-busy={isLoading}
          aria-disabled={!token}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
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
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
      <p className="text-slate-400">Loading...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
