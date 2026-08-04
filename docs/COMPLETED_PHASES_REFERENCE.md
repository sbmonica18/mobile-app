# UrbanLens — Completed Phases Reference Guide

---

## 1. Project overview

**UrbanLens** is a travel intelligence mobile app: decide where to go and how to get there using location, weather, AI scoring, destination brief, road routes, and a journey companion map.

| Layer | Tech |
|-------|------|
| Frontend | Expo SDK 54, React Native, TypeScript, Expo Router, Zustand |
| Backend | Spring Boot 3, Java 21, JWT, JPA |
| DB | H2 (`local` profile) / MySQL (default) |

```
UrbanLens/
├── mobile-app/
├── backend/
└── docs/          (REQUIREMENTS, PHASES, PRD, API_KEYS)
```

---

## 2. Phase status (completed)

| Phase | Focus | Status |
|------:|-------|--------|
| 1 | Project setup (Expo + Spring Boot + folders) | **Done** |
| 2 | Authentication (register, login, JWT, guest) | **Done** |
| 3 | Home dashboard | **Done** |
| 4 | Maps module (OSRM + companion map + Google Maps link) | **Done (MVP)** |
| 5 | Destination intelligence dashboard | **Done (MVP)** |
| 6 | Smart destination decision engine | **Done (MVP)** |
| 7 | Smart route explorer (distance, ETA, alternatives) | **Done (MVP)** |
| 8 | Journey companion | **Done (MVP)** |
| 9 | Smart route story | **Done (lite)** |
| 10–15 | Saved trips polish, notifications, profile, admin, testing, deploy | **Planned** |

---

## 3. What each completed phase delivers

### Phase 1 — Setup
- Expo mobile app + Spring Boot backend  
- Local profile with H2  
- Docs & repo structure  

### Phase 2 — Auth
- Welcome, Login, Register  
- JWT session (SecureStore)  
- Guest mode  
- Forgot / reset password  

### Phase 3 — Home
- Current location + reverse geocode  
- Live weather (Open-Meteo) — themed weather card  
- AI Smart Search + autocomplete dropdown  
- Explore chips: Heritage / Museum / Park / Beach / Theatre + image cards  
- Continue Journey (recent)  
- Saved destinations (API or local for guests)  

### Phase 4–7 — Maps & intelligence flow
- Selecting a place → **Search Results** (AI score %)  
- **Destination Dashboard**: AI brief, intelligence snapshot, POIs  
- **Smart Route Planner**: OSRM distance/ETA/alternatives + Open in Google Maps  

### Phase 8–9 — Companion
- **Journey Companion**: map, markers, road polyline, ETA, alternatives  
- Smart updates + route story (lite) from `/api/ai/journey-companion`  

### AI tab (planner)
- Natural-language goals → plan → Explore → decision flow  

---

## 4. Screen map

| Screen | Role |
|--------|------|
| Home | Weather, search, explore chips, continue |
| search-results | AI decision score + reasons |
| destination-dashboard | Brief, snapshot, POIs, route planner |
| journey-companion | Map + smart updates |
| AI tab | NL planner |
| Saved / Profile | Saved places / account shell |

**Demo path:**  
Home search → Decision → Explore Journey → Dashboard → Start Navigation → Companion  
*(or AI tab → Explore This Destination → same flow)*

---

## 5. Backend APIs (built)

| Area | Paths |
|------|--------|
| Health | `GET /api/health` |
| Auth | register, login, me, forgot/reset |
| Places | `/api/searches`, `/api/saved-destinations` |
| AI | `GET /api/ai/decision`, `POST /api/ai/planner`, `GET /api/ai/journey-companion` |

External (from mobile, no backend key needed for MVP): Open-Meteo, Nominatim/Photon, OSRM, Wikipedia/Commons images.

---

## 6. How to run — terminal prompts (Windows CMD)

Use **2 Command Prompt windows**. Keep both open.

### Terminal 1 — Backend

```cmd
cd C:\Users\Monica\Urbanlens\backend
set SPRING_PROFILES_ACTIVE=local
mvnw.cmd spring-boot:run
```

Wait for: `Started UrbanLensApplication`  
API base: `http://localhost:8080/api`

*(PowerShell instead of CMD: `$env:SPRING_PROFILES_ACTIVE="local"` then `.\mvnw.cmd spring-boot:run`)*

---

### Terminal 2 — Frontend (phone via Expo Go)

**Preferred when tunnel works:**

```cmd
cd C:\Users\Monica\Urbanlens\mobile-app
npx expo start --tunnel
```

- If asked **Use port 8084 instead?** → type `y`  
- Wait for **Tunnel ready** + QR  
- Open **Expo Go (SDK 54)** → scan QR  

**If tunnel/ngrok fails**, USB (reliable):

```cmd
cd C:\Users\Monica\Urbanlens\mobile-app
.tools\platform-tools\adb.exe reverse tcp:8081 tcp:8081
npx expo start --localhost --port 8081
```

Expo Go → Enter URL: `exp://127.0.0.1:8081`  
*(phone USB + USB debugging required)*

**PC browser only (no phone location):**

```cmd
cd C:\Users\Monica\Urbanlens\mobile-app
npx expo start --localhost --web
```

Open `http://localhost:8081` (or the port it prints).

---

### Mobile `.env`

```text
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:8080/api
```

Example when laptop IP is `10.34.139.1`:

```text
EXPO_PUBLIC_API_URL=http://10.34.139.1:8080/api
```

Restart Expo after changing `.env`.

---

## 7. Quick demo checklist

1. Guest or Login  
2. Home shows weather  
3. Search place (e.g. Ooty) → Decision %  
4. Explore Journey → brief + route km/ETA  
5. Start Navigation → map  
6. AI tab → prompt → Explore destination  
7. Explore chip **Heritage** → temple cards  

---

## 8. Related docs in repo

| File | Purpose |
|------|---------|
| `docs/PRD.md` | As-built PRD (completed scope) |
| `docs/PHASES.md` | Phase status table |
| `docs/REQUIREMENTS.md` | Full SRS |
| `docs/API_KEYS.md` | Optional Gemini / Maps keys |
| `README.md` | Quick start |
