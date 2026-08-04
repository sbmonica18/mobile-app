# UrbanLens — API Keys & Accounts Checklist

Create these before later map/notification phases (not required for place images).

| Service | Purpose | Phase | URL |
|---------|---------|------:|-----|
| Google Cloud / Maps Platform | Optional native map tiles (Android/iOS builds) + Geocoding | 4–5 | https://console.cloud.google.com/ |
| Google Gemini | AI decision, planner, companion (backend) | 5–9 | https://aistudio.google.com/apikey |
| OpenWeather | Weather + Air Pollution (optional; Open-Meteo used now) | 3, 5 | https://openweathermap.org/api |
| Firebase | FCM push notifications | 11 | https://console.firebase.google.com/ |

## Routing (no paid key required for MVP)

UrbanLens uses **OSRM** (`router.project-osrm.org`) for driving distance, ETA, polylines, and alternative routes.

Turn-by-turn opens the **Google Maps** app via a deep link (no Directions API key required).

If OSRM is unreachable, the app falls back to straight-line (haversine) distance and ETA.

## Google Maps keys (optional — map tiles)

For production native builds, set keys in `mobile-app/app.json`:

- `expo.ios.config.googleMapsApiKey`
- `expo.android.config.googleMaps.apiKey`

You may also keep a copy in `mobile-app/.env` as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` for documentation — Expo Go usually works without a custom key.

## Gemini (backend)

Set in `backend` when running locally (do not commit secrets):

```properties
# application-local.properties or env
urbanlens.gemini.api-key=YOUR_KEY_HERE
```

Or:

```bash
set URBANLENS_GEMINI_API_KEY=YOUR_KEY_HERE
```

If empty, `GeminiService` uses deterministic mock responses so the UI flow still works offline/demo.

## Place images (no paid API)

UrbanLens uses:

1. **Bundled photos** in `mobile-app/assets/places/` (parks, temples, stations, Chromepet, etc.)
2. **On-device URL cache** (AsyncStorage) after a successful free fetch
3. **Wikipedia / Wikimedia Commons** live lookup when no bundled match exists

No Google Places photo key is required for Explore Nearby or destination lens images.

Store secrets in `.env` / `application-secret.yml` — never commit them.
