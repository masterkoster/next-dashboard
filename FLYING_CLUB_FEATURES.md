# Flying Club Module - Feature Summary

## Overview
A comprehensive flying club management system built with Next.js, Prisma, and Azure SQL Database.

---

## Features Implemented

### 1. Group Management
- **Create Flying Groups**: Users can create new flying clubs with name, description, and hourly rates (dry/wet)
- **Join Groups**: Invite system with unique join links
- **Member Management**: 
  - Admin and Member roles
  - Leave group functionality
  - Member listing with roles

### 2. Aircraft Management
- **Add Aircraft**: Add aircraft to groups with details (N-number, custom name, make, model, year)
- **Aircraft Status**: Track detailed status including:
  - Current Status (Available, In Use, Maintenance Required, Grounded)
  - Inspection dates (Annual, Altimeter/Transponder, ELT Battery, 100-Hour)
  - Maintenance tracking (Oil change, fuel filter, brake fluid, coolant)
  - Current hours (Tach, Hobbs)
  - Fuel on board
  - Equipment (GPS, ADS-B, Autopilot)
  - Registration & Insurance expiration
- **Status Display**: Aircraft cards now show status badge (Available/In Use/Maintenance Required/Grounded)

### 3. Flight Logging
- **Log Flights**: Record flight details including:
  - Date, Aircraft selection
  - Tach start/end times
  - Hobbs start/end times
  - Notes
  - **Maintenance Reporting**: Option to report maintenance issues when logging flights
- **Flight History**: View all flight logs with filtering by:
  - Pilot name
  - Aircraft
  - Date range (from/to)

### 4. Maintenance Tracking
- **Report Issues**: Users can report maintenance issues with:
  - Aircraft selection
  - Description
  - Additional notes
- **Quick Select**: Common pilot-fixable issues (Oil top-up, Coolant, Tire inflation, etc.)
- **Mark as Fixed**: Button to resolve maintenance issues with:
  - Description of what was fixed
  - Cost (optional)
  - Resolution date
- **Quick Checklist**: Summary of pilot-fixable issues at top of page
- **Status Categories**: NEEDED, IN_PROGRESS, DONE

### 5. Booking System
- **Create Bookings**: Users can book aircraft for specific times
- **Booking Selector**: When logging flights, select a past booking to pre-fill details
- **Completed Bookings**: Only show past bookings for flight logging

### 6. Billing
- **Monthly Statements**: View billing by month/year
- **Dynamic Group Selection**: If admin of multiple groups, can switch between groups
- **Per-Member Billing**: Shows each member's:
  - Number of flights
  - Total Hobbs hours
  - Total Tach hours
  - Total cost owed
  - Individual flight details

### 7. Navigation & UI Updates
- **Profile Dropdown**: Logout button added to profile menu
- **Navigation Updates**:
  - ✈️ icon → Landing page
  - "Aviation" text → Dashboard
  - Only Plane Carfax and Flying Club modules shown
- **Landing Page**: Flying Club featured alongside Plane Carfax
- **Dashboard**: Shows Flying Club and Plane Carfax as active, others as "Coming Soon"

---

## Database Schema

### Tables
- **FlyingGroup**: Group information (name, description, rates)
- **GroupMember**: Member roles and associations
- **ClubAircraft**: Aircraft details and status notes (JSON)
- **Booking**: Flight bookings
- **FlightLog**: Flight records
- **Maintenance**: Maintenance issues tracking

---

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/groups` | GET, POST | List/Create groups |
| `/api/groups/[id]` | GET | Group details |
| `/api/groups/[id]/aircraft` | GET, POST | Aircraft CRUD |
| `/api/groups/[id]/bookings` | GET, POST | Bookings CRUD |
| `/api/groups/[id]/logs` | GET, POST | Flight logs |
| `/api/groups/[id]/members` | GET, POST, DELETE | Members |
| `/api/groups/[id]/invites` | GET, POST | Invite management |
| `/api/billing` | GET | Monthly billing statements |
| `/api/maintenance` | GET, POST | Maintenance issues |
| `/api/maintenance/[id]` | PUT, DELETE | Update/Delete maintenance |

---

## Security Features
- Authentication via NextAuth
- Role-based access (Admin vs Member)
- Users can only see maintenance for their groups
- Billing only visible to admins

---

## Technical Stack
- **Frontend**: Next.js 16, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Azure SQL with Prisma ORM
- **Auth**: NextAuth.js

---

*Generated: February 2026*
