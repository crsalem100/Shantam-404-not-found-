// ─────────────────────────────────────────────────────────────
// FixFirst — 311 call support
//
// FixFirst does not replace 311 — it organizes a report so a resident
// can make an effective official service request. This module turns a
// scored report into: a spoken 311 call script, a city-service email,
// and a copyable summary. It also holds the per-city service directory.
//
// ElevenLabs: the call script + email are designed to be read aloud
// (accessibility audio + "rehearse your 311 call").
// ─────────────────────────────────────────────────────────────

import type { Report } from "./types";
import { priorityForReport } from "./priority";
import { slaFor } from "./routing";
import { juryTally } from "./jury";
import { routeDisruptionFor } from "./civic";

export const CALL_311_DISCLAIMER =
  "FixFirst helps prioritize and organize repair reports. For official city service requests, contact your local 311 or city services department.";

// Generate the spoken 311 call script for a report.
export function generate311Script(report: Report): string {
  const p = priorityForReport(report);
  const tally = juryTally(report);
  const where = report.locationName + (report.spotDetails ? ` (${report.spotDetails})` : "");
  const verified =
    tally.confirm >= 1 ? ` It has ${report.duplicates} related reports and ${tally.confirm} community verifications.` : "";
  const access =
    report.analysis.accessibilityImpact === "High"
      ? " The issue blocks accessible travel and may force wheelchair users into an unsafe detour."
      : report.analysis.accessibilityImpact === "Medium"
      ? " The issue affects accessible and pedestrian travel in the area."
      : "";

  return [
    `Hi, I'd like to report a ${p.label.toLowerCase()}-priority ${report.category.toLowerCase()}.`,
    `There is a ${report.category.toLowerCase()} at ${where}.${access}${verified}`,
    `${routeDisruptionFor(report)}.`,
    `Please route this to ${report.department} for review. The recommended response is to ${slaFor(p.label).text.toLowerCase()}.`,
    `The FixFirst case ID is ${report.caseId}. Thank you.`,
  ].join(" ");
}

// Generate a city-service email body for the report.
export function generateServiceEmail(report: Report): string {
  const p = priorityForReport(report);
  const tally = juryTally(report);
  return [
    `Subject: ${report.category} — ${report.locationName} (${report.caseId})`,
    ``,
    `To whom it may concern,`,
    ``,
    `I'm reporting a ${report.category.toLowerCase()} at ${report.locationName}` +
      `${report.spotDetails ? `, specifically ${report.spotDetails}` : ""}.`,
    ``,
    `Priority: ${p.total}/100 (${p.label})`,
    `Accessibility impact: ${report.analysis.accessibilityImpact}`,
    `Route disruption: ${routeDisruptionFor(report)}`,
    `Related reports: ${report.duplicates} · Community verifications: ${tally.confirm}`,
    `Suggested department: ${report.department}`,
    `Recommended response: ${slaFor(p.label).text}`,
    ``,
    `Summary: ${report.analysis.summary}`,
    `Suggested action: ${report.analysis.suggestedFix}`,
    ``,
    `Reported via FixFirst (case ${report.caseId}).`,
  ].join("\n");
}

// A short copyable summary.
export function reportSummary(report: Report): string {
  const p = priorityForReport(report);
  return `${report.category} at ${report.locationName} — ${p.label} (${p.total}/100), ${report.department}, ${slaFor(p.label).text}. Case ${report.caseId}.`;
}

// ── Per-city service directory ───────────────────────────────
export interface ServiceLine {
  label: string;
  detail: string;
  tel?: string; // tel: number (or 311)
  href?: string; // service portal placeholder
}

export interface CityServices {
  has311: boolean;
  lines: ServiceLine[];
}

// Keyed by city dataset key. Phone lines are real 311 where the city
// runs one; portal links are placeholders pending official wiring.
export const CITY_SERVICES: Record<string, CityServices> = {
  uo: {
    has311: true,
    lines: [
      { label: "City of Eugene service line", detail: "Non-emergency city service requests", tel: "5416826915" },
      { label: "UO Facilities Services", detail: "Campus repair + maintenance", tel: "5413462319" },
      { label: "UO Accessible Education Center", detail: "Accessibility barriers on campus", href: "#service-portal" },
      { label: "Eugene Public Works", detail: "Streets, sidewalks, signals", href: "#service-portal" },
    ],
  },
  sf311: {
    has311: true,
    lines: [
      { label: "SF 311", detail: "Non-emergency city services", tel: "311" },
      { label: "SF Public Works", detail: "Streets + sidewalks", href: "#service-portal" },
      { label: "SFMTA", detail: "Transportation + signals", href: "#service-portal" },
    ],
  },
  nyc311: {
    has311: true,
    lines: [
      { label: "NYC 311", detail: "Non-emergency city services", tel: "311" },
      { label: "NYC DOT", detail: "Streets, sidewalks, signals", href: "#service-portal" },
      { label: "NYC DSNY", detail: "Sanitation", href: "#service-portal" },
    ],
  },
  chicago311: {
    has311: true,
    lines: [
      { label: "Chicago 311", detail: "Non-emergency city services", tel: "311" },
      { label: "CDOT", detail: "Streets + signals", href: "#service-portal" },
      { label: "Streets & Sanitation", detail: "Sanitation + forestry", href: "#service-portal" },
    ],
  },
};

// Most large U.S. metros run a 311 line; fall back to a generic entry.
export function servicesForCity(cityKey: string, cityName: string): CityServices {
  if (CITY_SERVICES[cityKey]) return CITY_SERVICES[cityKey];
  return {
    has311: true,
    lines: [
      { label: `${cityName} 311`, detail: "Non-emergency city service requests", tel: "311" },
      { label: "Public Works", detail: "Streets, sidewalks, drainage", href: "#service-portal" },
      { label: "Transportation", detail: "Crossings + signals", href: "#service-portal" },
    ],
  };
}
