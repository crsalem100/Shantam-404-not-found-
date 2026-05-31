// ─────────────────────────────────────────────────────────────
// FixFirst — report assembly (pure; used on server + client)
//
// Turns three things into a fully-scored Report:
//   1. a user submission (Report page)
//   2. a real Open311 incident (the live civic feed)
//   3. a real-data snapshot (offline fallback)
// ─────────────────────────────────────────────────────────────

import type {
  Analysis,
  GeoPoint,
  HazardCategory,
  JurorVote,
  Report,
  ReportSource,
  ReportStatus,
} from "./types";
import { analyzeReport, categorizeText } from "./ai";
import { hash, watchersFor } from "./geo.shared";
import { departmentFor } from "./routing";
import { cityByKey } from "./cities";
import type { RawIncident } from "./open311";

// Civic case number, deterministic per report id (e.g. FF-1042).
function caseIdFor(id: string): string {
  return `FF-${1000 + (hash(id) % 9000)}`;
}

const JURORS = [
  "Marisol R.",
  "Devon K.",
  "Priya S.",
  "Andre W.",
  "Lena M.",
  "Tariq H.",
  "Grace P.",
  "Noah B.",
];

// Deterministic jury panel from the report id + evidence richness.
function buildJury(seed: string, evidence: number): JurorVote[] {
  const h = hash(seed);
  const count = 2 + (h % 4); // 2–5 jurors
  const votes: JurorVote[] = [];
  for (let i = 0; i < count; i++) {
    const jh = hash(`${seed}:${i}`);
    // More evidence → more confirmations.
    const confirmBias = evidence >= 60 ? 78 : evidence >= 35 ? 60 : 42;
    const roll = jh % 100;
    const verdict =
      roll < confirmBias ? "Confirm" : roll < confirmBias + 18 ? "Need more info" : "Reject";
    votes.push({
      juror: JURORS[(h + i) % JURORS.length],
      verdict,
      at: new Date(Date.now() - (i + 1) * 3600_000).toISOString(),
    });
  }
  return votes;
}

function daysBetween(iso: string): number {
  const d = (Date.now() - new Date(iso).getTime()) / 86400000;
  return Math.max(0, Math.round(d));
}

export interface BuildArgs {
  id: string;
  source: ReportSource;
  category: HazardCategory;
  locationName: string;
  spotDetails: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  status?: ReportStatus;
  geo?: GeoPoint;
  duplicates?: number;
  photoDataUrl?: string;
  videoDataUrl?: string;
  audioDataUrl?: string;
  hasVoiceNote?: boolean;
  analysisOverride?: Analysis;
  caseIdOverride?: string; // pin a human case number (e.g. UO-FF-1001)
  juryOverride?: JurorVote[]; // pin the verification panel (demo case)
}

export function buildReport(args: BuildArgs): Report {
  const hasPhoto = !!args.photoDataUrl || args.source !== "user";
  const analysis =
    args.analysisOverride ??
    analyzeReport({
      category: args.category,
      locationName: args.locationName,
      spotDetails: args.spotDetails,
      description: args.description,
      hasPhoto,
      hasVoiceNote: !!args.hasVoiceNote,
    });

  const duplicates = args.duplicates ?? hash(args.id) % 6;
  const status = args.status ?? "Unresolved";
  const createdAt = args.createdAt;
  const evidence =
    (hasPhoto ? 25 : 0) +
    (args.videoDataUrl ? 20 : 0) +
    (args.hasVoiceNote ? 20 : 0) +
    (args.description.length > 40 ? 15 : 0) +
    (args.spotDetails ? 10 : 0) +
    (args.geo ? 10 : 0);

  // Keep an explicit override's duplicate probability; otherwise derive it.
  const dupProb = args.analysisOverride
    ? analysis.duplicateProbability
    : Math.min(95, 30 + duplicates * 9);

  // deterministic map position from geo or id (placeholder schematic only)
  const h = hash(args.id);
  return {
    id: args.id,
    caseId: args.caseIdOverride ?? caseIdFor(args.id),
    source: args.source,
    department: departmentFor(args.category),
    category: args.category,
    locationName: args.locationName,
    spotDetails: args.spotDetails,
    description: args.description,
    photoDataUrl: args.photoDataUrl,
    videoDataUrl: args.videoDataUrl,
    audioDataUrl: args.audioDataUrl,
    hasVoiceNote: !!args.hasVoiceNote,
    status,
    createdAt,
    updatedAt: args.updatedAt ?? createdAt,
    duplicates,
    daysUnresolved: status === "Fixed" ? 0 : daysBetween(createdAt),
    analysis: { ...analysis, duplicateProbability: dupProb },
    community:
      status === "Fixed"
        ? [{ type: "Fixed", at: args.updatedAt ?? createdAt }]
        : [{ type: "Still broken", at: args.updatedAt ?? createdAt }],
    geo: args.geo,
    hasGps: !!args.geo,
    watchers: watchersFor(args.id, Date.now()),
    jury: args.juryOverride ?? buildJury(args.id, evidence),
    mapX: 12 + (h % 76),
    mapY: 16 + ((h >> 4) % 64),
  };
}

// Real Open311 incident → scored Report.
export function reportFromRaw(raw: RawIncident, i: number, source: ReportSource = "community"): Report {
  const category = categorizeText(`${raw.serviceName} ${raw.description}`);
  return buildReport({
    id: `o311-${raw.externalId || i}`,
    source,
    category,
    locationName: raw.address || raw.serviceName,
    spotDetails: raw.serviceName,
    description: raw.description || raw.serviceName,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    status: raw.status,
    geo: raw.geo,
  });
}

// Additional University of Oregon / Eugene reports that supplement the
// always-present community seed. (Live Open311 has no Eugene coverage, so
// these stand in for the live civic feed during the local demo.)
const SNAPSHOT: {
  cat: HazardCategory;
  location: string;
  spot: string;
  desc: string;
  lat: number;
  lng: number;
  days: number;
  dup: number;
  status: ReportStatus;
}[] = [
  { cat: "Unsafe crossing", location: "Franklin Blvd crossing", spot: "At Agate St, near the footbridge", desc: "Cars speed through and the crossing signal timing is too short for pedestrians.", lat: 44.0436, lng: -123.0689, days: 6, dup: 5, status: "Unresolved" },
  { cat: "Pothole", location: "Kincaid Street", spot: "Northbound lane near 15th Ave", desc: "Deep pothole catching bike tires; riders swerve toward traffic.", lat: 44.0461, lng: -123.0717, days: 4, dup: 3, status: "Unresolved" },
  { cat: "Broken light", location: "University Street", spot: "Pathway lights between 13th and 15th", desc: "Several path lights out; very dark walking to the dorms at night.", lat: 44.0455, lng: -123.0735, days: 9, dup: 2, status: "In progress" },
  { cat: "Blocked wheelchair ramp", location: "Duck Store entrance", spot: "13th Ave ramp blocked by delivery dollies", desc: "Accessible ramp blocked again by deliveries during morning class change.", lat: 44.0449, lng: -123.0756, days: 2, dup: 3, status: "Unresolved" },
];

export function buildSnapshotReports(_center: GeoPoint, _cityName: string): Report[] {
  return SNAPSHOT.map((s, i) => {
    const createdAt = new Date(Date.now() - (s.days + 1) * 86400000).toISOString();
    return buildReport({
      id: `uo-feed-${i}`,
      source: "uo",
      category: s.cat,
      locationName: s.location,
      spotDetails: s.spot,
      description: s.desc,
      createdAt,
      status: s.status,
      duplicates: s.dup,
      geo: { lat: s.lat, lng: s.lng },
    });
  });
}

// ── Multi-city 311 sample (mocked) ───────────────────────────
// Generates a representative sample of a city's open cases around its
// center, sourced/labeled for that city. The big snapshot numbers live
// in lib/cities.ts; this is the map/feed sample (not all N thousand).
// SNOWFLAKE: replace with a windowed SELECT over the city's 311 table.
const CITY_CASE_DESCRIPTIONS: Record<HazardCategory, { spot: string; desc: string }> = {
  Pothole: { spot: "Pothole — roadway", desc: "Deep pothole in the travel lane reported by multiple drivers." },
  "Cracked sidewalk": { spot: "Damaged sidewalk", desc: "Cracked, uplifted sidewalk slab — trip and accessibility hazard." },
  "Blocked wheelchair ramp": { spot: "ADA curb ramp obstruction", desc: "Curb ramp blocked, no step-free alternative posted." },
  "Broken light": { spot: "Street light out", desc: "Street light outage reported; dark at night." },
  "Unsafe crossing": { spot: "Faded crosswalk / signal", desc: "Crossing markings worn; pedestrians report near-misses." },
  "Overflowing trash": { spot: "Sanitation — overflow", desc: "Public receptacle overflowing onto the sidewalk." },
  "Blocked bike lane": { spot: "Bike lane obstruction", desc: "Bike lane blocked, forcing cyclists into traffic." },
  Other: { spot: "Service request", desc: "Public-space hazard reported for inspection." },
};

const CITY_STREETS: Record<string, string[]> = {
  sf311: ["Market St", "Mission St", "Valencia St", "Geary Blvd", "Folsom St", "Van Ness Ave", "Embarcadero", "Castro St"],
  nyc311: ["Broadway", "5th Ave", "Canal St", "Atlantic Ave", "Flatbush Ave", "Grand Concourse", "Queens Blvd", "Bowery"],
  chicago311: ["Michigan Ave", "State St", "Halsted St", "Clark St", "Ashland Ave", "Western Ave", "Milwaukee Ave", "Damen Ave"],
  us: ["Main St", "1st Ave", "Park Blvd", "Oak St", "Lincoln Ave", "Washington St", "Maple Ave", "Highland Rd"],
};

export function buildCityReports(cityKey: string): Report[] {
  const city = cityByKey(cityKey);
  if (city.key === "uo") return buildSnapshotReports(city.center, city.name);

  const streets = CITY_STREETS[city.key] ?? CITY_STREETS.us;
  const cats = city.emphasis;
  const out: Report[] = [];
  const N = 12;
  for (let i = 0; i < N; i++) {
    const seed = hash(`${city.key}:${i}`);
    const cat = cats[i % cats.length];
    const street = streets[i % streets.length];
    const blockNo = 100 + (seed % 900);
    const days = seed % 12;
    const dup = (seed >> 3) % 9;
    const status: ReportStatus = days > 10 && i % 5 === 0 ? "In progress" : i % 7 === 0 ? "Fixed" : "Unresolved";
    const meta = CITY_CASE_DESCRIPTIONS[cat];
    // spread a sample around the city center
    const dLat = (((seed % 200) - 100) / 100) * 0.05;
    const dLng = ((((seed >> 5) % 200) - 100) / 100) * 0.06;
    out.push(
      buildReport({
        id: `${city.key}-${i}`,
        source: city.source,
        category: cat,
        locationName: `${blockNo} ${street}`,
        spotDetails: meta.spot,
        description: meta.desc,
        createdAt: new Date(Date.now() - (days + 1) * 86400000).toISOString(),
        status,
        duplicates: dup,
        geo: { lat: city.center.lat + dLat, lng: city.center.lng + dLng },
      })
    );
  }
  return out;
}
