// ─────────────────────────────────────────────────────────────
// FixFirst — core domain types
// ─────────────────────────────────────────────────────────────

export type HazardCategory =
  | "Pothole"
  | "Cracked sidewalk"
  | "Blocked wheelchair ramp"
  | "Broken curb cut"
  | "Missing tactile paving"
  | "Broken light"
  | "Unsafe crossing"
  | "Crosswalk signal issue"
  | "Overflowing trash"
  | "Blocked bike lane"
  | "Flooding / standing water"
  | "Damaged sign"
  | "Fallen tree / branch"
  | "Scooter / bike obstruction"
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
  | "demo311" // other metros — demo data modeled after 311 reports
  | "community"; // community-verified

export interface CommunityUpdate {
  type: CommunityUpdateType;
  at: string;
  note?: string;
  by?: string; // friend/teammate who contributed the verification
}

// Who can see a report (privacy).
export type ReportVisibility = "public" | "anonymous" | "team" | "facilities";

// Proof-of-fix record attached to a solved/verified-fixed report —
// the closing half of the report → prioritize → route → fix → verify loop.
export interface ProofOfFix {
  fixedBy: string; // department that performed the repair
  timeToFixDays: number; // days from report to fix
  fixedAt: string; // ISO date the fix was completed
  verifiedBy: string[]; // community members who confirmed the fix
  confidence: number; // 0–100 fix-verification confidence
  afterNote: string; // what the after-evidence shows
  impact: string; // what fixing it improved
  pointsAwarded: number; // civic points awarded to the original reporter
}

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
  proofOfFix?: ProofOfFix; // present on solved / verified-fixed reports
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
