// ─────────────────────────────────────────────────────────────
// FixFirst — sponsor integration map
//
// FixFirst is built so each sponsor technology drops into a clearly
// marked seam. This module documents WHERE each integration lives so
// the wiring is obvious in a demo/code review. The app runs fully on
// deterministic fallbacks today; flip these on with the noted env keys.
// ─────────────────────────────────────────────────────────────

export interface IntegrationSeam {
  sponsor: string;
  uses: string[];
  seams: string[]; // files / functions where it plugs in
  env?: string[]; // environment variables that enable it
}

export const INTEGRATIONS: IntegrationSeam[] = [
  {
    sponsor: "Google",
    uses: [
      "Google Maps base tiles + flyTo",
      "Places autocomplete (search + report location)",
      "Browser geolocation + live tracking",
      "Reverse geocoding (GPS → readable address)",
    ],
    seams: [
      "components/LiveMapLeaflet.tsx — swap the CARTO TileLayer for Google Maps JS API",
      "components/SearchBar.tsx / lib/search.ts — back buildSuggestions() with Places Autocomplete",
      "lib/geo.ts — useLiveLocation() already uses navigator.geolocation; add Geocoding for addresses",
      "app/report/page.tsx — attach reverse-geocoded address to the submission",
    ],
    env: ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"],
  },
  {
    sponsor: "Gemini",
    uses: [
      "Analyze uploaded photo / video",
      "Analyze voice transcript",
      "Generate severity + accessibility-impact scores",
      "Generate the facilities report draft",
    ],
    seams: [
      "lib/ai.ts — analyzeReport() is the single seam; replace the heuristic with a Gemini multimodal call",
      "app/report/page.tsx submit() — '// GEMINI: analyze photo + video + transcript and merge here.'",
      "lib/confidence.ts — confidenceMetrics() consumes the model's per-dimension confidences",
      "components/FacilitiesReportModal.tsx — generated report text",
    ],
    env: ["GEMINI_API_KEY"],
  },
  {
    sponsor: "Snowflake",
    uses: [
      "Store 311 data + user reports",
      "Store verification history + duplicate clusters",
      "Power city / national dashboards + leaderboards",
    ],
    seams: [
      "app/api/city/route.ts + app/api/incidents/route.ts — upsert normalized reports into the warehouse",
      "data/normalizeReport.ts — the canonical row shape that lands in Snowflake",
      "lib/store.tsx — every mutation maps to a warehouse write (see header note)",
      "components/CivicSnapshot.tsx + lib/cities.ts — snapshots = materialized views",
    ],
    env: ["SNOWFLAKE_ACCOUNT", "SNOWFLAKE_USER", "SNOWFLAKE_PASSWORD"],
  },
  {
    sponsor: "ElevenLabs",
    uses: [
      "Voice briefing of the priority queue",
      "Accessibility audio alerts",
      "Facilities dispatch summary audio",
      "Report confirmation audio",
    ],
    seams: [
      "lib/voice.ts — speak() falls back to browser SpeechSynthesis; route to ElevenLabs TTS when keyed",
      "app/page.tsx playBriefing() + app/dashboard/page.tsx playBriefing()",
      "app/reports/[id]/page.tsx — 'Play accessibility alert'",
      "app/report/result/page.tsx — spoken report confirmation",
    ],
    env: ["ELEVENLABS_API_KEY"],
  },
  {
    sponsor: "Backboard",
    uses: [
      "Persistent user profile + accessibility preferences",
      "Reporting interests + saved areas",
      "Friends / teams",
      "Past reports + reward eligibility",
    ],
    seams: [
      "lib/store.tsx — user, friends, joinedTeams, voicePreset persist to localStorage today; back with Backboard",
      "components/AuthGate.tsx — createAccount()/signIn() write the remembered profile",
      "lib/reputation.ts — badges + reward eligibility are remembered per user",
    ],
  },
  {
    sponsor: "DigitalOcean",
    uses: ["Deployment-ready Next.js app (App Platform)"],
    seams: [
      ".do/ app spec + Dockerfile-ready Next standalone build",
      "next build → containerized deploy",
    ],
  },
];
