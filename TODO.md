# AviationHub Development Todo List

## Format
Each entry should have:
- [ ] Task description
- Status: pending | in_progress | completed
- Priority: low | medium | high
- Notes: Any additional context

---

## COMPLETED ✅

### Email Verification System
- [x] Update Prisma schema - add emailVerified, verifyToken, username fields
  - Status: completed
  - Priority: high
  - Notes: All fields added and migrated

- [x] Create lib/email.ts - Resend email utility
  - Status: completed
  - Priority: high
  - Notes: Uses Resend API, free tier

- [x] Create lib/email-templates.ts - HTML email templates
  - Status: completed
  - Priority: high
  - Notes: Dark theme matching app design

- [x] Create /api/auth/verify-email route
  - Status: completed
  - Priority: high
  - Notes: Handles token verification, redirects to welcome page

- [x] Create /api/auth/resend-verification route
  - Status: completed
  - Priority: high
  - Notes: Allows resending verification emails

- [x] Create /verify-email page
  - Status: completed
  - Priority: high
  - Notes: Shows error states, handles resend

- [x] Create /welcome page
  - Status: completed
  - Priority: high
  - Notes: Post-verification welcome with dashboard intro

- [x] Update signup route - username, send verification email
  - Status: completed
  - Priority: high
  - Notes: Username now required, sends verification email

- [x] Update forgot-password route - send actual email
  - Status: completed
  - Priority: high
  - Notes: Integrated with Resend

- [x] Update login/auth to use username instead of email
  - Status: completed
  - Priority: high
  - Notes: Username is primary login method

- [x] Block saves in flight-plans API for unverified users
  - Status: completed
  - Priority: high
  - Notes: Returns 403 with EMAIL_NOT_VERIFIED code

- [x] Block saves in training-progress API for unverified users
  - Status: completed
  - Priority: high
  - Notes: Returns 403 with EMAIL_NOT_VERIFIED code

- [x] Create VerificationBanner component
  - Status: completed
  - Priority: medium
  - Notes: Shows on Fuel Saver and Training pages

- [x] Add verification banner to Fuel Saver page
  - Status: completed
  - Priority: medium
  - Notes: Visible to unverified users only

- [x] Run database migration
  - Status: completed
  - Priority: high
  - Notes: 12 users migrated, all verified

### Authentication Improvements
- [x] Make username required (not optional)
  - Status: completed
  - Priority: high
  - Notes: Schema updated, signup validates uniqueness

- [x] Add persistent login (Remember Me)
  - Status: completed
  - Priority: high
  - Notes: 30 days with secure cookies, sliding window

- [x] Add CSRF protection
  - Status: completed
  - Priority: high
  - Notes: Secure cookie configuration

- [x] Add proper session security
  - Status: completed
  - Priority: high
  - Notes: httpOnly, secure, sameSite cookies

---

## PENDING ⏳

### Pro+ Tier Features ($6.99/mo)

- [x] Add Pro+ tier to pricing page
  - Status: completed
  - Priority: high
  - Notes: 3-tier pricing with Pro+ at $6.99

- [x] Update pricing comparison table
  - Status: completed
  - Priority: high
  - Notes: Shows Free vs Pro vs Pro+ with all features

#### Pro+ Specific Features:
- [x] Digital Logbook
  - Status: completed
  - Priority: high
  - Notes: Full logbook with stats, requires Pro+ tier, DB table created

- [ ] Currency Tracking
  - Status: pending
  - Priority: medium
  - Notes: BFR, IPC, night currency (90 days), XC currency

- [ ] Hour Analytics
  - Status: pending
  - Priority: medium
  - Notes: Visual charts showing hours over time

- [ ] Calendar Sync
  - Status: pending
  - Priority: low
  - Notes: Google/Apple calendar integration

- [ ] Post-Flight Playback
  - Status: pending
  - Priority: low
  - Notes: Store GPS points during flight, replay on map

### Payment Integration
- [ ] Stripe payment setup
  - Status: pending
  - Priority: high
  - Notes: Need Stripe account and API keys

- [ ] Checkout flow
  - Status: pending
  - Priority: high
  - Notes: Stripe Checkout or Elements

- [ ] Webhook handling
  - Status: pending
  - Priority: high
  - Notes: Handle successful payments, update user tier

---

## IDEAS 💡

### Potential Future Features
- Lifetime plan ($199 one-time)
- Teams/Flying Club tier ($9.99/mo)
- Flight School tier ($24.99/mo)
- Document storage (removed from Pro+)
- Live GPS tracking during flight
- Weather radar overlay
- AI route optimization (requires API costs)
- FAA flight plan filing

---

## NOTES 📝

### Current Pricing Structure
| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 6 waypoints, 5 plans, basics |
| Pro | $3.99/mo | Unlimited + exports |
| Pro+ | $6.99/mo | Logbook, analytics, sharing |

### Costs
- Resend: $0 (3,000 emails/day free)
- Database: $0 (existing Azure)
- Hosting: $0 (Vercel free tier)

### Domain
- Main: koster.im
- Emails: noreply@koster.im

---

Last Updated: 2026-02-19
