// ─────────────────────────────────────────────────────────────
// FixFirst — core domain types
// ─────────────────────────────────────────────────────────────

export type HazardCategory =
  | "Pothole"
  | "Cracked sidewalk"
  | "Blocked wheelchair ramp"
  | "Broken light"
  | "Unsafe crossing"
  | "Overflowing trash"
  | "Blocked bike lane"
  | "Other";

export type PriorityLabel = "Low" | "Medium" | "High" | "Urgent";

export type AccessibilityImpact = "None" | "Low" | "Medium" | "High";

// Lifecycle states. "Unresolved" / "In progress" / "Fixed" are the
// load-bearing engine states (filters key off "Fixed"); the others are
// richer lifecycle labels surfaced in the report timeline + status pill.
export type ReportStatus =
  | "New"
  | "Unresolved"
  | "Verified"
  | "Routed"
  | "In progress"
  | "Waiting on department"
  | "Fixed"
  | "Verified fixed"
  | "Reopened";

export type CommunityUpdateType =
  | "I saw this"
  | "Still broken"
  | "Worse"
  | "Partially fixed"
  | "Fixed"
  | "Verified fixed"
  | "Duplicate";

// Where a report originated. Drives the source label + trust framing.
export type ReportSource =
  | "user" // submitted in-app
  | "uo" // UO / Eugene demo dataset
  | "sf311" // San Francisco 311
  | "nyc311" // New York City 311
  | "chicago311" // Chicago 311
  | "community"; // community-verified

export interface CommunityUpdate {
  type: CommunityUpdateType;
  at: string;
  note?: string;
  by?: string; // friend/teammate who contributed the verification
}

// Who can see a report (privacy).
export type ReportVisibility = "public" | "anonymous" | "team" | "facilities";

// A juror's verdict on whether a report is credible / well-made.
export type JurorVerdict = "Confirm" | "Reject" | "Need more info";

export interface JurorVote {
  juror: string; // display name (or "You")
  verdict: JurorVerdict;
  at: string;
}

export interface Analysis {
  issueType: HazardCategory;
  severity: number; // 1–100, severity-driven (NOT report volume)
  priority: PriorityLabel;
  accessibilityImpact: AccessibilityImpact;
  affectedGroups: string[];
  suggestedFix: string;
  duplicateProbability: number;
  duplicateNote: string;
  confidence: number;
  summary: string;
  followUpText: string;
  publicSafetyConcern: string;
  transcript: string;
  // AI reasoning surfaced to the user (Gemini-derived in production)
  visualEvidence: string; // what the photo/video shows
  voiceContext: string; // what the voice note conveyed
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Report {
  id: string;
  caseId: string; // civic case number, e.g. FF-1042
  source: ReportSource;
  department: string; // routed department (see lib/routing.ts)
  category: HazardCategory;
  locationName: string;
  spotDetails: string;
  description: string;
  photoDataUrl?: string;
  videoDataUrl?: string; // NEW: video evidence
  hasVoiceNote: boolean;
  audioDataUrl?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  duplicates: number; // related reports / upvotes (volume — capped influence)
  daysUnresolved: number;
  analysis: Analysis;
  community: CommunityUpdate[];
  // Live-location data
  geo?: GeoPoint; // real lat/lng (from GPS or Open311)
  hasGps: boolean;
  visibility?: ReportVisibility; // privacy (default "public")
  watchers: number; // how many people are "watching" this incident
  // Juror / credibility
  jury: JurorVote[];
  // map placeholder fallback position (0–100%)
  mapX: number;
  mapY: number;
}

export interface PriorityBreakdown {
  base: number;
  accessibilityBonus: number;
  duplicateBonus: number;
  unresolvedBonus: number;
  communityVerification: number; // confirmations from the jury/community
  locationRisk: number; // high-traffic / high-exposure location bonus
  ceiling: number; // category cap — severity-weighting guardrail
  total: number;
  label: PriorityLabel;
}

// Report credibility score (the "juror" score).
export interface ReportScore {
  score: number; // 0–100
  label: "Verified" | "Credible" | "Needs review" | "Low quality";
  factors: { label: string; points: number; has: boolean }[];
}

// ── User reputation + account ────────────────────────────────
export type AuthStatus = "none" | "guest" | "authed";

export interface UserProfile {
  name: string;
  reputation: number;
  reportsFiled: number;
  jurorVotesCast: number;
  confirmedReports: number;
  // account / civic-network fields (optional; set at signup)
  username?: string;
  city?: string; // city / campus
  preferredArea?: string;
  accessibilityInterests?: string[];
  reportsLedToFix?: number;
  friends?: string[]; // friend user ids
  teams?: string[]; // joined team ids
}

export interface ReputationTier {
  title: string;
  min: number;
  color: string;
}
