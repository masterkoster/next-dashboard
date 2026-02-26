'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plane } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<'pilot' | 'mechanic'>('pilot');
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
          password,
          role: accountType === 'mechanic' ? 'mechanic' : 'user',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check for existing email/username and auto-redirect to login
        if (data.error?.toLowerCase().includes('email already exists')) {
          setError("Email already registered. Redirecting to login...");
          setTimeout(() => router.push('/login'), 2000);
          setLoading(false);
          return;
        }
        if (data.error?.toLowerCase().includes('username already taken')) {
          setError("Username already taken. Please choose another.");
          setLoading(false);
          return;
        }
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
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email!</h1>
            <p className="text-muted-foreground mb-6">
              We&apos;ve sent a verification link to <strong className="text-foreground">{email}</strong>.
              Click the link to verify your account and start using AviationHub.
            </p>
            <div className="space-y-3">
              <a 
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Open Gmail
              </a>
              <button
                onClick={() => router.push("/login")}
                className="block w-full text-center text-muted-foreground hover:text-foreground py-2"
              >
                Go to Login
              </button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Didn&apos;t receive it?{' '}
              <Link href="/verify-email" className="text-primary hover:underline">
                Resend verification email
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-foreground">AviationHub</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="mt-2 text-muted-foreground">Get started with AviationHub</p>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="mt-8 space-y-4"
            autoComplete="on"
          >
            <div>
              <label className="block text-sm font-medium text-foreground">Account type</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('pilot')}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    accountType === 'pilot'
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  Pilot
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('mechanic')}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    accountType === 'mechanic'
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  Mechanic
                </button>
              </div>
            </div>
            {error && (
              <div 
                className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <div>
              <label 
                htmlFor="fullName" 
                className="block text-sm font-medium text-foreground"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="John Doe"
                autoComplete="name"
                autoFocus
                aria-label="Full name"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground"
              >
                Username <span className="text-destructive">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="johndoe123"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9]+"
                autoComplete="username"
                aria-required="true"
                aria-label="Username - letters and numbers only"
                aria-describedby="username-help"
              />
              <p id="username-help" className="mt-1 text-xs text-muted-foreground">
                Letters and numbers only. This is what you&apos;ll use to log in.
              </p>
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                aria-required="true"
                aria-label="Password - minimum 6 characters"
                aria-describedby="password-help"
              />
              <p id="password-help" className="mt-1 text-xs text-muted-foreground">
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              aria-label={loading ? "Creating account" : "Create account"}
              aria-busy={loading}
              aria-disabled={!agreedToTerms}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
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

          <p className="mt-6 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
