// ─────────────────────────────────────────────────────────────
// FixFirst — department routing + SLA recommendations
//
// Turns a hazard into an actionable work order: which department
// owns it and how fast it should be handled. This is what makes a
// priority score actionable for a real facilities/public-works team.
// ─────────────────────────────────────────────────────────────

import type { HazardCategory, PriorityLabel, ReportSource } from "./types";

// Which department should handle each hazard category.
export const DEPARTMENT_FOR_CATEGORY: Record<HazardCategory, string> = {
  Pothole: "Public Works / Transportation",
  "Broken light": "Utilities / Facilities",
  "Blocked wheelchair ramp": "Accessibility Services / Facilities",
  "Overflowing trash": "Sanitation",
  "Unsafe crossing": "Transportation Safety",
  "Blocked bike lane": "Mobility / Transportation",
  "Cracked sidewalk": "Public Works / Accessibility Services",
  Other: "Facilities / Triage",
};

export function departmentFor(category: HazardCategory): string {
  return DEPARTMENT_FOR_CATEGORY[category];
}

// SLA / fix-deadline recommendation, derived from priority.
export interface Sla {
  window: string; // "24 hours"
  text: string; // "Dispatch within 24 hours"
}

export function slaFor(label: PriorityLabel): Sla {
  switch (label) {
    case "Urgent":
      return { window: "24 hours", text: "Dispatch within 24 hours" };
    case "High":
      return { window: "72 hours", text: "Inspect within 72 hours" };
    case "Medium":
      return { window: "7 days", text: "Schedule within 7 days" };
    default:
      return { window: "batch", text: "Monitor or batch repair" };
  }
}

// Human-readable label for a report's data source.
export const SOURCE_LABEL: Record<ReportSource, string> = {
  user: "User report",
  uo: "UO demo",
  sf311: "SF 311",
  nyc311: "NYC 311",
  chicago311: "Chicago 311",
  community: "Community verified",
};

export function sourceLabel(source: ReportSource): string {
  return SOURCE_LABEL[source];
}
