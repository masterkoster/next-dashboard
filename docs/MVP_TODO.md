# AviationHub MVP - Implementation Tracker

## Quick Reference

### Dependencies
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction stripe resend pdfkit
```

### Manual Setup Required
1. Create Stripe account, get API keys
2. Add env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`
3. Run `npx prisma db push` after schema updates

---

## Progress

### Phase 1: Foundation & Calendar ✅
- [x] Install dependencies
- [x] Update database schema
- [x] Create schedule API
- [x] Create blockouts API
- [x] Create BookingCalendar component

### Phase 2: Hobbs Checkout ✅
- [x] Create checkout API
- [x] Create checkin API
- [x] Create active flight API
- [x] Create CheckoutPanel component

### Phase 3: Billing Engine ✅
- [x] Create lib/stripe.ts
- [x] Create lib/billing.ts
- [x] Create lib/resend.ts
- [x] Create billing/run API

### Phase 4: Invoice Delivery ✅
- [x] Create lib/invoice.ts

### Phase 5: Member Management ⏳
- [ ] Create members/invite API
- [ ] Create members/[id]/flights API
- [ ] Create MemberList component
- [ ] Create InviteModal component

### Phase 6: Pilot Dashboard & Currency ✅
- [x] Add bfrExpiry/medicalExpiry to User
- [x] Create /me/dashboard API
- [x] Create /me/currency API
- [x] Create CurrencyBadge component

### Phase 7: Demo Data & Polish ⏳
- [x] Create scripts/seed-demo.ts
- [ ] Test full flow
- [ ] Mobile responsive testing

### Integration Progress
- [x] Embed BookingCalendar, CheckoutPanel, MemberList, BillingRunButton into Flying Club module tabs

---

## Files Created

### API Routes (8/18)
- [x] app/api/clubs/[id]/schedule/route.ts
- [x] app/api/clubs/[id]/blockouts/route.ts
- [ ] app/api/clubs/[id]/blockouts/[id]/route.ts
- [x] app/api/clubs/[id]/flights/checkout/route.ts
- [x] app/api/clubs/[id]/flights/checkin/route.ts
- [x] app/api/clubs/[id]/flights/active/route.ts
- [x] app/api/clubs/[id]/billing/run/route.ts
- [ ] app/api/clubs/[id]/billing/history/route.ts
- [ ] app/api/clubs/[id]/billing/invoices/route.ts
- [ ] app/api/clubs/[id]/invoices/[id]/route.ts
- [ ] app/api/clubs/[id]/invoices/[id]/send/route.ts
- [ ] app/api/clubs/[id]/members/invite/route.ts
- [ ] app/api/clubs/[id]/members/[mid]/flights/route.ts
- [x] app/api/me/dashboard/route.ts
- [x] app/api/me/currency/route.ts
- [ ] app/api/me/notifications/route.ts

### UI Components (3/12)
- [x] components/club/BookingCalendar.tsx
- [ ] components/club/BookingModal.tsx
- [ ] components/club/BlockOutModal.tsx
- [x] components/club/CheckoutPanel.tsx
- [ ] components/club/ActiveFlightCard.tsx
- [ ] components/club/MemberList.tsx
- [ ] components/club/InviteModal.tsx
- [ ] components/club/BillingRunButton.tsx
- [ ] components/club/InvoiceList.tsx
- [x] components/pilot/CurrencyBadge.tsx
- [ ] components/pilot/DashboardStats.tsx
- [ ] components/pilot/NotificationList.tsx

### Library Files (4/4)
- [x] lib/stripe.ts
- [x] lib/resend.ts
- [x] lib/invoice.ts
- [x] lib/billing.ts

### Scripts (1/1)
- [x] scripts/seed-demo.ts

---

## Last Updated
2026-02-24
