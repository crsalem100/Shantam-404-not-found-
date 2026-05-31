// ─────────────────────────────────────────────────────────────
// FixFirst — civic intelligence metrics
//
// The layer that separates FixFirst from a reporting app. From a
// report's category + evidence + location we derive operational
// signals a facilities team actually prioritizes on:
//   • Route disruption   — does it break an important travel route?
//   • Repair ROI         — public benefit ÷ repair effort
//   • Fix impact         — what fixing it improves (people, risk, time)
//   • Accessibility debt — a city/campus's unresolved-access burden
// All derived deterministically from the data on screen.
// ─────────────────────────────────────────────────────────────

import type { HazardCategory, Report } from "./types";
import { priorityForReport } from "./priority";

// ── Route disruption ─────────────────────────────────────────
const ACCESS_CATEGORIES: HazardCategory[] = [
  "Blocked wheelchair ramp",
  "Broken curb cut",
  "Missing tactile paving",
  "Cracked sidewalk",
];
const NIGHT_CATEGORIES: HazardCategory[] = ["Broken light", "Crosswalk signal issue"];
const BIKE_CATEGORIES: HazardCategory[] = ["Blocked bike lane", "Pothole"];

export function routeDisruptionFor(report: Report): string {
  const loc = report.locationName.toLowerCase();
  const cat = report.category;
  if (ACCESS_CATEGORIES.includes(cat)) return "Blocks an accessible travel route";
  if (NIGHT_CATEGORIES.includes(cat)) return "Affects a night pedestrian-safety route";
  if (BIKE_CATEGORIES.includes(cat) && /bike|lane|ave|blvd|st\b/.test(loc))
    return "Affects a bike commute route";
  if (cat === "Unsafe crossing") return "Near a high-traffic pedestrian crossing";
  if (/transit|station|stop|bus/.test(loc)) return "Near a transit stop";
  if (/library|emu|hall|center|entrance|quad/.test(loc)) return "Near a high-traffic campus path";
  if (report.analysis.severity >= 70) return "Forces users off the path into the street";
  return "No major route disruption detected";
}

// ── Repair ROI (public benefit ÷ effort) ─────────────────────
// Effort is a rough per-category repair cost; benefit tracks severity,
// accessibility, exposure and verification. ROI = benefit / effort * k.
const REPAIR_EFFORT: Record<HazardCategory, number> = {
  Pothole: 3,
  "Cracked sidewalk": 5,
  "Blocked wheelchair ramp": 2,
  "Broken curb cut": 6,
  "Missing tactile paving": 5,
  "Broken light": 4,
  "Unsafe crossing": 7,
  "Crosswalk signal issue": 5,
  "Overflowing trash": 1,
  "Blocked bike lane": 2,
  "Flooding / standing water": 6,
  "Damaged sign": 2,
  "Fallen tree / branch": 4,
  "Scooter / bike obstruction": 1,
  Other: 4,
};

export function repairROIFor(report: Report): number {
  const p = priorityForReport(report);
  const accBoost =
    report.analysis.accessibilityImpact === "High"
      ? 1.25
      : report.analysis.accessibilityImpact === "Medium"
      ? 1.1
      : 1;
  const benefit = p.total * accBoost; // 0–~125
  const effort = REPAIR_EFFORT[report.category]; // 1–7
  // Normalize to a clean 40–99 ROI band.
  const raw = (benefit / (effort + 3)) * 6;
  return Math.max(40, Math.min(99, Math.round(raw + 30)));
}

export function roiLabel(roi: number): string {
  if (roi >= 85) return "Very high return";
  if (roi >= 70) return "High return";
  if (roi >= 55) return "Moderate return";
  return "Lower return";
}

// ── People affected (rough daily exposure) ───────────────────
export function peopleAffectedFor(report: Report): number {
  const loc = report.locationName.toLowerCase();
  let base = 200;
  if (/emu|library|hall|center|station|quad|main|entrance/.test(loc)) base = 1200;
  else if (/ave|blvd|st\b|street|crossing/.test(loc)) base = 600;
  const sevMult = 1 + report.analysis.severity / 200;
  const dupMult = 1 + Math.min(report.duplicates, 8) * 0.05;
  return Math.round((base * sevMult * dupMult) / 10) * 10;
}

// ── Fix impact summary ───────────────────────────────────────
const IMPACT_BY_CATEGORY: Partial<Record<HazardCategory, string>> = {
  "Blocked wheelchair ramp": "Restores accessible travel near a major entrance.",
  "Broken curb cut": "Restores the step-free path between sidewalk and street.",
  "Missing tactile paving": "Restores the safety cue blind pedestrians rely on at the curb.",
  "Cracked sidewalk": "Removes a trip hazard and reopens an accessible walking path.",
  "Broken light": "Improves night safety on a high-traffic pedestrian route.",
  "Unsafe crossing": "Reduces pedestrian collision risk at a busy crossing.",
  "Crosswalk signal issue": "Restores a reliable walk phase for pedestrians.",
  Pothole: "Reduces bike and vehicle hazard risk in the travel lane.",
  "Blocked bike lane": "Keeps cyclists out of merged car traffic.",
  "Overflowing trash": "Reduces sanitation and pest risk on the walkway.",
  "Flooding / standing water": "Reopens a flooded path and removes a slip/ice hazard.",
  "Damaged sign": "Restores a warning or wayfinding cue people rely on.",
  "Fallen tree / branch": "Clears a blocked path and removes a fall hazard.",
  "Scooter / bike obstruction": "Reopens the accessible path blocked by dockless devices.",
};

export interface FixImpact {
  summary: string;
  peopleAffected: number;
  routeDisruption: string;
  riskReduced: string;
  daysUnresolved: number;
}

export function fixImpactFor(report: Report): FixImpact {
  const acc = report.analysis.accessibilityImpact;
  const risk =
    acc === "High"
      ? "High accessibility risk reduced"
      : report.analysis.severity >= 75
      ? "High safety risk reduced"
      : report.analysis.severity >= 55
      ? "Moderate safety risk reduced"
      : "Sanitation / nuisance risk reduced";
  return {
    summary: IMPACT_BY_CATEGORY[report.category] ?? "Improves safety and access on this route.",
    peopleAffected: peopleAffectedFor(report),
    routeDisruption: routeDisruptionFor(report),
    riskReduced: risk,
    daysUnresolved: report.daysUnresolved,
  };
}

// ── Accessibility debt (per report set) ──────────────────────
// The unresolved-accessibility burden in a set of reports: how many
// access-critical issues are open, weighted by severity + age.
export function accessibilityDebtFor(reports: Report[]): {
  score: number;
  openAccessIssues: number;
  breakdown: { label: string; count: number }[];
} {
  const open = reports.filter((r) => r.status !== "Fixed" && r.status !== "Verified fixed");
  const access = open.filter(
    (r) => r.analysis.accessibilityImpact === "High" || r.analysis.accessibilityImpact === "Medium"
  );
  const count = (cat: HazardCategory) => access.filter((r) => r.category === cat).length;
  const breakdown = [
    { label: "Blocked ramps", count: count("Blocked wheelchair ramp") },
    { label: "Broken curb cuts", count: count("Broken curb cut") },
    { label: "Sidewalk hazards", count: count("Cracked sidewalk") },
    { label: "Unsafe crossings", count: count("Unsafe crossing") + count("Crosswalk signal issue") },
    { label: "Poor lighting", count: count("Broken light") },
  ].filter((b) => b.count > 0);

  if (open.length === 0) return { score: 0, openAccessIssues: 0, breakdown };
  // Debt scales with the share of open issues that are access-critical,
  // their average severity, and how long they've gone unresolved.
  const share = access.length / open.length;
  const avgSev = access.length
    ? access.reduce((s, r) => s + r.analysis.severity, 0) / access.length
    : 0;
  const avgAge = access.length
    ? access.reduce((s, r) => s + r.daysUnresolved, 0) / access.length
    : 0;
  const score = Math.round(Math.min(100, share * 55 + (avgSev / 100) * 30 + Math.min(avgAge, 14) * 1.3));
  return { score, openAccessIssues: access.length, breakdown };
}
