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
  - Notes: Handles token verification

- [x] Create /api/auth/resend-verification route
  - Status: completed
  - Priority: high
  - Notes: Allows resending verification emails

- [x] Create /verify-email page
  - Status: completed
  - Priority: high
  - Notes: Shows success/error states

- [x] Update signup route - username, send verification email
  - Status: completed
  - Priority: high
  - Notes: Auto-generates username if not provided

- [x] Update forgot-password route - send actual email
  - Status: completed
  - Priority: high
  - Notes: Integrated with Resend

- [x] Update login/auth to use username instead of email
  - Status: completed
  - Priority: high
  - Notes: Backward compatible with email

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

---

## PENDING ⏳

### Pro+ Tier Features ($6.99/mo)

- [ ] Add Pro+ tier to pricing page
  - Status: pending
  - Priority: high
  - Notes: Position between Pro ($3.99) and potential higher tiers

- [ ] Update pricing comparison table
  - Status: pending
  - Priority: high
  - Notes: Show Free vs Pro vs Pro+ features

#### Pro+ Specific Features:
- [ ] Digital Logbook
  - Status: pending
  - Priority: medium
  - Notes: Auto-log flights from saved plans, track totals by type

- [ ] Currency Tracking
  - Status: pending
  - Priority: medium
  - Notes: BFR, IPC, night currency (90 days), XC currency

- [ ] Hour Analytics & Graphs
  - Status: pending
  - Priority: medium
  - Notes: Visual charts showing hours over time, by type

- [ ] Export to More Formats
  - Status: pending
  - Priority: low
  - Notes: CSV, JSON, GPX already done - add more?

- [ ] Calendar Sync
  - Status: pending
  - Priority: low
  - Notes: Google/Apple calendar integration

- [ ] Post-Flight Playback
  - Status: pending
  - Priority: low
  - Notes: Store GPS points during flight, replay on map

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
