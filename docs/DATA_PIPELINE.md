# AviationHub Data Pipeline

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     FRONTEND (Next.js)                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  Pages/Components                                                                          │
│  ├── Landing Page                                                                          │
│  ├── Dashboard                                                                             │
│  ├── Fuel Saver Module     ←─────────────── Fuel prices, waypoints, routes                │
│  ├── Weather Radar        ←─────────────── Radar tiles, weather data                     │
│  ├── Pilot Directory      ←─────────────── Pilot profiles, friend system                 │
│  ├── Marketplace         ←─────────────── Aircraft listings, inquiries                  │
│  ├── Flying Clubs        ←─────────────── Groups, bookings, aircraft, members            │
│  ├── Training            ←─────────────── Training progress, milestones                  │
│  ├── Logbook             ←─────────────── Flight entries, statistics                     │
│  ├── E6B Calculator      ←─────────────── Flight calculations                            │
│  └── Chat Widget         ←─────────────── E2EE messaging, presence                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                              ↓ ↑ REST APIs
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       API LAYER                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  Authentication                    │  User Data              │  Flight Planning             │
│  ├── /api/auth/signup             │  /api/users/me          │  /api/flight-plans          │
│  ├── /api/auth/verify-email       │  /api/pilots           │  /api/flight-tracks        │
│  ├── /api/auth/forgot-password    │  /api/pilots/me        │  /api/weight-balance       │
│  ├── /api/auth/reset-password     │  /api/user/tier        │                            │
│  └── /api/auth/[...nextauth]     │                         │                            │
│                                   │                         │                            │
│  Friends & Messaging              │  Marketplace           │  Fuel & Weather            │
│  ├── /api/friends                │  /api/marketplace/     │  /api/fuel                 │
│  ├── /api/friends/requests       │      listings          │  /api/fuel/nearest         │
│  ├── /api/friends/with-status   │  /api/marketplace/     │  /api/weather              │
│  ├── /api/conversations              inquiries          │  /api/notams                │
│  ├── /api/conversations/[id]/   │  /api/faa/aircraft/   │  /api/pireps               │
│  │      messages                     [nNumber]           │  /api/tfrs                 │
│  └── /api/presence/heartbeat    │                         │  /api/sigmets              │
│                                   │                         │  /api/airports             │
│  Groups & Clubs                  │  Training & Stats      │  /api/airports/bounds      │
│  ├── /api/groups                 │  /api/training-        │  /api/airports/[icao]      │
│  ├── /api/groups/[groupId]/         progress            │                            │
│  │      bookings               │  /api/logbook          │  Radar & Maps              │
│  ├── /api/groups/[groupId]/   │                         │  /api/radar/frames         │
│  │      members                │                         │  /api/radar/tile            │
│  ├── /api/groups/[groupId]/                                                      │
│  │      aircraft                                                                  │
│  └── /api/groups/[groupId]/                                                      │
│       invites                                                                       │
│                                                                                      │
│  Admin                    │  Search & Sync                      │  Aircraft Data            │
│  ├── /api/admin/users    │  /api/search        │  /api/sync  │  /api/aircraft/search    │
│  ├── /api/admin/stats    │  /api/error-report  │             │  /api/aircraft/search/   │
│  └── /api/admin/migrate  │                                   │      options             │
│                           │                                   │  /api/aircraft/search/   │
│                           │                                   │      models              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                              ↓ ↑
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATABASE (Azure SQL)                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐       │
│  │     USER DATA         │    │   FLIGHT DATA        │    │   MARKETPLACE        │       │
│  │                      │    │                      │    │                      │       │
│  │  User                │    │  FlightPlan          │    │  MarketplaceListing  │       │
│  │  PilotProfile        │    │  FlightPlanWaypoint  │    │  AircraftInquiry     │       │
│  │  TrainingProgress    │    │  FlightTrack         │    │                      │       │
│  │  LogbookEntry       │    │  LogbookEntry        │    │                      │       │
│  │  UserAircraft       │    │  FlightLog           │    │                      │       │
│  │  Document           │    │  FlightLog           │    │                      │       │
│  │  UserPresence       │    │                      │    │                      │       │
│  └──────────────────────┘    └──────────────────────┘    └──────────────────────┘       │
│                                                                                          │
│  ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐       │
│  │  SOCIAL & MESSAGING  │    │   FLYING CLUBS      │    │   CACHE TABLES      │       │
│  │                      │    │                      │    │                      │       │
│  │  FriendRequest       │    │  FlyingGroup         │    │  AirportCache        │       │
│  │  Conversation        │    │  GroupMember         │    │  FuelPriceCache      │       │
│  │  ConversationParts   │    │  Invite              │    │  AircraftCache       │       │
│  │  Message             │    │  ClubAircraft        │    │  WeatherCache        │       │
│  │                      │    │  Booking            │    │  AircraftMaster      │       │
│  │                      │    │  Maintenance        │    │  AircraftPerformance  │       │
│  │                      │    │                     │    │  AircraftSpecs        │       │
│  └──────────────────────┘    └──────────────────────┘    └──────────────────────┘       │
│                                                                                          │
│  ┌──────────────────────┐                                                               │
│  │   MAINTENANCE        │                                                               │
│  │                      │                                                               │
│  │  ErrorReport        │                                                               │
│  └──────────────────────┘                                                               │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                              ↓
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  EXTERNAL DATA SOURCES                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  FAA Registry                    │  Weather Services              │  Airport Data            │
│  ─────────────────────           │  ───────────────             │  ───────────            │
│  • FAA Aircraft Master           │  • Iowa Environmental        │  • FAA CADORS           │
│  • Registration data               Mesonet (radar)             │  • Our airport cache    │
│  • N-number lookup              │  • NWS METAR/TAF            │  • User-contributed     │
│                                 │  • NOTAMs                   │                          │
│                                 │  • PIREPs                   │                          │
│                                 │  • TFRs                     │                          │
│                                 │  • SIGMETs                  │                          │
│                                                                                          │
│  Fuel Prices                    │  Other                       │                          │
│  ───────────                   │  ─────                       │                          │
│  • Fuel100 (crowdsourced)      │  • Resend (email)           │                          │
│  • AirNav (cached)             │  • Pusher (real-time)        │                          │
│  • User-reported               │  • Vercel (hosting)          │                          │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### 1. User Authentication Flow
```
User signup → /api/auth/signup → User table (create)
                    ↓
            Send verification email (Resend)
                    ↓
User clicks link → /api/auth/verify-email → Update emailVerified
                    ↓
User logs in → /api/auth/[...nextauth] → Session + JWT
```

### 2. Flight Planning Flow
```
User creates plan → /api/flight-plans (POST)
        ↓
    FlightPlan + FlightPlanWaypoints (database)
        ↓
    User views plan → /api/flight-plans (GET)
        ↓
    Fuel calculation → /api/fuel
        ↓
    Weather check → /api/weather, /api/notams, /api/tfrs
```

### 3. Marketplace Flow
```
User posts listing → /api/marketplace/listings (POST)
        ↓
    MarketplaceListing (database)
        ↓
    Other users browse → /api/marketplace/listings (GET)
        ↓
    Contact seller → /api/marketplace/inquiries (POST)
        ↓
    Seller responds (via email or chat)
```

### 4. E2EE Messaging Flow
```
User A wants to message User B
        ↓
1. Exchange public keys via /api/e2ee/public-key
        ↓
2. Create conversation /api/conversations (POST)
        ↓
3. Send encrypted message /api/conversations/[id]/messages (POST)
        ↓
4. Real-time delivery via Pusher
        ↓
5. Recipient decrypts with their private key
```

### 5. Online Presence Flow
```
User logs in
        ↓
/api/presence/heartbeat (POST) every 30 seconds
        ↓
UserPresence table updated
        ↓
Friends see online status in chat widget
        ↓
/api/friends/with-status returns friends + presence
```

---

## External API Dependencies

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Resend** | Email (verification, password reset) | 3,000 emails/day |
| **Pusher** | Real-time messaging | 200K messages/day |
| **Vercel** | Hosting | 100GB bandwidth |
| **Azure SQL** | Database | Existing subscription |
| **FAA.gov** | Aircraft registration lookup | Free |
| **Iowa Environmental Mesonet** | Radar tiles | Free |

---

## Security Considerations

- **Authentication**: NextAuth.js with JWT
- **Sessions**: 30-day persistent, secure cookies
- **Passwords**: bcrypt hashed
- **E2EE**: Client-side encryption (ECDH + AES-GCM)
- **API**: Protected by auth checks
- **Email**: Resend (verified domain)

---

## Offline Support

- **IndexedDB**: Local caching for offline access
- **Sync Queue**: Changes queued when offline, synced when online
- **Conflict Detection**: Server vs local data conflicts

---

Last Updated: 2026-02-20
