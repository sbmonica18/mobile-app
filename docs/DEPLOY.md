# UrbanLens — Deploy Guide (Free / Hobby)

Goal: open the app **without** starting backend + Expo terminals every time.

---

## Are A / B / C completely free?

| Piece | Service | Free? | Limits (honest) |
|-------|---------|-------|------------------|
| **A. Backend** | [Render](https://render.com) free web service | **Yes (hobby)** | Sleeps after ~15 min idle → first open can be slow (~30–60s). Data on free H2 resets when service restarts. |
| **A. Backend** | Railway | Trial credits, not forever-free | Often needs card; credits run out |
| **B. Android APK** | [Expo EAS](https://expo.dev) free plan | **Yes (limited)** | Limited builds/month on free plan; enough for student demos |
| **C. Web app** | [Vercel](https://vercel.com) hobby | **Yes** | Fine for demo web UI; still needs deployed backend URL |

**Recommended free path for you:**  
**Render (backend) + EAS Android APK (phone icon)**  
Web (Vercel) is optional.

> Nothing is “unlimited free forever.” Free tiers are enough for a college demo if you accept sleep/restart limits.

---

## What you do now (step by step)

### Step 0 — Push latest code to GitHub

```cmd
cd C:\Users\Monica\Urbanlens
git add .
git commit -m "Add deploy configs for Render and EAS APK"
git push
```

---

### Step C — Web on Vercel first (FREE) — do this now if you want

Vercel hosts the **frontend only** (browser).  
Login / vault / AI still need a public backend later (Render). For a first UI demo, Vercel is fine.

1. Push code to GitHub (include `mobile-app/vercel.json`)
2. Go to https://vercel.com → Sign up with GitHub
3. **Add New Project** → import `sbmonica18/mobile-app`
4. Configure:
   - **Root Directory:** `mobile-app`  ← important
   - Framework: Other / leave default
   - Build Command: `npx expo export --platform web` (from vercel.json)
   - Output Directory: `dist`
5. Environment Variable:
   - Name: `EXPO_PUBLIC_API_URL`
   - Value: your Render API later, e.g. `https://urbanlens-api.onrender.com/api`  
     *(Until backend is deployed, UI opens but login/API calls will fail.)*
6. Deploy → open the `*.vercel.app` link

CLI alternative:

```cmd
cd C:\Users\Monica\Urbanlens\mobile-app
npm i -g vercel
vercel login
vercel
```

When asked, set root to `mobile-app` and follow prompts.

---

### Step A — Deploy backend (Render) — FREE hobby

1. Create account: https://render.com (GitHub login)
2. **New → Web Service**
3. Connect repo: `sbmonica18/mobile-app`
4. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Instance type:** Free
5. Environment variables:
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `JWT_SECRET` = (click Generate, or paste a long random string)
   - `GEMINI_API_KEY` = optional
6. Deploy → wait until Live
7. Copy your URL, example:
   `https://urbanlens-api.onrender.com`  
   API base becomes:
   `https://urbanlens-api.onrender.com/api`
8. Test in browser:
   `https://YOUR-SERVICE.onrender.com/api/health`  
   Should show `"status":"UP"`

---

### Step B — Build Android APK (Expo EAS) — FREE limited

On your PC (in `mobile-app`):

```cmd
cd C:\Users\Monica\Urbanlens\mobile-app
npm install -g eas-cli
eas login
eas build:configure
```

Edit `eas.json` → under `preview.env.EXPO_PUBLIC_API_URL` put your Render URL:

```json
"EXPO_PUBLIC_API_URL": "https://YOUR-SERVICE.onrender.com/api"
```

Also update local `.env` the same way.

Build APK:

```cmd
eas build -p android --profile preview
```

When build finishes, Expo gives a **download link**.  
Install the APK on your Android phone → open **UrbanLens** like a normal app.

No Expo Go. No Metro terminal.

---

### Step C — Optional web (Vercel) — FREE

Only if you want browser access for evaluators:

```cmd
cd C:\Users\Monica\Urbanlens\mobile-app
npx expo export --platform web
```

Then deploy the `dist` folder to Vercel, with env:

`EXPO_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com/api`

---

## After deploy — daily use

1. Phone: tap **UrbanLens** APK  
2. First request after idle may wait while Render wakes up  
3. Backend stays online in the cloud (no `mvnw` needed on your laptop)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Health URL 404 / fails | Wait for deploy logs; confirm Root Directory = `backend` |
| App login fails | Check `EXPO_PUBLIC_API_URL` ends with `/api` and uses `https://` |
| Render cold start | Wait 30–60s and retry |
| EAS build asks projectId | Run `eas build:configure` once and commit the updated `app.json` |

---

## Cost summary for your project

- **Student demo:** Render free + EAS free APK ≈ **₹0**  
- **Always-on / persistent DB later:** paid Render/Railway + Postgres (optional upgrade)
