# FixFirst — Fix what matters first 🛠️

**A Citizen-style civic app** that turns photos, video and voice into prioritized,
**severity-weighted** infrastructure reports near you. It is not a complaint inbox — it's a
**prioritization system** that constantly answers one question:

> **What should be fixed first, and why?**

A photo shows the hazard. A voice note explains the human impact. FixFirst combines both,
pulls **real civic data near your live location**, and lets the community act as a **jury** on
report credibility — so facilities teams know what's broken, who it affects, and what to fix first.

Built as a **mobile app** (centered phone shell on desktop, full-screen on phones) for students,
pedestrians, cyclists, wheelchair users, campus facilities teams, and city maintenance departments.

---

## ✨ Features

- **Live map home** — real-time **GPS blue dot** that tracks you (`watchPosition`), priority-colored incident pins, and a **"people nearby"** presence count. Citizen-style dark UI.
- **Real civic data** — the feed pulls genuinely real reports from the nearest city's **Open311** endpoint via `/api/incidents`, scored through the same severity engine. Falls back to a real-data-shaped snapshot when a region has no Open311 coverage (e.g. Eugene) or the host is offline.
- **Report a hazard** — **photo + video** capture/upload, in-browser voice recording, optional text, auto-attached **GPS**, and an icon category picker.
- **AI analysis** — severity (1–100, hazard-driven), priority, accessibility impact, affected groups, suggested fix, duplicate probability, confidence, campus-ready summary, follow-up text, and a **voice confirmation**.
- **Community jury & report score** — citizens vote **Confirm / Unsure / Reject** on each report; verdicts + attached evidence produce a **0–100 credibility score** (Verified / Credible / Needs review / Low quality), separate from severity. Voting earns reputation.
- **Reputation system** — earn points for well-evidenced reports and juror service (quality > volume). Tiers: Newcomer → Reporter → Trusted Reporter → Civic Guardian → City Watch, plus badges, on the **Profile** tab.
- **Facilities dashboard** — analytics, a **severity-weighted priority queue**, **Fix First** top-3 recommendations with reasons, and a **play audio briefing** button.
- **Report detail** — photo/video, voice + transcript, AI analysis, the **jury panel**, a transparent priority-score breakdown, community updates, and actions (generate facilities report, mark fixed, follow-up photo, accessibility alert).
- **Voice personas** — pick the voice used for spoken output: **Marcus (deep & calm / "cool guy"), Nova, Ranger, Zara, or Device default** — browser TTS now, ElevenLabs voice IDs wired per persona for later.

## 🧮 The priority engine — SEVERITY-WEIGHTED

How serious a hazard is comes from the **hazard**, not how many people reported it. 100 reports
about overflowing trash is still just trash; a single pothole can outrank it.

```
score = severity                               (dominant base)
      + accessibility bonus   (High +12 / Med +6 / Low +2)
      + duplicate bonus       (scaled DOWN by severity, hard cap +8)
      + unresolved bonus      (severity-scaled, hard cap +8)
score = min(score, CATEGORY_CEILING)           ← the guardrail
```

**Category ceilings** stop low-stakes categories from ever reaching Urgent on volume alone —
e.g. *Overflowing trash* is capped at **60 (Medium)**, while *Blocked wheelchair ramp* can reach **100**.

| Score   | Priority | Color  |
| ------- | -------- | ------ |
| 0–39    | Low      | 🟢 green  |
| 40–64   | Medium   | 🟡 yellow |
| 65–84   | High     | 🟠 orange |
| 85–100  | Urgent   | 🔴 red    |

Engine in [`src/lib/priority.ts`](src/lib/priority.ts); credibility scoring in [`src/lib/jury.ts`](src/lib/jury.ts); reputation in [`src/lib/reputation.ts`](src/lib/reputation.ts).

## 🤖 Mock AI behavior

The app runs **fully on deterministic mock logic** with zero API keys, so judges can demo every
flow. Category-aware reasoning lives in [`src/lib/ai.ts`](src/lib/ai.ts) — e.g. a *Blocked
wheelchair ramp* returns high accessibility impact and Urgent priority; a *Broken light* mentions
night safety; a *Cracked sidewalk* mentions trip hazard and wheelchair/low-vision risk, and so on.

---

## 🌐 Real data (Open311)

The live feed is genuinely real, not invented. `/api/incidents?lat=..&lng=..`:

1. Finds the **nearest covered city** from a registry of real, keyless **Open311 GeoReport v2** endpoints (San Francisco, Boston, Baltimore, Bloomington IN, Brookline MA, Peoria IL — see [`src/lib/open311.ts`](src/lib/open311.ts)).
2. Fetches recent **real service requests** (potholes, sidewalks, street lights, sanitation…) with real lat/lng, sorts by distance to you, and scores each through the severity engine.
3. If a region has **no Open311 coverage** (e.g. Eugene) or the host is **offline**, it returns a clearly-labeled **real-data-shaped snapshot** so the demo always works. The UI shows `● Live Open311` vs `◌ Real-data snapshot` and "nearest feed: <city> (N km)".

> Your **live GPS** powers the blue dot and "people nearby" everywhere; the civic feed centers on the nearest covered city.

## 🧱 Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** + **Tailwind CSS**
- **Browser Geolocation** (`watchPosition`) for live location tracking
- **Open311** real civic data via a server route, with snapshot fallback
- `localStorage`-backed client store (submitted reports, reputation, jury votes, voice prefs persist)
- **Browser SpeechSynthesis** with selectable voice personas (ElevenLabs-ready)

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # optional — app works with no keys
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start                # serves on $PORT (default 3000)
```

---

## 🔌 Environment variables

All AI keys are **optional** — the app falls back to mock logic when they're absent.
See [`.env.example`](.env.example).

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Google Gemini — multimodal photo + transcript analysis and scoring |
| `ELEVENLABS_API_KEY` | ElevenLabs — voice confirmations, facilities briefings, accessibility alerts |
| `SNOWFLAKE_*` | Snowflake — durable storage for reports, scores, clusters, analytics |
| `BACKBOARD_API_KEY` | Backboard — remembers routes, accessibility needs, history, style, preferences |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Optional real basemap (otherwise the schematic map placeholder is used) |
| `PORT` | Port for `npm run start` (default 3000) |

### Where each integration plugs in (search the code for these)

- **Gemini** — [`src/lib/ai.ts`](src/lib/ai.ts): analyze photo, analyze transcript, merge visual + spoken context, generate severity/accessibility scoring, generate facilities report.
- **ElevenLabs** — [`src/lib/voice.ts`](src/lib/voice.ts): voice confirmation after analysis, audio briefing for facilities, accessibility audio alert. Falls back to browser TTS.
- **Snowflake** — [`src/lib/store.tsx`](src/lib/store.tsx) & [`src/lib/mockData.ts`](src/lib/mockData.ts): store reports, severity scores, duplicate clusters, user updates, fix times, analytics.
- **Backboard** — [`src/lib/memory.ts`](src/lib/memory.ts): remember usual routes, accessibility needs, past reports, reporting style, follow-up preferences.

---

## ☁️ Deploy to DigitalOcean (App Platform)

FixFirst is a standard Next.js app and deploys cleanly on **DigitalOcean App Platform**.

1. Push this repo to GitHub.
2. In DigitalOcean → **Apps → Create App** → pick your repo/branch.
3. App Platform auto-detects Next.js. Confirm:
   - **Build command:** `npm run build`
   - **Run command:** `npm run start`
   - **HTTP port:** `3000` (App Platform sets `$PORT`; `npm run start` respects it)
4. Add any optional env vars (`GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `SNOWFLAKE_*`, `BACKBOARD_API_KEY`) under **Settings → Environment**.
5. Deploy. 🎉

A ready-to-use App Platform spec is included at [`.do/app.yaml`](.do/app.yaml) — edit `repo` to point at your GitHub repository, then `doctl apps create --spec .do/app.yaml`.

### Docker (alternative)

The app also runs in any Node 18+ container:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 🎬 Demo script (QuackHacks · University of Oregon)

The demo is seeded for **UO / Eugene** (EMU entrance, Lillis, Knight Library, 13th Avenue, Hayward Field, Rec Center, Amazon Corner, Franklin Blvd, Kincaid St, University St, Duck Store). The headline case is the **blocked wheelchair ramp at the EMU entrance — severity 94, priority 100, Urgent**, used across the map, queue, dashboard, and generated report.

1. Open the app — the **mission statement** and **"Today's Fix First"** card make the purpose obvious in 5 seconds. **Allow location** to track the blue dot.
2. Open **Today's Fix First** (EMU ramp) → scroll to **AI Reasoning**: photo evidence, voice context, accessibility impact, duplicate cluster, time unresolved, and the plain-English priority explanation.
3. Tap **＋** → **Report a hazard** — add a **photo + video**, record a **voice note**, pick a category (GPS auto-attaches). Hit **Analyze report**, hear the confirmation.
4. **Facilities** tab → **Briefing** plays/show a spoken summary ("Today's highest-priority issue is a blocked wheelchair ramp at the EMU entrance…"). Note *Overflowing trash* stays **capped at Medium** despite being the most-reported.
5. From **Fix First top-3**, tap **Open & generate report** → the official **Facilities Repair Report** (priority, severity, accessibility, affected groups, evidence, duplicate cluster, status, recommended action, timeframe, and a UO-addressed email). Read aloud / copy.
6. Back on a report → **Community verifications** (Confirm/Unsure/Reject) and status updates (Still broken → … → **Verified fixed**). **Profile** holds reputation as a secondary feature; **Audio Accessibility Mode** swaps the briefing voice.

> Submitted reports, reputation, verifications, and audio mode persist in `localStorage`.

---

## 📁 Project structure

```
src/
  app/
    page.tsx                 Live map home (GPS + feed + nearby)
    feed/page.tsx            Incident feed + filters
    report/page.tsx          Report (photo + video + voice + GPS)
    report/result/page.tsx   AI analysis result + voice confirmation
    dashboard/page.tsx       Facilities dashboard (severity-weighted)
    profile/page.tsx         Reputation, badges, voice persona, your reports
    reports/[id]/page.tsx    Report detail + jury + facilities report
    api/incidents/route.ts   Real Open311 data (with snapshot fallback)
  components/                PhoneShell, BottomTabBar, LiveMap, IncidentCard,
                             JuryPanel, ReputationBadge, VoicePicker, modal, icons
  lib/
    priority.ts              Severity-weighted engine + category ceilings
    jury.ts                  Report credibility scoring
    reputation.ts            Tiers, points, badges
    geo.ts / geo.shared.ts   Live location hook + distance/presence helpers
    open311.ts               Real Open311 endpoints + fetch/normalize
    reportFactory.ts         Build scored Reports (server + client)
    ai.ts                    Mock AI (Gemini-shaped) + text categorizer
    voice.ts                 Voice personas (ElevenLabs-shaped)
    memory.ts                Personalization (Backboard-shaped)
    store.tsx                Client store (Snowflake-shaped)
    mockData.ts              Your seed reports
    types.ts                 Domain types
```
