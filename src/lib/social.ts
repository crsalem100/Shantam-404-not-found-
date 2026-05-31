// ─────────────────────────────────────────────────────────────
// FixFirst — civic network (friends, teams, challenges, activity)
//
// The social layer exists to make reports MORE TRUSTWORTHY, not more
// popular. No followers/likes — only verification, team impact, and
// rewards for confirmed civic action.
//
// SNOWFLAKE: friends, teams, verification requests and challenge
// progress are warehouse tables. BACKBOARD: a user's network, teams
// and accessibility interests personalize their experience.
// ─────────────────────────────────────────────────────────────

import type { HazardCategory } from "./types";

// Deterministic avatar color from a name (no images needed).
const AVATAR_COLORS = ["#1f7aff", "#22c55e", "#f97316", "#a855f7", "#06b6d4", "#ef4444", "#eab308"];
export function avatarFor(name: string): { initials: string; color: string } {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return { initials, color: AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length] };
}

export interface PublicUser {
  id: string;
  name: string;
  username: string;
  city: string;
  reputation: number;
  reportsFiled: number;
  verifications: number;
  reportsLedToFix: number;
  accessibilityReports: number;
  highSeverityReports: number;
  badges: string[];
}

// Mock civic network members (demo).
export const MOCK_USERS: PublicUser[] = [
  { id: "maya", name: "Maya Ortiz", username: "mayao", city: "Eugene · UO", reputation: 842, reportsFiled: 41, verifications: 120, reportsLedToFix: 14, accessibilityReports: 18, highSeverityReports: 9, badges: ["Accessibility Advocate", "Ramp Guardian", "FixFirst Champion"] },
  { id: "devon", name: "Devon Walsh", username: "devonw", city: "Eugene · UO", reputation: 604, reportsFiled: 33, verifications: 88, reportsLedToFix: 9, accessibilityReports: 6, highSeverityReports: 12, badges: ["Pothole Hunter", "Night Safety Watch", "Civic Guardian"] },
  { id: "priya", name: "Priya Nair", username: "priyan", city: "Eugene · UO", reputation: 528, reportsFiled: 27, verifications: 75, reportsLedToFix: 8, accessibilityReports: 11, highSeverityReports: 7, badges: ["Accessibility Advocate", "Verified Reporter"] },
  { id: "alex", name: "Alex Chen", username: "alexc", city: "Eugene · UO", reputation: 376, reportsFiled: 22, verifications: 54, reportsLedToFix: 5, accessibilityReports: 4, highSeverityReports: 6, badges: ["Verified Reporter", "Bike Lane Watch"] },
  { id: "jordan", name: "Jordan Lee", username: "jordanl", city: "Eugene · UO", reputation: 295, reportsFiled: 19, verifications: 47, reportsLedToFix: 4, accessibilityReports: 3, highSeverityReports: 5, badges: ["First Report", "Verifier"] },
];

export function userById(id: string): PublicUser | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export interface Team {
  id: string;
  name: string;
  focus: HazardCategory | "Accessibility" | "General";
  city: string;
  members: number;
  reportsFiled: number;
  verifiedReports: number;
  reportsLedToFix: number;
  points: number;
  title: string; // main badge/title
  verificationStreak: number; // weeks
}

export const MOCK_TEAMS: Team[] = [
  { id: "uo-accessibility-watch", name: "UO Accessibility Watch", focus: "Accessibility", city: "Eugene · UO", members: 24, reportsFiled: 210, verifiedReports: 180, reportsLedToFix: 41, points: 4280, title: "Ramp Guardians", verificationStreak: 7 },
  { id: "bike-lane-watch", name: "Bike Lane Watch", focus: "Blocked bike lane", city: "Eugene · UO", members: 18, reportsFiled: 160, verifiedReports: 120, reportsLedToFix: 22, points: 3120, title: "Mobility Crew", verificationStreak: 5 },
  { id: "ramp-guardians", name: "Ramp Guardians", focus: "Blocked wheelchair ramp", city: "Eugene · UO", members: 15, reportsFiled: 150, verifiedReports: 116, reportsLedToFix: 26, points: 2940, title: "Access First", verificationStreak: 6 },
  { id: "night-safety-patrol", name: "Night Safety Patrol", focus: "Broken light", city: "Eugene · UO", members: 20, reportsFiled: 132, verifiedReports: 98, reportsLedToFix: 17, points: 2610, title: "After Dark", verificationStreak: 4 },
  { id: "pothole-hunters", name: "Pothole Hunters", focus: "Pothole", city: "Eugene · UO", members: 12, reportsFiled: 119, verifiedReports: 80, reportsLedToFix: 15, points: 2180, title: "Road Crew", verificationStreak: 3 },
  { id: "south-eugene-fixers", name: "South Eugene Fixers", focus: "General", city: "Eugene", members: 9, reportsFiled: 74, verifiedReports: 52, reportsLedToFix: 9, points: 1490, title: "Neighborhood", verificationStreak: 2 },
];

export function teamById(id: string): Team | undefined {
  return MOCK_TEAMS.find((t) => t.id === id);
}

export interface Challenge {
  id: string;
  title: string;
  current: number;
  goal: number;
  reward: string;
  deadline: string; // human-readable time left this week
}

export const MOCK_CHALLENGES: Challenge[] = [
  { id: "verify3", title: "Verify 3 reports this week", current: 2, goal: 3, reward: "+50 points · raffle entry", deadline: "4 days left" },
  { id: "access1", title: "Report 1 accessibility hazard", current: 0, goal: 1, reward: "+50 points · badge progress", deadline: "4 days left" },
  { id: "confirm2", title: "Confirm whether 2 old reports are fixed", current: 1, goal: 2, reward: "+40 points", deadline: "2 days left" },
  { id: "photo1", title: "Add photo evidence to 1 report", current: 1, goal: 1, reward: "+30 points", deadline: "Complete" },
  { id: "team500", title: "Help your team reach 500 points", current: 320, goal: 500, reward: "Team reward unlock", deadline: "6 days left" },
  { id: "near3", title: "Check 3 hazards near campus", current: 1, goal: 3, reward: "+30 points · raffle entry", deadline: "4 days left" },
];

export interface ActivityItem {
  id: string;
  who: string; // person or team name
  text: string;
  kind: "verify" | "report" | "team" | "goal";
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "a1", who: "Maya Ortiz", text: "verified the blocked wheelchair ramp at EMU entrance.", kind: "verify" },
  { id: "a2", who: "Devon Walsh", text: "marked the broken light near 13th Ave as still unresolved.", kind: "report" },
  { id: "a3", who: "Priya Nair", text: "added photo evidence to a cracked sidewalk near Knight Library.", kind: "report" },
  { id: "a4", who: "UO Accessibility Watch", text: "reached 1,000 impact points this week.", kind: "team" },
  { id: "a5", who: "Your team", text: "is 45 points away from the top 5.", kind: "goal" },
];

// ── Report visibility (privacy) ──────────────────────────────
export const VISIBILITY_OPTIONS: { value: import("./types").ReportVisibility; label: string; note: string }[] = [
  { value: "public", label: "Public report", note: "Visible to everyone on the map" },
  { value: "anonymous", label: "Anonymous public", note: "Public, but your name is hidden" },
  { value: "team", label: "Team-only", note: "Only your civic team can see it" },
  { value: "facilities", label: "Facilities-only", note: "Sent privately to facilities" },
];

export const PRIVACY_NOTES = [
  "Exact location is never shared with friends by default.",
  "Friends can verify your reports but cannot track you live.",
  "Reports can be public, anonymous, team-only, or facilities-only.",
  "Rewards are based on verified impact, not spam.",
];
