// ─────────────────────────────────────────────────────────────
// FixFirst — reputation, points, badges & rewards
//
// FixFirst rewards VERIFIED IMPACT, not spam. Points come from
// well-evidenced reports the community confirms — and from helping
// verify others — not from raw posting volume.
//
// BACKBOARD: reputation, badges, history and reward eligibility are
// remembered per user and personalize their experience.
// ─────────────────────────────────────────────────────────────

import type { ReputationTier, Report, UserProfile } from "./types";

export const TIERS: ReputationTier[] = [
  { title: "Newcomer", min: 0, color: "#94a3b8" },
  { title: "Reporter", min: 60, color: "#38bdf8" },
  { title: "Trusted Reporter", min: 180, color: "#22c55e" },
  { title: "Civic Guardian", min: 400, color: "#f97316" },
  { title: "FixFirst Champion", min: 800, color: "#a855f7" },
];

export function tierFor(reputation: number): {
  tier: ReputationTier;
  next?: ReputationTier;
  progress: number;
} {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) if (reputation >= TIERS[i].min) idx = i;
  const tier = TIERS[idx];
  const next = TIERS[idx + 1];
  const progress = next ? (reputation - tier.min) / (next.min - tier.min) : 1;
  return { tier, next, progress: Math.max(0, Math.min(1, progress)) };
}

// Point system — verified impact over volume.
export const POINTS = {
  submitReport: 5,
  addPhoto: 5,
  addVoice: 5,
  addVideo: 5,
  reportVerified: 10, // your report verified by others
  reportLedToFix: 25,
  verifyOther: 3, // verify someone else's report
  duplicateSpam: -10,
  falseReport: -25,
  markFixed: 6,
};

// The point breakdown shown to users — "FixFirst rewards verified impact, not spam."
export const POINT_RULES: { label: string; points: number }[] = [
  { label: "Submit a report", points: POINTS.submitReport },
  { label: "Add a photo", points: POINTS.addPhoto },
  { label: "Add a voice note", points: POINTS.addVoice },
  { label: "Report verified by others", points: POINTS.reportVerified },
  { label: "Report leads to a fix", points: POINTS.reportLedToFix },
  { label: "Verify someone else's report", points: POINTS.verifyOther },
  { label: "Duplicate / spam report", points: POINTS.duplicateSpam },
  { label: "False report", points: POINTS.falseReport },
];

// Points awarded for filing a report, weighted by attached evidence.
export function pointsForSubmission(report: Report): number {
  let pts = POINTS.submitReport;
  if (report.photoDataUrl) pts += POINTS.addPhoto;
  if (report.hasVoiceNote) pts += POINTS.addVoice;
  if (report.videoDataUrl) pts += POINTS.addVideo;
  return pts;
}

// ── Badges as PROGRESS, not flat flags ───────────────────────
// Each badge has a measurable requirement, a current value, a goal,
// and reward points — so locked badges feel aspirational and show how
// close the user is.
export interface BadgeProgress {
  label: string;
  description: string; // civic "why it matters" line
  requirement: string; // human-readable requirement
  current: number;
  goal: number;
  rewardPoints: number;
  pct: number; // 0–100
  earned: boolean;
}

export const BADGE_DEFS: {
  label: string;
  description: string;
  requirement: string;
  goal: number;
  rewardPoints: number;
  count: (p: UserProfile, reports: Report[]) => number;
}[] = [
  {
    label: "First Report",
    description: "You filed your first verified hazard report.",
    requirement: "File 1 report",
    goal: 1,
    rewardPoints: 20,
    count: (p) => p.reportsFiled,
  },
  {
    label: "Verified Reporter",
    description: "Your reports are confirmed by the community.",
    requirement: "Get 1 report verified",
    goal: 1,
    rewardPoints: 30,
    count: (p) => p.confirmedReports,
  },
  {
    label: "Accessibility Advocate",
    description: "Your verified accessibility reports helped prioritize safer public paths.",
    requirement: "3 verified accessibility reports",
    goal: 3,
    rewardPoints: 60,
    count: (_p, r) => r.filter((x) => x.analysis.accessibilityImpact === "High").length,
  },
  {
    label: "Ramp Guardian",
    description: "You keep curb cuts and ramps clear for wheelchair users.",
    requirement: "5 ramp or curb-cut reports verified",
    goal: 5,
    rewardPoints: 80,
    count: (_p, r) => r.filter((x) => x.category === "Blocked wheelchair ramp").length,
  },
  {
    label: "Night Safety Watch",
    description: "Your lighting reports make night routes safer.",
    requirement: "5 verified lighting / night-safety reports",
    goal: 5,
    rewardPoints: 80,
    count: (_p, r) => r.filter((x) => x.category === "Broken light").length,
  },
  {
    label: "Pothole Hunter",
    description: "You flag road hazards before they cause damage.",
    requirement: "5 pothole reports",
    goal: 5,
    rewardPoints: 80,
    count: (_p, r) => r.filter((x) => x.category === "Pothole").length,
  },
  {
    label: "Civic Guardian",
    description: "Sustained, trusted civic contribution.",
    requirement: "400 civic impact points",
    goal: 400,
    rewardPoints: 100,
    count: (p) => p.reputation,
  },
  {
    label: "FixFirst Champion",
    description: "Top-tier verified impact across your city.",
    requirement: "1,000 civic impact points",
    goal: 1000,
    rewardPoints: 150,
    count: (p) => p.reputation,
  },
];

export function badgeProgress(p: UserProfile, reports: Report[] = []): BadgeProgress[] {
  return BADGE_DEFS.map((d) => {
    const current = Math.min(d.goal, d.count(p, reports));
    const pct = Math.round((current / d.goal) * 100);
    return {
      label: d.label,
      description: d.description,
      requirement: d.requirement,
      current,
      goal: d.goal,
      rewardPoints: d.rewardPoints,
      pct,
      earned: current >= d.goal,
    };
  });
}

export function badgesFor(p: UserProfile, reports: Report[] = []): { label: string; earned: boolean }[] {
  return badgeProgress(p, reports).map((b) => ({ label: b.label, earned: b.earned }));
}

// Rewards unlock with verified impact — never for raw posting.
export interface Reward {
  label: string;
  detail: string;
  unlockAt: number; // reputation needed
}

export const REWARDS: Reward[] = [
  { label: "Coffee gift card", detail: "$5 campus coffee credit", unlockAt: 100 },
  { label: "Dining dollars", detail: "$10 dining credit", unlockAt: 200 },
  { label: "Local business discounts", detail: "Eugene partner perks", unlockAt: 300 },
  { label: "Parking / transit credits", detail: "Transportation credit", unlockAt: 400 },
  { label: "Campus merch raffle", detail: "Monthly raffle entry", unlockAt: 500 },
  { label: "Volunteer / service hours", detail: "Verified civic service credit", unlockAt: 600 },
];

export const REWARDS_NOTE =
  "Rewards unlock when reports are verified, confirmed unresolved, or marked fixed by the community. FixFirst rewards verified impact, not spam.";
