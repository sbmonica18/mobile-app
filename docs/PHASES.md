# UrbanLens — Development Phases

Build MVP first. Each phase ends with a working, testable app.

| Phase | Focus | Status |
|------:|-------|--------|
| 1 | Project setup (Expo + Spring Boot + MySQL config + folders + Git) | **Done** |
| 2 | Authentication (register, login, JWT, guest) | **Done** |
| 3 | Home dashboard | **Done** |
| 4 | Maps module (OSRM routes + in-app map companion; Google Maps deep link) | **Done (MVP)** |
| 5 | Destination intelligence dashboard | **Done (MVP)** |
| 6 | Smart destination decision engine | **Done (MVP)** |
| 7 | Smart route explorer (distance, ETA, alternatives) | **Done (MVP)** |
| 8 | Journey companion | **Done (MVP)** |
| 9 | Smart route story | **Done (lite)** |
| 10 | AI Journey Story + Travel Vault | **Done (MVP)** |
| 11 | UrbanLens Now — continuous location intelligence | **Done (MVP)** |
| 12 | User profile | Partial / Planned |
| 13 | Admin dashboard (web) | Planned |
| 14 | Testing | Planned |
| 15 | Deployment | Planned |

## MVP cutoff

Phases **1–11** (through UrbanLens Now continuous intelligence) form the solid final-year MVP. Full profile polish (12) is partial.

## Screen ownership

| Screen | Role |
|--------|------|
| Home | Weather climate card, search, AI launchpad, experiences, trending, continue, weekend |
| Explore | AI recommended destination cards |
| AI tab | AI Command Center (NL planner + insights + reasoning) |
| search-results | AI decision score + reasons |
| destination-dashboard | AI brief, intelligence, POIs, route planner |
| journey-companion | Map, polyline, alternatives, Complete Trip → story |
| (ai-flow)/intent | Mood/budget/time questionnaire |
| (ai-flow)/recommendations | Swipe recommendation deck |
| (ai-flow)/destination/[id] | Rich destination intelligence |
| (ai-flow)/decision-canvas | Side-by-side compare |
| (ai-flow)/route-navigation | Live route navigation → story |
| journey-story | AI Journey Story (cinematic post-trip) |
| travel-vault | Saved journey stories archive + intelligence memories |
| urbanlens-now | UrbanLens Now live intelligence feed |
| Saved / Profile | Saved places / account + vault entry |

For full page-by-page actions and outputs, see [PRD.md](PRD.md).

## Phase 3 checklist

- [x] Current location (expo-location + reverse geocode)
- [x] Live weather (Open-Meteo)
- [x] Destination search (OpenStreetMap Nominatim)
- [x] Source + destination trip card
- [x] Recent searches (API for users, local for guests)
- [x] Saved destinations (API for users, local for guests)
- [x] Profile header on home dashboard

## Phase 4–8 checklist (MVP)

- [x] Road routing via OSRM (distance, ETA, polyline, alternatives, `steps=true`) with haversine fallback
- [x] Interactive map with source/destination markers on journey companion
- [x] In-app turn-by-turn banner + `expo-speech` voice guidance with mute toggle (synced to OSRM steps / GPS)
- [x] Open in Google Maps deep link for turn-by-turn
- [x] Destination intelligence brief + snapshot + nearby POIs
- [x] AI decision score screen
- [x] AI planner tab with structured result + explore handoff
- [x] Preference tracking (AsyncStorage) soft-fed into AI purpose
- [ ] Optional Google Maps Platform key for production Android/iOS map tiles (Expo Go works without)
