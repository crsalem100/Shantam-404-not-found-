// ─────────────────────────────────────────────────────────────
// FixFirst — SEVERITY-WEIGHTED priority engine
//
// Core principle: how serious a hazard is comes from the hazard
// itself, NOT how many people reported it. 100 reports about
// overflowing trash is still just trash; a single pothole report
// can outrank it. Volume nudges, severity decides.
//
//   score = severity (dominant base)
//         + accessibility bonus
//         + duplicate bonus   (scaled DOWN by severity, hard cap)
//         + unresolved bonus  (scaled by severity, hard cap)
//   score = min(score, CATEGORY_CEILING)   ← the guardrail
//
// Each category has a ceiling: low-stakes categories can never
// climb to Urgent no matter how many duplicate reports pile up.
// ─────────────────────────────────────────────────────────────

import type {
  AccessibilityImpact,
  HazardCategory,
  PriorityBreakdown,
  PriorityLabel,
  Report,
} from "./types";

// How high a category can ever score, regardless of report volume.
export const CATEGORY_CEILING: Record<HazardCategory, number> = {
  "Blocked wheelchair ramp": 100,
  "Broken curb cut": 98,
  "Missing tactile paving": 96,
  "Cracked sidewalk": 96,
  "Unsafe crossing": 96,
  "Crosswalk signal issue": 94,
  "Fallen tree / branch": 94,
  "Flooding / standing water": 90,
  Pothole: 92,
  "Broken light": 86,
  "Blocked bike lane": 82,
  "Scooter / bike obstruction": 80,
  "Damaged sign": 74,
  Other: 78,
  "Overflowing trash": 60, // ← even 100 reports stays Medium at most
};

export function accessibilityBonus(impact: AccessibilityImpact): number {
  switch (impact) {
    case "High":
      return 12;
    case "Medium":
      return 6;
    case "Low":
      return 2;
    default:
      return 0;
  }
}

// Volume bonus, deliberately weak: scaled by severity so low-severity
// hazards barely move even with many duplicates. Hard cap +8.
export function duplicateBonus(duplicates: number, severity: number): number {
  const raw = Math.min(duplicates, 12) * 0.6 * (severity / 100);
  return Math.round(Math.min(raw, 8));
}

// Time pressure, also severity-scaled. Hard cap +8.
export function unresolvedBonus(
  daysUnresolved: number,
  severity: number,
  status: string
): number {
  if (status === "Fixed") return 0;
  const raw = Math.min(daysUnresolved, 14) * 0.8 * (severity / 100);
  return Math.round(Math.min(raw, 8));
}

// Community verification: confirmations corroborate the hazard. Hard cap +8.
export function communityVerificationBonus(confirms: number): number {
  return Math.round(Math.min(confirms * 2, 8));
}

// Location risk: high-exposure spots (campus paths, crossings, transit,
// libraries, entrances) carry more people through the hazard. Hard cap +6.
const HIGH_TRAFFIC = /\b(emu|library|entrance|crossing|crosswalk|station|stop|plaza|quad|hall|center|gate|path|main)\b/i;
export function locationRiskFor(
  locationName: string,
  category: HazardCategory,
  impact: AccessibilityImpact
): number {
  let risk = 0;
  if (HIGH_TRAFFIC.test(locationName)) risk += 3;
  if (category === "Unsafe crossing" || category === "Blocked wheelchair ramp") risk += 2;
  if (impact === "High") risk += 2;
  else if (impact === "Medium") risk += 1;
  return Math.min(risk, 6);
}

export function labelForScore(score: number): PriorityLabel {
  if (score >= 85) return "Urgent";
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

// Priority bands — shown in the "How scoring works" modal.
export const SCORE_BANDS: { label: PriorityLabel; range: string; note: string }[] = [
  { label: "Urgent", range: "85–100", note: "Dispatch within 24 hours" },
  { label: "High", range: "65–84", note: "Inspect within 72 hours" },
  { label: "Medium", range: "40–64", note: "Schedule within 7 days" },
  { label: "Low", range: "0–39", note: "Monitor or batch repair" },
];

// The six scoring factors, in display order, for the transparent
// breakdown card. Severity is the base; the rest are capped bonuses.
export function priorityFactors(
  b: PriorityBreakdown
): { label: string; value: number; isBase?: boolean }[] {
  return [
    { label: "Severity", value: b.base, isBase: true },
    { label: "Accessibility impact", value: b.accessibilityBonus },
    { label: "Duplicate cluster", value: b.duplicateBonus },
    { label: "Unresolved time", value: b.unresolvedBonus },
    { label: "Community verification", value: b.communityVerification },
    { label: "Location risk", value: b.locationRisk },
  ];
}

export function computePriority(
  severity: number,
  impact: AccessibilityImpact,
  duplicates: number,
  daysUnresolved: number,
  category: HazardCategory,
  status: string = "Unresolved",
  communityConfirms: number = 0,
  locationRisk: number = 0
): PriorityBreakdown {
  const base = severity;
  const accBonus = accessibilityBonus(impact);
  const dupBonus = duplicateBonus(duplicates, severity);
  const unrBonus = unresolvedBonus(daysUnresolved, severity, status);
  const commBonus = status === "Fixed" ? 0 : communityVerificationBonus(communityConfirms);
  const locBonus = locationRisk;
  const ceiling = CATEGORY_CEILING[category];
  const total = Math.min(
    base + accBonus + dupBonus + unrBonus + commBonus + locBonus,
    ceiling,
    100
  );
  return {
    base,
    accessibilityBonus: accBonus,
    duplicateBonus: dupBonus,
    unresolvedBonus: unrBonus,
    communityVerification: commBonus,
    locationRisk: locBonus,
    ceiling,
    total,
    label: labelForScore(total),
  };
}

export function priorityForReport(report: Report): PriorityBreakdown {
  const confirms = report.jury.filter((j) => j.verdict === "Confirm").length;
  const locRisk = locationRiskFor(
    report.locationName,
    report.category,
    report.analysis.accessibilityImpact
  );
  return computePriority(
    report.analysis.severity,
    report.analysis.accessibilityImpact,
    report.duplicates,
    report.daysUnresolved,
    report.category,
    report.status,
    confirms,
    locRisk
  );
}

// Concrete, civic reasons a report ranks where it does — surfaced on
// the "Today's Fix First" card and the report detail page ("Why this is
// Fix First"). Operational language, not AI-magic language.
export function whyFirstReasons(report: Report): string[] {
  const reasons: string[] = [];
  if (report.analysis.accessibilityImpact === "High") reasons.push("Blocks accessible travel");
  if (report.duplicates >= 2) reasons.push(`${report.duplicates} related reports nearby`);
  const confirms = report.jury.filter((j) => j.verdict === "Confirm").length;
  if (confirms >= 1) reasons.push(`${confirms} community verification${confirms === 1 ? "" : "s"}`);
  if (report.daysUnresolved >= 1)
    reasons.push(`Unresolved for ${report.daysUnresolved} day${report.daysUnresolved === 1 ? "" : "s"}`);
  if (report.analysis.severity >= 80) reasons.push("High injury / accessibility risk");
  else if (report.analysis.severity >= 60) reasons.push("Serious hazard rating");
  reasons.push(`Recommended ${suggestedTimeframe(priorityForReport(report).label).toLowerCase()}`);
  return reasons.slice(0, 5);
}

// Recommended response window per priority (SLA). Mirrors lib/routing slaFor.
export function suggestedTimeframe(label: PriorityLabel): string {
  switch (label) {
    case "Urgent":
      return "Dispatch within 24 hours";
    case "High":
      return "Inspect within 72 hours";
    case "Medium":
      return "Schedule within 7 days";
    default:
      return "Monitor or batch repair";
  }
}

export const PRIORITY_STYLE: Record<
  PriorityLabel,
  { text: string; bg: string; border: string; dot: string; hex: string }
> = {
  Low: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    hex: "#22c55e",
  },
  Medium: {
    text: "text-yellow-300",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    dot: "bg-yellow-400",
    hex: "#eab308",
  },
  High: {
    text: "text-orange-300",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
    hex: "#f97316",
  },
  Urgent: {
    text: "text-red-300",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    dot: "bg-red-400",
    hex: "#ef4444",
  },
};
