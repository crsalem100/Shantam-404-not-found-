// ─────────────────────────────────────────────────────────────
// FixFirst — personalization memory (Backboard)
//
// ╭─ BACKBOARD INTEGRATION POINTS ─────────────────────────────╮
// │ Backboard would persistently remember, per user:            │
// │  1. The user's usual routes (to surface hazards on them).   │
// │  2. Accessibility needs (e.g. wheelchair → boost ramp/curb  │
// │     issues in their feed and alerts).                        │
// │  3. Past reports (avoid duplicate filing, track follow-ups).│
// │  4. Reporting style (tone/length of generated text).        │
// │  5. Follow-up preferences (how/when to be notified).        │
// │  6. Personalize nearby hazard alerts along saved routes.    │
// ╰──────────────────────────────────────────────────────────────╯
//
// For the MVP this is a typed stub with sensible demo defaults.
// ─────────────────────────────────────────────────────────────

export interface UserMemory {
  usualRoutes: string[];
  accessibilityNeeds: string[];
  pastReportIds: string[];
  reportingStyle: "concise" | "detailed";
  followUpPreference: "email" | "push" | "none";
}

const DEMO_MEMORY: UserMemory = {
  usualRoutes: ["13th Avenue", "EMU entrance", "Knight Library"],
  accessibilityNeeds: [],
  pastReportIds: [],
  reportingStyle: "detailed",
  followUpPreference: "email",
};

// BACKBOARD: fetch remembered profile for the current user.
export function getUserMemory(): UserMemory {
  return DEMO_MEMORY;
}

// BACKBOARD: persist a new report id / preference update for the user.
export function rememberReport(reportId: string): void {
  // no-op in MVP — Backboard write goes here.
  void reportId;
}
