# Logbook V1 Master Plan (FAA + EASA)

## Overview
Deliver a full‑featured electronic logbook that matches MyFlightbook‑level capability for FAA and EASA pilots. The system must support instructor‑signed endorsements with certificate upload/verification, robust reporting/printing (FAA + EASA formats), comprehensive import pipeline (CSV + known eLogbook formats), and currency/compliance tracking. Desktop‑first UX; mobile responsive later.

## Project Type
**WEB** (Next.js App Router, API routes, Prisma + SQL Server)

## Menu Constraints (Owner‑Confirmed)
- **Dashboard** (widgets allowed)
- **Plan & Fly** (map stays; can add tools)
- **Training** (implement items that make sense)
- **Club** (keep; add if needed; **Club Maintenance must live here**)
- **Marketplace** (separate)
- **Mechanic** (separate)

## Success Criteria
- FAA + EASA logbook formats and fields are supported with a toggle UI.
- Instructor sign‑in required for endorsements and signatures.
- Instructor certificate upload with admin verification required.
- Endorsement library covers **all FAA + EASA endorsements**.
- Print view supports **FAA and EASA** formats.
- Import system supports CSV plus adapters for MyFlightbook/ForeFlight/Garmin, with validation preview.
- Currency and compliance dashboards for FAA + EASA rules, with alerts.
- Airports, routes, visited airports and aircraft profiles are available.
- No regression in existing club/marketplace/mechanic features.

## Scope (V1)
### Logbook
- Add flights (multi‑leg, role/times/conditions/landings)
- Search, filters, totals
- Download/Export (CSV + PDF)
- Print view (FAA + EASA)
- Starting totals
- Pending flights (student → instructor review)

### Training
- Instructors / Students directory
- Request signatures
- Endorsements (FAA + EASA library)
- Ratings progress
- 8710/IACRA reports (FAA)
- Rollup by model/time
- Achievements (optional if time)

### Currency & Compliance
- FAA: Flight review, IPC, night landings, medical
- EASA: SEP/TMG revalidation, recent experience, LPC/OPC
- Alerts + dashboard
- “Check Flights” validator

### Aircraft & Airports
- My Aircraft + import
- Models catalog
- Airports finder + routes + visited airports
- Add/Edit airports (admin)

### Imports
- CSV/Excel
- MyFlightbook export
- ForeFlight export
- Garmin export
- Adapter framework for more formats

## Non‑Goals (V1)
- Mobile‑native apps (desktop first)
- Payments/billing flows
- Real‑time telemetry ingestion

## Implementation Phases
### Phase 1 — Schema & Core UI
- Expand Prisma schema: LogbookEntry, Endorsement, EndorsementTemplate, Signature, InstructorProfile, CertificationUpload, CurrencyRule, CurrencyStatus, AirportVisit, Route, AircraftProfile, AircraftModel
- Core Logbook UI with FAA/EASA toggle
- Basic export (CSV + initial PDF)

### Phase 2 — Endorsements & Instructor Workflow
- Instructor role + certificate upload + verification
- Endorsement library (FAA + EASA)
- Signature requests + audit trail

### Phase 3 — Printing & Reports (Early Priority)
- FAA print format
- EASA print format
- Totals and rollups

### Phase 4 — Currency Engine
- FAA + EASA rules engine
- Alerts + dashboards

### Phase 5 — Imports
- CSV/Excel import with mapping
- MyFlightbook/ForeFlight/Garmin adapters

### Phase 6 — Aircraft & Airports
- My Aircraft UI
- Airports/Routes/Visited airports
- Admin airport edit

## Risks
- Endorsement coverage breadth may require iterative rollout
- Import adapters can vary significantly; need mapping UI
- Printing accuracy across FAA/EASA formats requires validation

## Verification
- Type check & lint
- Create logbook entry
- Generate FAA/EASA print output
- Endorsement request + instructor signature
- Import preview → commit flow
- Currency dashboard updates
