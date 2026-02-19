'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [created, setCreated] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Use to create an account");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          username: username || undefined,
          email, 
          password 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setCreated(true);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email!</h1>
            <p className="text-slate-400 mb-6">
              We&apos;ve sent a verification link to <strong className="text-white">{email}</strong>.
              Click the link to verify your account and start using AviationHub.
            </p>
            <div className="space-y-3">
              <a 
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition-all hover:bg-emerald-400"
              >
                Open Gmail
              </a>
              <button
                onClick={() => router.push("/login")}
                className="block w-full text-center text-slate-400 hover:text-white py-2"
              >
                Go to Login
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Didn&apos;t receive it?{' '}
              <Link href="/verify-email" className="text-emerald-400 hover:underline">
                Resend verification email
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="mt-2 text-slate-400">Get started with AviationHub</p>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="mt-8 space-y-4"
            autoComplete="on"
          >
            {error && (
              <div 
                className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <div>
              <label 
                htmlFor="fullName" 
                className="block text-sm font-medium text-slate-300"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="John Doe"
                autoComplete="name"
                autoFocus
                aria-label="Full name"
              />
            </div>

            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-slate-300"
              >
                Username <span className="text-slate-500">(optional)</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="johndoe123"
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9]+"
                autoComplete="username"
                aria-label="Username - letters and numbers only"
                aria-describedby="username-help"
              />
              <p id="username-help" className="mt-1 text-xs text-slate-500">
                Letters and numbers only. Auto-generated if empty.
              </p>
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-required="true"
                aria-label="Email address"
                inputMode="email"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                aria-required="true"
                aria-label="Password - minimum 6 characters"
                aria-describedby="password-help"
              />
              <p id="password-help" className="mt-1 text-xs text-slate-500">
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition-all hover:bg-emerald-400 disabled:opacity-50"
              aria-label={loading ? "Creating account" : "Create account"}
              aria-busy={loading}
              aria-disabled={!agreedToTerms}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded"
                  aria-label="Agree to terms of use"
                  aria-required="true"
                />
                <span>
                  I acknowledge that this software is a financial and administrative tool only. 
                  I am the Pilot in Command (PIC) and am solely responsible for the safe operation 
                  of the aircraft and verifying all data with official sources.
                </span>
              </label>
            </div>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
