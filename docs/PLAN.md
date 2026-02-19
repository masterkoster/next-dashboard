# Flight Dashboard Features Plan

## Overview
Scope and delivery plan for expanding the Next.js-based aviation dashboard with nine high-impact capabilities: PDF navigation log export, in-browser PDF document hub, ForeFlight/Garmin deep links, aircraft marketplace, pilot directory, global search, enhanced maintenance tracking, near-real-time messaging via Pusher, and co-ownership group management. The plan ensures each feature integrates cleanly with existing flight club modules while maintaining security, performance, and auditability.

## Project Type
**WEB** (Next.js App Router dashboard with API routes and server actions)

## Scope
**In Scope**
- Generate and stream PDF navigation logs with export history.
- Documents section with upload, tagging, and PDF viewer (annotation-ready UI patterns).
- Flight plan deep links for ForeFlight and Garmin Pilot (pre-filled routes + metadata).
- Aircraft Marketplace listings, filters, and contact workflows.
- Pilot Directory with search, ratings, endorsements, and availability signals.
- Global search across aircraft, pilots, documents, maintenance, and conversations.
- Maintenance tracking upgrades (schedules, AD compliance, alerting hooks).
- Messaging system leveraging Pusher channels for cockpit/ground coordination.
- Co-ownership group structures with equity splits, shared costs, and governance roles.

**Out of Scope**
- Mobile-native clients (iOS/Android) and offline-first sync.
- Payment settlement rails beyond recording commitments.
- Real-time telemetry ingestion or EFB certification workflows.
- AI copilots or automated maintenance predictions.

## Success Criteria
- Users can export a PDF nav log from any flight log in ≤3 clicks; exports recorded with metadata and accessible later.
- Documents hub renders PDFs inline with zoom/download controls and enforces role-based access.
- ForeFlight and Garmin deep links validate and open with correct route/weight/balance data.
- Aircraft Marketplace supports create/edit/archive listings, photo gallery, and multi-filter search returning results <350 ms (p95).
- Pilot Directory allows filtering by ratings, medical currency, and availability; profile view accessible <2s.
- Global search returns federated results (docs, aircraft, pilots, maintenance, messages) with relevance ranking.
- Maintenance tracking surfaces upcoming inspections (30/60/90-day) and logs completion with signatures.
- Messaging delivers read receipts and push-style updates via Pusher with graceful degradation when offline.
- Co-ownership groups manage shares, cost allocations, and notify members on changes.
- Phase X verification scripts (lint, security, UX, Lighthouse, Playwright, build) all pass.

## Tech Stack & Integration Rationale
- **Next.js 16 App Router** for cohesive dashboard routing, server actions for PDF generation triggers, and streaming responses.
- **TypeScript + Prisma + Azure SQL** to extend existing schema with marketplace, messaging, and ownership tables.
- **PDFKit (Node)** combined with HTML-to-PDF fallback (Playwright) for nav log export flexibility.
- **Pusher Channels** for low-latency messaging and delivery receipts without self-hosting websockets.
- **Algolia (or OpenSearch) Federated Index** for global search relevance and synonym management.
- **ForeFlight / Garmin URL Schemas** embedded within service layer for validation before exposing deep links.
- **Tailwind CSS + Radix UI** for consistent document viewer, marketplace cards, and directory layouts.
- **Zod** for schema validation on uploads, messaging payloads, and search queries.

## Planned File Structure
```
app/
  (dashboard)/
    flights/[flightId]/navlog/export/route.ts
    documents/
      page.tsx
      viewer/
    marketplace/
    pilots/
    maintenance/
    search/
    messaging/
    co-ownership/
  api/
    pdf/
    documents/
    marketplace/
    messaging/
    search/
    coownership/
components/
  pdf/
  documents/
  marketplace/
  directory/
  messaging/
lib/
  pdf/
  search/
  messaging/
  maintenance/
  ownership/
prisma/
  schema.prisma (tables: Document, NavLogExport, Listing, PilotProfile, SearchIndex, MaintenanceEvent, MessageThread, OwnershipGroup, OwnershipShare)
docs/
  specs/
    pdf-navlog.md
    messaging-pusher.md
```

## Task Breakdown
> Format: task_id | name | agent | priority | dependencies | INPUT → OUTPUT → VERIFY | rollback

### T1. Aviation Data & Schema Mapping
- **agent:** database-architect | **priority:** P0 | **dependencies:** —
- **INPUT → OUTPUT → VERIFY:** Existing Prisma schema, `FLYING_CLUB_FEATURES.md`, feature list → Entity and relation matrix covering documents, nav log exports, marketplace, pilots, maintenance, messaging, ownership → Every feature bullet maps to tables/fields with owner + data retention rules.
- **rollback:** Reuse previous schema snapshot if mapping proves invalid.

### T2. PDF Export & Storage Pipeline Plan
- **agent:** backend-specialist | **priority:** P0 | **dependencies:** T1
- **INPUT → OUTPUT → VERIFY:** Flight log fields + nav template requirements → Flowchart detailing server action, PDF renderer (PDFKit vs Playwright), storage (Azure Blob/S3-compatible), metadata logging → Dry-run example proves <10 MB PDF stream and resumable download path.
- **rollback:** Fall back to existing CSV export notes.

### T3. Document Hub & PDF Viewer UX Plan
- **agent:** frontend-specialist | **priority:** P1 | **dependencies:** T1, T2
- **INPUT → OUTPUT → VERIFY:** Document entity fields, viewer requirements → Wireframe/component map (upload form, tag chips, inline viewer, permission states) → Checklist ensures upload, preview, download, tag filter, and access denied states accounted.
- **rollback:** Revert to present documents section layout.

### T4. ForeFlight / Garmin Deep Link Service
- **agent:** backend-specialist | **priority:** P1 | **dependencies:** T2
- **INPUT → OUTPUT → VERIFY:** Vendor deep link docs, nav log data → Service contract (functions, validation rules, error handling) + sample links → Validation script demonstrates accepted/rejected payloads vs vendor spec.
- **rollback:** Disable deep link button and hide until ready.

### T5. Aircraft Marketplace Module Plan
- **agent:** backend-specialist | **priority:** P1 | **dependencies:** T1
- **INPUT → OUTPUT → VERIFY:** Marketplace requirements, listing attributes → API + UI plan (CRUD endpoints, filters, media handling, moderation workflow) → Scenario walkthrough shows seller creates listing, buyer filters, attaches inquiry.
- **rollback:** Keep marketplace flag behind feature toggle.

### T6. Pilot Directory & Profiles Plan
- **agent:** frontend-specialist | **priority:** P1 | **dependencies:** T1, T5
- **INPUT → OUTPUT → VERIFY:** Pilot schema, rating data, availability logic → Component layout + search/filter interactions + profile detail template → Prototype data ensures filters (rating, aircraft qualified, availability) operate.
- **rollback:** Use existing member list until directory ready.

### T7. Global Search Architecture
- **agent:** backend-specialist | **priority:** P1 | **dependencies:** T1, T5, T6
- **INPUT → OUTPUT → VERIFY:** Entities to index, expected scale → Index design (records, facets, ranking, ingestion jobs) + API contract for federated search → Sample query returns scored results for at least three entity types.
- **rollback:** Revert to local per-page search while index disabled.

### T8. Maintenance Tracking Enhancements Plan
- **agent:** frontend-specialist | **priority:** P1 | **dependencies:** T1
- **INPUT → OUTPUT → VERIFY:** Maintenance schedule rules, FAA/AD checklist → UX spec for schedule view, reminder settings, completion logging, alerts → Acceptance grid confirms 30/60/90-day cues, AD compliance fields, and notifications defined.
- **rollback:** Maintain legacy maintenance table.

### T9. Messaging System with Pusher
- **agent:** backend-specialist | **priority:** P1 | **dependencies:** T1
- **INPUT → OUTPUT → VERIFY:** Messaging requirements, Pusher channel limits → Architecture doc (thread model, channel naming, auth middleware, read receipt logic, offline fallback) → Simulated load test plan ensures <1 s delivery in nominal case.
- **rollback:** Keep messaging flag off and rely on email notifications.

### T10. Co-ownership Groups & Cost Sharing Plan
- **agent:** database-architect | **priority:** P1 | **dependencies:** T1, T5
- **INPUT → OUTPUT → VERIFY:** Ownership models, billing implications → Schema additions (groups, shares, commitments) + workflow spec (create group, invite owners, assign percentages, cost distribution) → Scenario confirms totals =100% and ledger ties back to bookings.
- **rollback:** Restrict ownership to single admin per aircraft.

### T11. Integrated Verification & Release Plan
- **agent:** test-engineer | **priority:** P2 | **dependencies:** T2–T10
- **INPUT → OUTPUT → VERIFY:** All feature specs, API contracts, UI flows → Regression + acceptance checklist covering exports, documents, deep links, marketplace, directory, search, maintenance, messaging, ownership → Checklist mapped to automated/manual tests with owner + environment.
- **rollback:** Reuse prior release checklist while updating items incrementally.

## Dependencies & Sequencing
- **Graph Highlights:** T1 → {T2, T5, T6, T7, T8, T9, T10}; T2 → {T3, T4}; T5 → {T6, T7, T10}; T6 → T7; T2–T10 → T11.
- **Recommended Order:**
  1. T1 schema mapping (foundation)
  2. T2 PDF pipeline
  3. T3 documents hub UI
  4. T4 deep link service
  5. T5 marketplace module
  6. T6 pilot directory
  7. T7 global search
  8. T8 maintenance enhancements
  9. T9 messaging (Pusher)
 10. T10 co-ownership planning
 11. T11 verification + release plan
- **Parallelization Guidance:** After T1, marketplace (T5) and maintenance (T8) can proceed in parallel with messaging (T9) as they touch distinct directories; avoid simultaneous edits to `schema.prisma` without coordination.

## Phase X: Verification Checklist (execute before marking complete)
- [ ] Run aggregated verification: `python .agent/scripts/verify_all.py . --url http://localhost:3000`
- [ ] Lint & types: `npm run lint && npx tsc --noEmit`
- [ ] Security scan: `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] UX audit: `python .agent/skills/frontend-design/scripts/ux_audit.py .`
- [ ] Lighthouse: `python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:3000`
- [ ] Playwright E2E: `python .agent/skills/webapp-testing/scripts/playwright_runner.py http://localhost:3000 --screenshot`
- [ ] Build: `npm run build`
- [ ] Manual verification: Deep link opens in ForeFlight/Garmin, PDF viewer controls, search relevance, messaging delivery, ownership totals
- [ ] Add "## ✅ PHASE X COMPLETE" section with dated checklist once every item passes.
