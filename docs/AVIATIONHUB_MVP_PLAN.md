# AviationHub MVP Implementation Plan

## Overview
Build a complete flying club management platform with pilot tools. MVP targets P0 features across two modules:
- **Module A**: Flying Club Management (Admin)
- **Module B**: Individual Pilot Platform

---

## Dependencies to Install
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction stripe resend pdfkit
```

---

## Database Schema Updates

### Existing Models (Extend)
```prisma
// User model - add fields
credits        Int        @default(0)
bfrExpiry      DateTime?
medicalExpiry  DateTime?
medicalClass   String?    // "1", "2", "3"

// ClubAircraft - add field
bookingWindowDays Int    @default(30)
```

### New Models
```prisma
model Invoice {
  id              String   @id @default(uuid())
  groupId         String
  userId         String
  billingRunId    String
  totalAmount    Decimal
  status         String   // "pending", "paid", "failed"
  stripePaymentId String?
  pdfUrl         String?
  sentAt         DateTime?
  createdAt      DateTime @default(now())
}

model InvoiceItem {
  id          String  @id @default(uuid())
  invoiceId   String
  flightLogId String
  aircraftId  String
  hobbsHours  Decimal
  hourlyRate  Decimal
  amount      Decimal
}

model BillingRun {
  id           String    @id @default(uuid())
  groupId      String
  startedAt    DateTime  @default(now())
  completedAt  DateTime?
  status       String    // "running", "completed", "failed"
  totalAmount  Decimal?
  successCount Int?
  failureCount Int?
  details      String?   // JSON with per-member results
}

model BlockOut {
  id          String   @id @default(uuid())
  groupId     String
  aircraftId  String?  // null = whole fleet
  title       String
  startTime   DateTime
  endTime     DateTime
  createdAt   DateTime @default(now())
}
```

---

## Phase 1: Foundation & Calendar (Days 1-2)

### 1.1 New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clubs/[id]/schedule` | Full calendar with all bookings |
| POST | `/api/clubs/[id]/blockouts` | Add block-out time |
| GET | `/api/clubs/[id]/blockouts` | List block-outs |
| DELETE | `/api/clubs/[id]/blockouts/[id]` | Remove block-out |

### 1.2 Booking API Updates (Existing)
- Add validation for booking window (max 30 days ahead, configurable)
- Add block-out conflict detection

### 1.3 UI Components to Create
- `components/club/BookingCalendar.tsx` - FullCalendar integration
- `components/club/BookingModal.tsx` - Create/edit booking
- `components/club/BlockOutModal.tsx` - Admin block times

---

## Phase 2: Hobbs Checkout (Days 2-3)

### 2.1 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clubs/[id]/flights/checkout` | Start flight - capture hobbsStart |
| POST | `/api/clubs/[id]/flights/checkin` | End flight - create FlightLog |
| GET | `/api/clubs/[id]/flights/active` | Get active flight |

### 2.2 Checkout Logic
```
Checkout:
1. Verify aircraft not already checked out
2. Verify no conflicting bookings at current time
3. Verify pilot is club member
4. Create pending FlightLog with hobbsStart + timestamp

Checkin:
1. Calculate hobbsTime = hobbsEnd - hobbsStart
2. Calculate cost = hobbsTime × aircraft.hourlyRate
3. Create FlightLog with all fields
4. Update ClubAircraft.totalHobbsHours
```

### 2.3 UI Components
- `components/club/CheckoutPanel.tsx` - Start/End flight buttons
- `components/club/ActiveFlightCard.tsx` - Current flight status

---

## Phase 3: Billing Engine (Days 3-4)

### 3.1 Library Files
- `lib/stripe.ts` - Stripe utilities
- `lib/billing.ts` - Billing run logic
- `lib/resend.ts` - Email utilities
- `lib/invoice.ts` - PDF generation

### 3.2 Billing Run Logic
```
1. Get all FlightLogs since lastBillingRun for club
2. Group by userId
3. Per user:
   a. Calculate total = Σ(hobbsTime × hourlyRate)
   b. Apply credits: total = total - user.credits
   c. Create Invoice + InvoiceItems
   d. Attempt Stripe charge
   e. If failed, mark as pending, log error
4. Record BillingRun with summary
5. Queue Resend emails for successful charges
```

### 3.3 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clubs/[id]/billing/run` | Trigger billing run |
| GET | `/api/clubs/[id]/billing/history` | List billing runs |
| GET | `/api/clubs/[id]/billing/invoices` | List invoices |

---

## Phase 4: Invoice Delivery (Days 4-5)

### 4.1 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clubs/[id]/invoices/[id]` | Get invoice PDF |
| POST | `/api/clubs/[id]/invoices/[id]/send` | Resend invoice email |

---

## Phase 5: Member Management (Days 5-6)

### 5.1 Existing API (Already exists)
- `/api/groups/[groupId]/members` - Already implemented with roles

### 5.2 New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clubs/[id]/members/invite` | Send invite email |
| GET | `/api/clubs/[id]/members/[mid]/flights` | View member flight history |

### 5.3 UI Components
- `components/club/MemberList.tsx` - Member table
- `components/club/InviteModal.tsx` - Invite form

---

## Phase 6: Pilot Dashboard & Currency (Days 6-7)

### 6.1 Database Updates
- Add `bfrExpiry`, `medicalExpiry`, `medicalClass` to User model

### 6.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me/dashboard` | Dashboard data |
| GET | `/api/me/currency` | Currency status |
| GET | `/api/me/notifications` | Alerts |

### 6.3 Currency Logic
```
VFR Day Currency: Count day landings in last 90 days, current if ≥ 3
VFR Night Currency: Count night landings in last 90 days, current if ≥ 3
BFR: Days until expiry, alert at 60/30/14 days
Medical: Days until expiry, alert at 30/14/7 days
```

### 6.4 UI Components
- `components/pilot/CurrencyBadge.tsx` - Status badge
- `components/pilot/DashboardStats.tsx` - Time totals

---

## Phase 7: Demo Data & Polish (Day 7)

### 7.1 Seed Script
Create realistic demo data:
- 2 flying clubs
- 5 aircraft (C172, PA-28, etc.)
- 10 members (admin/member/CFI roles)
- 20 bookings (past + future)
- 30 flight logs

---

## File Summary

### New API Routes (18 files)
```
app/api/clubs/[id]/schedule/route.ts
app/api/clubs/[id]/blockouts/route.ts
app/api/clubs/[id]/blockouts/[id]/route.ts
app/api/clubs/[id]/flights/checkout/route.ts
app/api/clubs/[id]/flights/checkin/route.ts
app/api/clubs/[id]/flights/active/route.ts
app/api/clubs/[id]/billing/run/route.ts
app/api/clubs/[id]/billing/history/route.ts
app/api/clubs/[id]/billing/invoices/route.ts
app/api/clubs/[id]/invoices/[id]/route.ts
app/api/clubs/[id]/invoices/[id]/send/route.ts
app/api/clubs/[id]/members/invite/route.ts
app/api/clubs/[id]/members/[mid]/flights/route.ts
app/api/me/dashboard/route.ts
app/api/me/currency/route.ts
app/api/me/notifications/route.ts
```

### New UI Components (12 files)
```
components/club/BookingCalendar.tsx
components/club/BookingModal.tsx
components/club/BlockOutModal.tsx
components/club/CheckoutPanel.tsx
components/club/ActiveFlightCard.tsx
components/club/MemberList.tsx
components/club/InviteModal.tsx
components/club/BillingRunButton.tsx
components/club/InvoiceList.tsx
components/pilot/CurrencyBadge.tsx
components/pilot/DashboardStats.tsx
components/pilot/NotificationList.tsx
```

### New Library Files (4 files)
```
lib/stripe.ts
lib/resend.ts
lib/invoice.ts
lib/billing.ts
```

### Scripts (1 file)
```
scripts/seed-demo.ts
```

---

## Manual Setup Required (Post-Implementation)

1. **Stripe Account**: Create Stripe account, get API keys
2. **Environment Variables**: Add to `.env`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
3. **Database Migration**: Run `npx prisma db push` after schema updates
4. **Resend Domain**: Verify domain for sending emails (or use AviationHub.com)

---

## Priority Order (P0 First)

### P0 Features (Must Have)
1. ✅ Member management (already exists)
2. Aircraft scheduling with calendar
3. Hobbs/tach checkout flow
4. Automated billing + Stripe
5. Invoice PDF + email
6. Digital logbook (already exists)
7. Currency tracking (BFR, medical, VFR)

### P1 Features (Should Have)
1. Currency enforcement (block booking if expired)
2. Squawk log
3. Maintenance intervals
4. Fleet overview

### P2 Features (Nice to Have)
1. Billing reports
2. Push notifications

---

## Status: Ready for Implementation

Awaiting go-ahead to begin building.
