# UrbanLens — Software Requirements Specification (SRS)

## 1. Product Overview

**UrbanLens** is a mobile travel intelligence app that helps users decide where to go and how to get there by combining maps, weather, air quality, nearby places, and a suitability scoring engine.

**Target:** Final-year project MVP first, then advanced intelligence features in later phases.

---

## 2. Goals

| Goal | Description |
|------|-------------|
| G1 | Let users search destinations and see live context (weather, AQI, nearby places) |
| G2 | Generate routes with distance and ETA via Google Maps Platform |
| G3 | Score destinations by budget, time, vehicle, purpose, weather, and distance |
| G4 | Save trips and manage a basic profile |
| G5 | Ship a working Expo Go–previewable app early; deepen features phase by phase |

---

## 3. Stakeholders

- End users (travelers / students)
- Development team
- Evaluators (project demo / viva)

---

## 4. Functional Requirements

### 4.1 Authentication (MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | User can register with email and password | Must |
| FR-AUTH-02 | User can log in and receive a JWT | Must |
| FR-AUTH-03 | User can access limited features in Guest Mode | Must |
| FR-AUTH-04 | User can log out and invalidate session client-side | Must |
| FR-AUTH-05 | Forgot password flow | Should |

### 4.2 Home Dashboard (MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-HOME-01 | Show current location (with permission) | Must |
| FR-HOME-02 | Show current weather for user location | Must |
| FR-HOME-03 | Search destinations by name/query | Must |
| FR-HOME-04 | Show recent searches | Must |
| FR-HOME-05 | Show saved destinations | Must |

### 4.3 Maps & Navigation (MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MAP-01 | Display interactive Google Map | Must |
| FR-MAP-02 | Show user current location on map | Must |
| FR-MAP-03 | Search and pin a destination | Must |
| FR-MAP-04 | Generate driving route origin → destination | Must |
| FR-MAP-05 | Display distance and ETA | Must |
| FR-MAP-06 | Show alternative routes when available | Should |

### 4.4 Destination Intelligence (MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DEST-01 | Destination summary card | Must |
| FR-DEST-02 | Weather at destination | Must |
| FR-DEST-03 | Air quality (AQI) at destination | Must |
| FR-DEST-04 | Nearby attractions, restaurants, hotels, hospitals | Must |
| FR-DEST-05 | Public transport / parking when data exists | Should |

### 4.5 Smart Destination Decision Engine (MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DEC-01 | Accept inputs: budget, time, vehicle, purpose, weather, distance | Must |
| FR-DEC-02 | Compute suitability score | Must |
| FR-DEC-03 | Return recommendation, estimated budget, travel suggestion | Must |

### 4.6 Saved Trips & Profile (MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TRIP-01 | Save / bookmark trips | Must |
| FR-TRIP-02 | View trip history | Must |
| FR-TRIP-03 | View basic trip statistics | Should |
| FR-PROF-01 | View and edit profile | Must |
| FR-PROF-02 | Manage preferences and travel interests | Should |
| FR-PROF-03 | Manage saved locations | Must |

### 4.7 Advanced (Post-MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ADV-01 | Journey Companion (alerts, reminders, emergency nearby) | Could |
| FR-ADV-02 | Smart Route Story (heritage, food, photo spots) | Could |
| FR-ADV-03 | Smart Route Explorer (fuel, EV, toilets, scenic points) | Could |
| FR-ADV-04 | Push notifications (weather, traffic, events) | Could |
| FR-ADV-05 | Admin web dashboard | Could |
| FR-ADV-06 | Offline trip cache, voice assistant, multi-stop planner | Could |

---

## 5. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | Home and map screens usable on mid-range Android within 3s of open (warm start) |
| NFR-02 | Usability | Core flows (login → search → route) completable without documentation |
| NFR-03 | Security | Passwords hashed; APIs protected with JWT except public/guest endpoints |
| NFR-04 | Reliability | Graceful fallback UI when third-party APIs fail |
| NFR-05 | Portability | Mobile app runs on Expo Go during early phases; Android APK/AAB for demo |
| NFR-06 | Maintainability | Clear monorepo structure: `mobile-app/`, `backend/`, `docs/` |
| NFR-07 | Compatibility | Android primary; iOS via Expo where possible |

---

## 6. System Architecture (High Level)

```
[Expo / React Native App]
        |  HTTPS + JWT
[Spring Boot 3 API]
        |
   [MySQL]
        |
[Google Maps | OpenWeather | Air Quality | FCM | Unsplash]
```

---

## 7. Tech Stack Requirements

### Mobile
- React Native (Expo SDK)
- TypeScript
- Expo Router
- Zustand (client state)
- TanStack Query (server state)
- Axios
- React Native Reanimated
- NativeWind (Tailwind)

### Backend
- Java 21, Spring Boot 3
- Spring Security + JWT
- Spring Data JPA / Hibernate
- Maven, Bean Validation, Lombok
- OpenAPI / Swagger

### Database
- MySQL

### Third-party APIs (MVP)
- Google Maps Platform (Maps, Directions, Geocoding, Places)
- OpenWeather (weather + air pollution preferred)
- Firebase Cloud Messaging (notifications phase)
- Unsplash (destination imagery)

---

## 8. External API Requirements

| Service | Used for | Required for |
|---------|----------|--------------|
| Google Maps SDK | Map UI | Phase 4 |
| Directions API | Routes, ETA | Phase 4 |
| Geocoding / Places | Search, nearby | Phase 3–5 |
| OpenWeather | Weather | Phase 3 |
| OpenWeather Air Pollution / OpenAQ | AQI | Phase 5 |
| FCM | Push | Phase 11 |
| Unsplash | Images | Phase 5 |

---

## 9. Data Requirements (MVP entities)

- User
- Destination / Place reference
- SearchHistory
- SavedDestination
- Trip
- DecisionRequest / DecisionResult (or derived scores)
- UserPreferences

---

## 10. Permissions (Mobile)

- Location (foreground)
- Internet
- Notifications (later phase)
- Optional: background location only if Journey Companion needs it

---

## 11. Out of Scope (MVP)

- Payment / booking of hotels or tickets
- Real-time turn-by-turn voice navigation SDK parity with Google Maps app
- Full offline maps
- Multi-language localization (can be later)

---

## 12. Success Criteria for Demo

1. Register / login works against Spring Boot + MySQL  
2. Search a city and see weather + map route with ETA  
3. Destination dashboard shows nearby places + AQI  
4. Decision engine returns a score and suggestion  
5. User can save a trip and view it in profile/history  
6. App previewable on device via Expo Go (early phases) and/or Android emulator  

---

## 13. Phase Mapping

See [PHASES.md](./PHASES.md) for delivery order. **Phase 1** = project setup only (this milestone).
