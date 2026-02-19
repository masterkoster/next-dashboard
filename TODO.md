# AviationHub Development Todo List

## Format
Each entry should have:
- [ ] Task description
- Status: pending | in_progress | completed | on_hold | skipped
- Priority: low | medium | high
- Notes: Any additional context

---

## ✅ PHASE 1 COMPLETE - Core Platform

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

## ✅ PHASE 2 COMPLETE - Pro+ Features

### Pricing & Tiers
- [x] Add Pro+ tier to pricing page
  - Status: completed
  - Priority: high
  - Notes: 3-tier pricing with Pro+ at $6.99

- [x] Update pricing comparison table
  - Status: completed
  - Priority: high
  - Notes: Shows Free vs Pro vs Pro+ with all features

### Pro+ Features ($6.99/mo)
- [x] Digital Logbook
  - Status: completed
  - Priority: high
  - Notes: Full logbook with stats, requires Pro+ tier, DB table created

- [x] Currency Tracking
  - Status: completed
  - Priority: medium
  - Notes: Tracks BFR, IPC, night, passenger currency with visual status

- [x] Hour Analytics
  - Status: completed
  - Priority: medium
  - Notes: Bar charts, monthly breakdown, interactive type selector

- [x] Pro+ Dashboard
  - Status: completed
  - Priority: high
  - Notes: Unified dashboard combining all Pro+ features

---

## 🚧 IN PROGRESS

### Active Development
- [x] Weather Radar Module
  - Status: completed
  - Priority: high
  - Notes: Real-time precipitation radar with Leaflet map, layer controls, animation

- [ ] Calendar Sync
  - Status: in_progress
  - Priority: medium
  - Notes: Google/Apple calendar integration for flight scheduling

- [ ] Post-Flight Playback
  - Status: pending
  - Priority: medium
  - Notes: GPS track recording and replay on map

### Payment (Skipped for Now)
- [ ] Stripe payment setup
  - Status: skipped
  - Priority: low
  - Notes: Skipped per user request - can add when ready to monetize

- [ ] Checkout flow
  - Status: skipped
  - Priority: low
  - Notes: Depends on Stripe setup

- [ ] Webhook handling
  - Status: skipped
  - Priority: low
  - Notes: Depends on Stripe setup

---

## 💡 IDEAS - Potential Future Features

### Additional Tiers
- Lifetime plan ($199 one-time)
- Teams/Flying Club tier ($9.99/mo)
- Flight School tier ($24.99/mo)

### Advanced Features
- Document storage (POH, insurance scans)
- Live GPS tracking during flight
- Weather radar overlay on maps
- AI route optimization (requires API costs)
- FAA flight plan filing integration
- Multi-engine aircraft support
- Checklist builder
- Weight & Balance advanced mode

---

## 📊 PROJECT STATUS

### ✅ COMPLETED: 95%
All core features and Pro+ functionality are built and working.

### 🚀 READY FOR:
- User testing
- Bug fixes
- Performance optimization
- Content/marketing copy
- Stripe integration (when ready)

### 📦 CURRENT FEATURES:
**Free Tier:**
- Fuel Saver (6 waypoints, 5 plans)
- E6B Flight Computer
- Training Tracker
- Weight & Balance
- NOTAMs & Weather
- Basic exports (GPX, PDF, ForeFlight)

**Pro ($3.99/mo):**
- Everything in Free
- Unlimited waypoints & plans
- Unlimited clubs & aircraft
- All 50 states fuel prices
- Priority support

**Pro+ ($6.99/mo):**
- Everything in Pro
- Digital Logbook with stats
- Currency Tracking (BFR, IPC, etc.)
- Hour Analytics with charts
- Pro+ Dashboard
- Premium support

---

## 📝 NOTES

### Current Pricing Structure
| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 6 waypoints, 5 plans, basics |
| Pro | $3.99/mo | Unlimited + exports |
| Pro+ | $6.99/mo | Logbook, analytics, sharing |

### Monthly Costs
- Resend: $0 (3,000 emails/day free)
- Database: $0 (existing Azure)
- Hosting: $0 (Vercel free tier)
- **Total: $0/month**

### Domain
- Main: koster.im
- Emails: noreply@koster.im

---

Last Updated: 2026-02-19
Status: Phase 1 & 2 Complete ✅
