# UrbanLens

Mobile travel intelligence app — **React Native (Expo)** + **Spring Boot 3** + **MySQL**.

## Repository layout

```
UrbanLens/
├── mobile-app/     # Expo React Native (TypeScript)
├── backend/        # Spring Boot API (Java 21)
└── docs/           # Requirements & phase plans
```

## Prerequisites

- Node.js 20+
- npm
- Java 21+
- Maven 3.9+
- Expo Go (SDK 54) on your phone
- MySQL 8+ (for full backend; local profile uses H2)

## Quick start

### Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Phase 3 APIs (JWT required except auth/health):

| Method | Path |
|--------|------|
| GET/POST | `/api/searches` |
| DELETE | `/api/searches/{id}` |
| GET/POST | `/api/saved-destinations` |
| DELETE | `/api/saved-destinations/{id}` |

Home dashboard uses **Open-Meteo** (weather) and **OpenStreetMap Nominatim** (places) from the mobile app — no API keys required for Phase 3.

### Mobile

1. Copy `mobile-app/.env.example` → `mobile-app/.env`
2. Set `EXPO_PUBLIC_API_URL` to your PC LAN IP when using a phone on hotspot, e.g. `http://192.168.1.18:8080/api`

**Fastest (skip broken ngrok tunnel):** double-click `mobile-app\start-fast.cmd`, or:

```bash
cd mobile-app
npx expo start --localhost --web
```

Open **http://localhost:8081** in Chrome.

**Phone without tunnel:** turn on **PC Mobile Hotspot** → connect phone to it → double-click `start-phone-hotspot.cmd` (or `npx expo start --lan`) → scan QR in Expo Go.

Avoid `--tunnel` when ngrok keeps disconnecting (causes stuck “Bundling 100%”).


### MySQL (default profile)

```sql
CREATE DATABASE urbanlens CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update credentials in `backend/src/main/resources/application.properties` if needed.

## Documentation

- [Requirements (SRS)](docs/REQUIREMENTS.md)
- [Phases](docs/PHASES.md)
- [API keys](docs/API_KEYS.md)

## Stack

| Layer | Tech |
|-------|------|
| Mobile | Expo 54, TypeScript, Expo Router, Zustand, TanStack Query, Axios, SecureStore, NativeWind |
| Backend | Java 21, Spring Boot 3, Security + JWT, JPA, Validation, Lombok, springdoc |
| DB | MySQL (H2 for local) |
