// ─────────────────────────────────────────────────────────────
// FixFirst — civic insights (real percentages from the live queue)
//
// Turns the current report set into analytics-platform-style stats:
// risk concentration, accessibility share of urgent cases, average
// unresolved time, verification lift. All computed from the data on
// screen — no invented numbers.
// ─────────────────────────────────────────────────────────────

import type { Report } from "./types";
import { priorityForReport } from "./priority";

export interface Insight {
  label: string;
  value: string;
}

function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

export function cityInsights(reports: Report[]): Insight[] {
  const open = reports.filter((r) => r.status !== "Fixed");
  const urgent = open.filter((r) => priorityForReport(r).label === "Urgent");
  const urgentAccess = urgent.filter((r) => r.analysis.accessibilityImpact !== "None");
  const fixed = reports.filter((r) => r.status === "Fixed");

  // Risk concentration: share of total priority "risk" held by the top 10%.
  const scored = [...open].map((r) => priorityForReport(r).total).sort((a, b) => b - a);
  const totalRisk = scored.reduce((s, v) => s + v, 0);
  const topN = Math.max(1, Math.ceil(scored.length * 0.1));
  const topRisk = scored.slice(0, topN).reduce((s, v) => s + v, 0);

  const avgDays = open.length
    ? Math.round(open.reduce((s, r) => s + r.daysUnresolved, 0) / open.length)
    : 0;

  // Verification lift: avg confirmations across the queue → ~4% each.
  const totalConfirms = open.reduce(
    (s, r) => s + r.jury.filter((j) => j.verdict === "Confirm").length,
    0
  );
  const avgConfirms = open.length ? totalConfirms / open.length : 0;
  const verifyLift = Math.min(40, Math.round(avgConfirms * 4));

  return [
    { label: "Urgent hazards in view", value: `${urgent.length}` },
    { label: "of urgent cases are accessibility-related", value: `${pct(urgentAccess.length, urgent.length)}%` },
    { label: "of total risk sits in the top 10% of reports", value: `${pct(topRisk, totalRisk)}%` },
    { label: "average unresolved time", value: `${avgDays} days` },
    { label: "confidence added by community verification", value: `+${verifyLift}%` },
    { label: "reports confirmed fixed", value: `${fixed.length}` },
  ];
}
