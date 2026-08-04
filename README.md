# UrbanLens

**AI Location Intelligence** mobile app for smarter travel decisions.

UrbanLens helps you decide **where to go**, **when to go**, and **how to get there** by combining live location, weather, destination insights, AI recommendations, road routing, live navigation, and a post-trip journey story.

This repository is a **final-year project** built with:

- **Frontend:** React Native (Expo SDK 54) + TypeScript  
- **Backend:** Spring Boot 3 (Java 21) + JWT auth  
- **Database:** MySQL (H2 for local demo)

---

## What is Location Intelligence here?

UrbanLens turns raw location data into useful travel decisions:

| Input | Intelligence | Output |
|--------|----------------|--------|
| Your GPS location | Weather, area context | Live home climate & nearby awareness |
| Destination search | Place discovery | Search results & saved places |
| Mood / budget / time | AI preference matching | Ranked destination recommendations |
| Destination choice | Scores, POIs, budget estimate | Destination intelligence dashboard |
| Source → destination | OSRM road routing | Distance, ETA, route alternatives |
| Live trip | GPS + turn guidance | Journey Companion navigation |
| Trip complete | AI narrative + stats | Journey Story + Travel Vault |

---

## Who can use it?

| Mode | What you get |
|------|----------------|
| **Guest** | Browse Home, AI flows, navigation; local-only session (sign in to keep profile permanently) |
| **Registered user** | Login/signup with JWT; synced saved destinations & journey stories; personal profile, travel stats & achievements |

---

## Main features

1. **Authentication** — Register, login, guest mode, secure token storage  
2. **Home dashboard** — Live weather, destination search, experiences, trending nearby  
3. **AI Intent Discovery** — Mood / budget / time questionnaire → swipe recommendations  
4. **AI Command Center** — Natural-language trip planning & insights  
5. **Destination Intelligence** — Brief, conditions, attractions, services, budget estimate  
6. **Smart Decision Scoring** — Match score with reasons for a place  
7. **Route Explorer** — Distance, ETA, scenic / fastest / budget-style alternatives (OSRM)  
8. **Journey Companion** — Live map navigation, voice guidance, complete trip flow  
9. **AI Journey Story** — Cinematic post-trip summary after a full tour  
10. **Travel Vault** — Archive of completed journey stories  
11. **Profile** — Account details, travel stats, achievements, quick links (signed-in users)

---

## Repository structure

```text
UrbanLens/
├── mobile-app/     # Expo React Native app (TypeScript)
├── backend/        # Spring Boot REST API (Java 21)
├── docs/           # PRD, phases, requirements
└── README.md       # This file
```

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Mobile | Expo 54, Expo Router, Zustand, TanStack Query, Axios, Reanimated, SecureStore |
| Maps & routes | `react-native-maps`, OSRM, OpenStreetMap tiles |
| Location & weather | `expo-location`, Open-Meteo, Nominatim |
| Backend | Spring Boot 3, Spring Security, JWT, JPA, Validation, Lombok |
| Database | MySQL 8 (production-style) / H2 (`local` profile for easy demo) |

---

## Prerequisites

- Node.js 20+ and npm  
- Java 21+  
- Maven (or use the included `mvnw` / `mvnw.cmd`)  
- Expo Go **SDK 54** (for phone testing)  
- Optional: MySQL 8+ for the default DB profile  

---

## How to run

Use **two terminals**. Start the backend first.

### 1) Backend (API)

**Windows CMD:**

```cmd
cd C:\Users\Monica\Urbanlens\backend
set SPRING_PROFILES_ACTIVE=local
mvnw.cmd spring-boot:run
```

**PowerShell:**

```powershell
cd C:\Users\Monica\Urbanlens\backend
$env:SPRING_PROFILES_ACTIVE="local"
.\mvnw.cmd spring-boot:run
```

Wait for: `Started UrbanLensApplication`  
API base: `http://localhost:8080/api`

### 2) Mobile app

```cmd
cd C:\Users\Monica\Urbanlens\mobile-app
```

Create env file (first time only):

```cmd
copy .env.example .env
```

Set your API URL in `.env`:

- **PC browser / emulator:** `http://localhost:8080/api`  
- **Physical phone:** `http://YOUR_PC_LAN_IP:8080/api`  
  Example: `http://10.34.139.1:8080/api`

**See the app in Chrome (most reliable):**

```cmd
npx expo start --web --localhost --port 8082
```

Open: [http://localhost:8082](http://localhost:8082)

**Phone via Expo Go (same Wi‑Fi / hotspot):**

```cmd
npx expo start --lan --port 8081
```

Then scan the QR in Expo Go, or enter `exp://YOUR_PC_IP:8081`.

> Note: Campus Wi‑Fi often blocks phone→PC traffic. If QR fails, use **web**, or connect the PC to your **phone hotspot** and use the new PC IP in `.env` and Expo.

---

## Typical user flow (demo)

```text
Splash / Login (or Guest)
  → Home (weather + search)
  → AI Intent / Recommendations
  → Destination Intelligence
  → Start Navigation (Journey Companion)
  → Reach place → Return to source (full tour)
  → Budget questions → AI Journey Story
  → Travel Vault + Profile stats (signed-in)
```

---

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/PRD.md](docs/PRD.md) | Product requirements & screen reference |
| [docs/PHASES.md](docs/PHASES.md) | Build phases & MVP cutoff |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | SRS-style requirements |
| [docs/API_KEYS.md](docs/API_KEYS.md) | Optional keys (maps, etc.) |

---

## Project status (MVP)

Phases **1–10** are implemented for a complete demo:

Auth → Home → AI discovery → Destination intelligence → Routing → Live navigation → Journey Story → Travel Vault.

Later phases (notifications, admin web dashboard, full deployment hardening) are planned.

---

## GitHub

Repository: [https://github.com/sbmonica18/mobile-app](https://github.com/sbmonica18/mobile-app)

---

## License / academic use

Built as an academic / final-year project for demonstrating **location intelligence**, mobile UX, and a full-stack architecture (Expo + Spring Boot).
