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

### Phase 1: Foundation & Calendar ⏳
- [ ] Install dependencies
- [ ] Update database schema
- [ ] Create schedule API
- [ ] Create blockouts API
- [ ] Create BookingCalendar component
- [ ] Create BookingModal component
- [ ] Create BlockOutModal component

### Phase 2: Hobbs Checkout ⏳
- [ ] Create checkout API
- [ ] Create checkin API
- [ ] Create active flight API
- [ ] Create CheckoutPanel component
- [ ] Create ActiveFlightCard component

### Phase 3: Billing Engine ⏳
- [ ] Create lib/stripe.ts
- [ ] Create lib/billing.ts
- [ ] Create lib/resend.ts
- [ ] Create billing/run API
- [ ] Create billing/history API
- [ ] Create billing/invoices API

### Phase 4: Invoice Delivery ⏳
- [ ] Create lib/invoice.ts
- [ ] Create invoices/[id] API
- [ ] Create invoices/[id]/send API

### Phase 5: Member Management ⏳
- [ ] Create members/invite API
- [ ] Create members/[id]/flights API
- [ ] Create MemberList component
- [ ] Create InviteModal component

### Phase 6: Pilot Dashboard & Currency ⏳
- [ ] Add bfrExpiry/medicalExpiry to User
- [ ] Create /me/dashboard API
- [ ] Create /me/currency API
- [ ] Create /me/notifications API
- [ ] Create CurrencyBadge component
- [ ] Create DashboardStats component
- [ ] Create NotificationList component

### Phase 7: Demo Data & Polish ⏳
- [ ] Create scripts/seed-demo.ts
- [ ] Test full flow
- [ ] Mobile responsive testing

---

## Files Created

### API Routes (0/18)
- [ ] app/api/clubs/[id]/schedule/route.ts
- [ ] app/api/clubs/[id]/blockouts/route.ts
- [ ] app/api/clubs/[id]/blockouts/[id]/route.ts
- [ ] app/api/clubs/[id]/flights/checkout/route.ts
- [ ] app/api/clubs/[id]/flights/checkin/route.ts
- [ ] app/api/clubs/[id]/flights/active/route.ts
- [ ] app/api/clubs/[id]/billing/run/route.ts
- [ ] app/api/clubs/[id]/billing/history/route.ts
- [ ] app/api/clubs/[id]/billing/invoices/route.ts
- [ ] app/api/clubs/[id]/invoices/[id]/route.ts
- [ ] app/api/clubs/[id]/invoices/[id]/send/route.ts
- [ ] app/api/clubs/[id]/members/invite/route.ts
- [ ] app/api/clubs/[id]/members/[mid]/flights/route.ts
- [ ] app/api/me/dashboard/route.ts
- [ ] app/api/me/currency/route.ts
- [ ] app/api/me/notifications/route.ts

### UI Components (0/12)
- [ ] components/club/BookingCalendar.tsx
- [ ] components/club/BookingModal.tsx
- [ ] components/club/BlockOutModal.tsx
- [ ] components/club/CheckoutPanel.tsx
- [ ] components/club/ActiveFlightCard.tsx
- [ ] components/club/MemberList.tsx
- [ ] components/club/InviteModal.tsx
- [ ] components/club/BillingRunButton.tsx
- [ ] components/club/InvoiceList.tsx
- [ ] components/pilot/CurrencyBadge.tsx
- [ ] components/pilot/DashboardStats.tsx
- [ ] components/pilot/NotificationList.tsx

### Library Files (0/4)
- [ ] lib/stripe.ts
- [ ] lib/resend.ts
- [ ] lib/invoice.ts
- [ ] lib/billing.ts

### Scripts (0/1)
- [ ] scripts/seed-demo.ts

---

## Last Updated
2026-02-24
