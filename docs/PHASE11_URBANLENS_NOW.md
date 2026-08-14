# Phase 11 — UrbanLens Now

Continuous location intelligence layer. **AI Explore / Intent / Swipe Deck are unchanged.**

## What shipped

| Piece | Location |
|-------|----------|
| Intelligence engine | `mobile-app/services/intelligence/*` |
| Store | `mobile-app/store/intelligenceStore.ts` |
| Home card | `UrbanLensNowHomeCard` on Home (after AI Search / Explore) |
| Full screen | `app/(app)/urbanlens-now.tsx` |
| Destination Pulse + What Changed | Destination Intelligence `[id]` |
| Why sheet / Ideal plan | Shared intelligence components |
| Companion lines | `JourneyCompanionSheet` + route-navigation |
| Impact block | Journey Story |
| Vault / Saved memories | Travel Vault + Saved tab |
| API shape | `GET /api/intelligence/now` |

## Honesty rules

- Weather / AQI / rain: live when Open-Meteo returns data  
- Traffic / crowd / parking: **estimated** (time-of-day), never claimed as live sensors  
- Road closures: **unavailable** until a real feed exists  
- Impact minutes: labeled **estimate** unless a real route delta is recorded  

## Regression

Verify still works: AI Search, Explore with AI, Intent, Recommendations, Destination, Decision Canvas, Navigation, Companion, Journey Story, Travel Vault.
