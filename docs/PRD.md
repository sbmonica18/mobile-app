# UrbanLens — Product Requirements Document (PRD)
## Status: As-Built (Completed Scope + Page Reference)

**Product:** UrbanLens — AI Location Intelligence mobile app  
**Document type:** Completion PRD (as-built) + screen-by-screen feature reference  
**Audience:** Final-year project demo / evaluators / development team  
**Stack:** Expo React Native (SDK 54) + Spring Boot 3 (Java 21)  
**Updated:** August 2026  

---

## 1. Product summary

UrbanLens helps travelers decide **where to go** and **how to get there** by combining:

- Live location & dynamic weather intelligence  
- Destination search & discovery  
- AI recommendation / decision scoring  
- Destination intelligence (brief, conditions, POIs, budget)  
- Road routing (distance, ETA, alternatives via OSRM)  
- In-app journey companion / live navigation  
- Natural-language AI trip planner (AI Command Center)  
- AI Intent Discovery flow (mood → recommendations → detail)  
- Post-trip AI Journey Story + Travel Vault  

The Home screen is discovery-focused. Deeper AI, route, map, and story flows live on dedicated screens.

---

## 2. Goals accomplished

| ID | Goal | Status |
|----|------|--------|
| G1 | Search destinations with live local context (weather, nearby) | **Done** |
| G2 | Generate routes with distance & ETA | **Done (OSRM MVP)** |
| G3 | Score destinations (AI decision + planner + intent flow) | **Done (MVP)** |
| G4 | Save destinations & journey stories | **Done (MVP)** — full profile edit / trip stats still partial |
| G5 | Expo Go–previewable app | **Done** |
| G6 | Premium splash + Home/AI visual polish | **Done** |
| G7 | Post-trip cinematic Journey Story + Vault | **Done (Phase 10)** |

---

## 3. User roles

| Role | Capabilities |
|------|----------------|
| Registered user | JWT auth; recent searches & saved destinations synced to API; journey stories can sync |
| Guest | Browse Home, AI flow, local storage for recent/saved |
| Evaluators | End-to-end demo: splash → Home → AI intent/planner → navigation → Journey Story → Vault |

---

## 4. Phase status

| Phase | Focus | Status |
|------:|-------|--------|
| 1 | Project setup (Expo + Spring Boot + folders + Git) | **Done** |
| 2 | Authentication (register, login, JWT, guest) | **Done** |
| 3 | Home dashboard | **Done** |
| 4 | Maps module (OSRM + companion map + Google Maps link) | **Done (MVP)** |
| 5 | Destination intelligence dashboard | **Done (MVP)** |
| 6 | Smart destination decision engine + AI planner + Intent flow | **Done (MVP)** |
| 7 | Smart route explorer (distance, ETA, alternatives) | **Done (MVP)** |
| 8 | Journey companion / live navigation | **Done (MVP)** |
| 9 | Smart route story | **Done (lite)** |
| 10 | AI Journey Story + Travel Vault | **Done (MVP)** |
| 11 | UrbanLens Now continuous intelligence | **Done (MVP)** |
| 12 | Full user profile | **Partial / Planned** |
| 13 | Admin dashboard (web) | **Planned** |
| 14 | Testing | **Planned** |
| 15 | Deployment | **Planned** |

**MVP cutoff:** Phases **1–11** form the solid final-year demo.

---

## 5. Two main user journeys

```text
Path A — Classic AI Decision
Splash → Login/Guest → Home / AI Tab
  → Search Results (score %)
  → Destination Dashboard
  → Journey Companion
  → Journey Story → Travel Vault

Path B — AI Intent Discovery
Splash → Login/Guest → Home
  → Explore with AI / Experience chips
  → Intent questionnaire
  → Recommendations deck
  → Destination detail [id]
       ├─ Navigate → Route Navigation → Journey Story
       └─ Compare → Decision Canvas → Route Navigation → Journey Story
```

---

## 6. Completed user journeys (summary)

### 6.1 Auth
1. Premium splash → Login / Register / Continue as Guest  
2. JWT stored securely; guest flag in secure storage  
3. Forgot / reset password flows present  

### 6.2 Home (discovery)
1. Location + dynamic weather climate card  
2. Search with autocomplete  
3. AI launchpad (Explore with AI)  
4. Experience cards → refine → recommendations  
5. Trending Nearby, Continue Exploring, Weekend Inspiration, AI Insights  

### 6.3 Classic decision → destination → navigation
1. Search Results — recommendation score % + reasons  
2. Destination Dashboard — AI brief, snapshot, POIs, Smart Route Planner  
3. Journey Companion — map, polyline, ETA, alternatives, Complete Trip  

### 6.4 AI Intent Discovery
1. Intent questions (mood, budget, time, style…)  
2. Swipe recommendations with match scores  
3. Rich destination detail → Navigate or Compare  

### 6.5 AI Planner tab
1. Idle command center (orb, status, insights, chips)  
2. Natural-language prompt → reasoning timeline → AI summary card  
3. Explore destination → decision flow  

### 6.6 Post-trip
1. Complete trip / arrive → AI Journey Story  
2. Save → Travel Vault archive  

---

## 7. Screen-by-screen reference
### What shows · What user can do · What output appears

---

### 7.1 Entry & Auth (Phases 1–2)

#### Splash / Welcome — `/(auth)/welcome`
| | |
|--|--|
| **Shows** | Premium cinematic UrbanLens splash (glass orb, rings, particles, wordmark, tagline) |
| **Actions** | Auto-plays; no required taps |
| **Output** | On finish → Home if authenticated, else Login |

#### Login — `/(auth)/login`
| | |
|--|--|
| **Shows** | Login / Signup tabs; email, password; full name on signup; errors |
| **Actions** | Login · Signup · Forgot password · Continue as Guest |
| **Output** | JWT / guest session → Home tabs |

#### Forgot Password — `/(auth)/forgot-password`
| | |
|--|--|
| **Shows** | Email field; success/error message |
| **Actions** | Send reset link · Back |
| **Output** | Reset email flow; may open Reset Password with token |

#### Reset Password — `/(auth)/reset-password`
| | |
|--|--|
| **Shows** | Reset token + new password fields |
| **Actions** | Update password · Back |
| **Output** | Success → returns to Login |

---

### 7.2 Main tabs (Phase 3 + polish)

Tab bar: **Home · Explore · AI · Saved · Profile**

#### Home — `/(app)/(tabs)/`
| Section | Shows | Actions → Output |
|---------|--------|------------------|
| Header | Logo, UrbanLens wordmark, “Currently Exploring” location, glass profile button | Profile → Profile tab |
| Weather card | Dynamic climate scene (sunny/rain/night…), temp, status badge, Humidity/Wind/AQI/UV/Rain, refresh | Refresh → reloads conditions with animation |
| Search | Glass search bar + autocomplete | Pick place → mock Destination page |
| AI Hero | Mini orb, headline, cycling intelligence line, **Explore with AI** (pulse + press) | Explore with AI → Intent flow |
| Experiences | Horizontal premium cards (Nature, Weekend, Road Trip…) | Chip → Refine sheet → Recommendations |
| AI Quick Insights | Rotating insight strip | Auto-rotates |
| Trending Nearby | Destination cards (image, score, weather, time) | Tap → AI Destination detail |
| Continue Exploring | Recent / resume cards | Resume → reopen destination |
| Weekend Inspiration | Large swipe mood cards | Tap → Intent with mood |
| Pull to refresh | — | Reloads location, weather, lists |

#### Explore — `/(app)/(tabs)/explore`
| | |
|--|--|
| **Shows** | “AI Recommended” tall image cards (match %, weather, budget, drive) |
| **Actions** | Tap card / Explore Destination |
| **Output** | Opens Destination detail (mock path) |

#### AI Command Center — `/(app)/(tabs)/ai`
| State | Shows | Actions → Output |
|-------|--------|------------------|
| Idle | Hero + thinking orb; Status card; Context; Insight carousel; vibe chips; memory; prompt composer | Chips / insights / send → planner API |
| Planning | Reasoning timeline (Understanding → Ranking → Preparing…) | — |
| Result | AI Summary card, confidence %, weather/budget/distance, expandable reasoning, follow-ups | Navigate → geocode → Search Results; Save → toast; Follow-up → new plan; New → idle |

Composer shortcuts (voice / attach / camera) show placeholder alerts for later releases. Location shortcut runs a nearby-context prompt.

#### Saved — `/(app)/(tabs)/saved`
| | |
|--|--|
| **Shows** | Saved AI destinations (thumbnail + match %) or empty state |
| **Actions** | Tap card |
| **Output** | Opens `/(ai-flow)/destination/[id]` |

#### Profile — `/(app)/(tabs)/profile`
| | |
|--|--|
| **Shows** | Avatar initial, name/email or Guest copy |
| **Actions** | Log out / Exit guest · Open Travel Vault |
| **Output** | Logout → Welcome; Vault → Travel Vault |

#### Plan tab (hidden)
Placeholder only — not shown in tab bar.

---

### 7.3 Classic decision → dashboard → companion (Phases 5–8)

#### Search Results (AI Decision) — `/search-results`
| | |
|--|--|
| **Shows** | Loading (“Analyzing…”); recommendation score %; place name; reason bullets; error state |
| **Actions** | Explore Journey / Continue to Dashboard · Back |
| **Output** | Opens Destination Dashboard |
| **Typical entry** | AI tab “Explore / Navigate” after planner |

#### Destination Dashboard — `/destination-dashboard`
| | |
|--|--|
| **Shows** | AI brief; Intelligence Snapshot; Nearby POIs; Smart Route Planner (distance, ETA, alternatives) |
| **Actions** | Select alternate route · Start Navigation · Open in Google Maps · Back |
| **Output** | Navigation → Journey Companion; Google Maps deep link |

#### Journey Companion — `/journey-companion`
| | |
|--|--|
| **Shows** | Map + markers; road polyline(s); ETA; route chips; smart updates / route story (lite); navigating footer |
| **Actions** | Switch route · Complete Trip · Back |
| **Output** | Complete / near destination (~120 m) → Journey Story |

---

### 7.4 AI Intent Discovery flow (Phase 6+)

#### Intent — `/(ai-flow)/intent`
| | |
|--|--|
| **Shows** | Paged questions (Mood, Budget, Time, Style…); progress dots; chips; live match count |
| **Actions** | Next · Skip · Find destinations · Back |
| **Output** | Opens Recommendations |

#### Recommendations — `/(ai-flow)/recommendations`
| | |
|--|--|
| **Shows** | Vertical swipe deck; match ring; AI summary; Explore journey CTA; empty / seen-all states |
| **Actions** | Swipe · Explore · Adjust intent · Refresh |
| **Output** | Opens Destination detail `[id]` |

#### Destination Detail — `/(ai-flow)/destination/[id]`
| | |
|--|--|
| **Shows** | Hero; Travel Conditions; Environment; Budget; Crowd & Safety; Attractions; Nearby Services; Best Time; Tips |
| **Actions** | Heart save/unsave · Share · Navigate There · Compare Destinations · Back |
| **Output** | Navigate → Route Navigation; Compare → Decision Canvas |

#### Decision Canvas — `/(ai-flow)/decision-canvas`
| | |
|--|--|
| **Shows** | Side-by-side slots; AI verdict; priority weight sliders; comparison matrix / radar |
| **Actions** | Add/Swap · Reset · Choose {name} · Save comparison (UI) |
| **Output** | Choose → Route Navigation for that destination |

#### Route Navigation — `/(ai-flow)/route-navigation`
| Mode | Shows | Actions → Output |
|------|--------|------------------|
| Pre-nav | Map; weather alert; mood chips; from→to; distance/ETA | Start Live Navigation |
| Navigating | Turn banner (OSRM steps); in-app voice guidance (`expo-speech`); mute toggle; companion sheet | Complete / Arrive → Journey Story |
| Web | “Live Navigation Unavailable” | Go Back |

---

### 7.5 Post-trip Story & Vault (Phase 10)

#### Journey Story — `/journey-story`
| | |
|--|--|
| **Shows** | Cinematic hero; narrative; route replay/timeline; stats; highlights; memory gallery; environment; travel score; achievements; share/save prompt |
| **Actions** | Save story · Open Vault · Done / Close |
| **Output** | Save → toast (+ API if logged-in non-guest); Vault → Travel Vault; Done → clears session → Home tabs |

#### Travel Vault — `/travel-vault`
| | |
|--|--|
| **Shows** | Saved story cards (image, score, km, budget) or empty copy |
| **Actions** | Open card · Remove · Back |
| **Output** | Open → reopens Journey Story; Remove → deletes entry |

---

### 7.6 Mock destination (Home search path)

#### Destination (mock) — `/destination`
| | |
|--|--|
| **Shows** | Hero image; overview stats; mock route map |
| **Actions** | Back (Navigate button may be incomplete in mock path) |
| **Note** | Primary polished navigation path is AI-flow Destination Detail → Route Navigation |

---

## 8. Feature requirements — completion matrix

### Authentication
| ID | Requirement | Status |
|----|-------------|--------|
| FR-AUTH-01 | Register email/password | **Done** |
| FR-AUTH-02 | Login + JWT | **Done** |
| FR-AUTH-03 | Guest mode | **Done** |
| FR-AUTH-04 | Logout / clear session | **Done** |
| FR-AUTH-05 | Forgot / reset password | **Done** |

### Home dashboard
| ID | Requirement | Status |
|----|-------------|--------|
| FR-HOME-01 | Current location | **Done** |
| FR-HOME-02 | Current weather (dynamic climate card) | **Done** (Open-Meteo) |
| FR-HOME-03 | Destination search | **Done** |
| FR-HOME-04 | Recent / Continue Exploring | **Done** |
| FR-HOME-05 | Saved destinations | **Done** |
| — | Experience cards + AI launchpad + trending / weekend / insights | **Done** |

### Maps & navigation
| ID | Requirement | Status |
|----|-------------|--------|
| FR-MAP-01 | Interactive map | **Done** |
| FR-MAP-02 | User / route markers | **Done** |
| FR-MAP-04 | Driving route origin → destination | **Done** (OSRM) |
| FR-MAP-05 | Distance & ETA | **Done** |
| FR-MAP-06 | Alternative routes | **Done** |
| — | Open in Google Maps | **Done** |

### Destination intelligence
| ID | Requirement | Status |
|----|-------------|--------|
| FR-DEST-01 | Destination summary / AI brief | **Done** |
| FR-DEST-02 | Weather context | **Done / Partial** |
| FR-DEST-03 | AQI | **Lite** (heuristic / mock) |
| FR-DEST-04 | Nearby POIs / services | **Done** |
| FR-DEST-05 | Budget / crowd / safety intel | **Done** (AI-flow detail) |

### Smart decision & AI
| ID | Requirement | Status |
|----|-------------|--------|
| FR-DEC-01 | Preference / purpose context | **Done (MVP)** |
| FR-DEC-02 | Suitability score | **Done** (`/api/ai/decision`) |
| FR-DEC-03 | Recommendation + reasons | **Done** |
| — | NL planner | **Done** (`/api/ai/planner`) |
| — | Intent → recommendations deck | **Done** |
| — | Decision Canvas compare | **Done** |
| — | Gemini live key | **Optional** (mock fallback) |

### Journey companion & stories
| ID | Requirement | Status |
|----|-------------|--------|
| FR-ADV-01 | Journey companion alerts / updates | **Done (MVP)** |
| FR-ADV-02 | Smart route story (lite) | **Done (lite)** |
| — | AI Journey Story cinematic | **Done** (Phase 10) |
| — | Travel Vault archive | **Done** (Phase 10) |
| FR-ADV-03 | Rich fuel/EV/toilets explorer | **Not done** |

### Profile
| ID | Requirement | Status |
|----|-------------|--------|
| FR-PROF-01 | Edit profile | **Partial** (view / logout shell) |
| FR-PROF-02 | Preference management UI | **Partial** (auto counters) |
| FR-PROF-03 | Save destinations | **Done** |

---

## 9. Technical architecture (as built)

```text
[Expo Go / Device]
  Splash / Auth / Tabs (Home · Explore · AI · Saved · Profile)
       │
       ├─ Open-Meteo (weather)
       ├─ Nominatim / Photon (places)
       ├─ OSRM (routes, ETA, alternatives)
       ├─ Wikipedia/Commons + assets (images)
       └─ Spring Boot API
              /api/auth/*
              /api/searches
              /api/saved-destinations
              /api/ai/decision
              /api/ai/planner
              /api/ai/journey-companion
              /api/journey-stories  (Phase 10)
              └─ H2 (local) or MySQL (default)
              └─ GeminiService (optional key; mock fallback)
```

| Layer | Choice |
|-------|--------|
| Mobile | Expo 54, Expo Router, TypeScript, Zustand, Axios, Reanimated |
| Backend | Spring Boot 3, Security + JWT, JPA |
| Routing | Public OSRM (+ haversine fallback) |
| Maps UI | react-native-maps; OSRM `steps=true` in-app turn banner + `expo-speech` voice; Google Maps URL as external fallback |

---

## 10. Backend APIs delivered

| Area | Endpoints (representative) |
|------|----------------------------|
| Health | `GET /api/health` |
| Auth | register, login, me, forgot/reset |
| Places | recent searches, saved destinations CRUD |
| AI | `GET /api/ai/decision`, `POST /api/ai/planner`, `GET /api/ai/journey-companion` |
| Stories | journey-stories create/list (+ AI journey-story seed) |

---

## 11. Demo checklist (recommended)

1. Splash → Continue as Guest (or Login)  
2. Home shows live weather climate card + location  
3. Tap **Explore with AI** → answer Intent → swipe Recommendations  
4. Open destination → **Navigate There** → Start Live Navigation → Complete → **Journey Story**  
5. Save story → open **Travel Vault** from Profile  
6. Open **AI tab** → ask “Weekend under ₹4000” → Explore → Decision % → Dashboard → Companion  

---

## 12. Out of scope / still planned

- Phase **11**: Push notifications  
- Phase **12**: Full profile editor, trip statistics  
- Phase **13**: Admin web dashboard  
- Phase **14–15**: Formal testing suite, production deploy  
- Paid Google Directions / live traffic SDK (in-app OSRM + `expo-speech` voice TBT is already shipped)  
- Real AQI provider (currently lite / heuristic)  
- Composer voice / camera / attachment (UI present, not wired)  

---

## 13. Non-functional notes

| Topic | As-built |
|-------|----------|
| Local run | Backend `SPRING_PROFILES_ACTIVE=local` (H2); mobile Expo LAN (`--lan`) preferred over tunnel |
| Phone URL example | `exp://YOUR_PC_IP:8082` + `.env` `EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:8080/api` |
| Performance | Reanimated motion; reduce-motion paths on splash/weather/AI |
| Offline / demo | AI mocks without Gemini; route haversine if OSRM fails |
| Security | JWT; secrets not committed; Maps/Gemini keys optional |

---

## 14. Related docs

| File | Purpose |
|------|---------|
| [PHASES.md](PHASES.md) | Phase status table |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Full SRS |
| [API_KEYS.md](API_KEYS.md) | Optional Gemini / Maps keys |
| [COMPLETED_PHASES_REFERENCE.md](COMPLETED_PHASES_REFERENCE.md) | Earlier runbook (partially superseded by this PRD) |
| `README.md` | Quick start |

---

## 15. Document control

| Field | Value |
|-------|--------|
| Nature | **As-built PRD** — implemented UrbanLens through Phase 10 (Journey Story / Vault) plus Home/AI premium UX |
| Screen map source | Current `mobile-app/app` routes (August 2026) |

*End of PRD (as-built + page reference).*
