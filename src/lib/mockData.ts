// ─────────────────────────────────────────────────────────────
// FixFirst — community reports for the QuackHacks demo
// (University of Oregon / Eugene)
//
// The headline case is the blocked wheelchair ramp at the EMU
// entrance — the polished example used across the map, the priority
// queue, the dashboard, and the generated facilities report.
//
// SNOWFLAKE: in production these are rows in the warehouse:
//   reports · severity scores · duplicate clusters · fix times.
// ─────────────────────────────────────────────────────────────

import type { Analysis, Report } from "./types";
import { buildReport } from "./reportFactory";

function iso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

// ── The perfect demo case ────────────────────────────────────
// Hand-authored analysis so the numbers are exactly on-message.
// GEMINI would produce this object from the photo + voice note.
const EMU_RAMP_ANALYSIS: Analysis = {
  issueType: "Blocked wheelchair ramp",
  severity: 96,
  priority: "Urgent",
  accessibilityImpact: "High",
  affectedGroups: [
    "wheelchair users",
    "visually impaired pedestrians",
    "parents with strollers",
    "delivery workers",
  ],
  suggestedFix:
    "Clear the obstruction immediately and inspect alternate accessible path signage.",
  duplicateProbability: 88,
  duplicateNote: "4 related reports grouped into 1 case near the EMU entrance.",
  confidence: 96,
  summary:
    "A high-risk blocked wheelchair ramp was reported at the EMU entrance. It blocks the only step-free route, forcing wheelchair users into the street.",
  followUpText:
    "FixFirst follow-up: Blocked wheelchair ramp at the EMU entrance. Severity 96/100 (Urgent). High accessibility impact. 4 related reports, 3 community verifications, unresolved 3 days. Recommended action: clear obstruction immediately and inspect alternate accessible path signage. Dispatch within 24 hours.",
  publicSafetyConcern:
    "A blocked accessible ramp removes the only step-free path, forcing wheelchair users into vehicle traffic.",
  transcript:
    "The accessible ramp is blocked and wheelchair users have to go around into the street.",
  visualEvidence: "Curb ramp appears blocked by debris and signage.",
  voiceContext:
    "Reporter said wheelchair users had to wait for help and go around into the street.",
};

export function getSeedReports(): Report[] {
  return [
    // #1 — the headline case
    buildReport({
      id: "emu-ramp",
      source: "uo",
      category: "Blocked wheelchair ramp",
      locationName: "EMU entrance",
      spotDetails: "South ramp by the main doors, blocked by event signage and a pallet",
      description:
        "The accessible ramp is blocked and wheelchair users have to go around into the street. No detour posted.",
      createdAt: iso(3),
      duplicates: 4,
      hasVoiceNote: true,
      status: "Verified",
      geo: { lat: 44.0454, lng: -123.0724 },
      analysisOverride: EMU_RAMP_ANALYSIS,
      caseIdOverride: "UO-FF-1001",
      // Exactly 3 community verifications for the headline demo case.
      juryOverride: [
        { juror: "Maya Ortiz", verdict: "Confirm", at: iso(2) },
        { juror: "Devon Walsh", verdict: "Confirm", at: iso(1) },
        { juror: "Priya Nair", verdict: "Confirm", at: iso(1) },
      ],
    }),
    buildReport({
      id: "lillis-crack",
      source: "uo",
      category: "Cracked sidewalk",
      locationName: "Lillis Business Complex",
      spotDetails: "Raised slab on 13th Ave near the bus stop",
      description:
        "Large raised crack — someone tripped yesterday. Hard to roll a wheelchair or stroller over it.",
      createdAt: iso(8),
      duplicates: 6,
      hasVoiceNote: true,
      geo: { lat: 44.0457, lng: -123.0707 },
    }),
    buildReport({
      id: "knight-crossing",
      source: "uo",
      category: "Unsafe crossing",
      locationName: "Knight Library",
      spotDetails: "Crosswalk on 15th, faded markings",
      description:
        "Cars don't stop and the paint is gone. Near-misses with students between classes.",
      createdAt: iso(6),
      duplicates: 5,
      hasVoiceNote: true,
      geo: { lat: 44.044, lng: -123.0743 },
    }),
    buildReport({
      id: "13th-pothole",
      source: "uo",
      category: "Pothole",
      locationName: "13th Avenue",
      spotDetails: "Bike lane heading west, past the crosswalk",
      description:
        "Deep pothole in the bike lane. Nearly got thrown into traffic swerving around it.",
      createdAt: iso(5),
      duplicates: 3,
      hasVoiceNote: true,
      geo: { lat: 44.0455, lng: -123.076 },
    }),
    buildReport({
      id: "hayward-light",
      source: "uo",
      category: "Broken light",
      locationName: "Hayward Field walkway",
      spotDetails: "Path light near the east gate",
      description: "Out for over a week. Pitch black at night walking to the dorms.",
      createdAt: iso(9),
      duplicates: 2,
      geo: { lat: 44.042, lng: -123.069 },
    }),
    buildReport({
      id: "rec-trash",
      source: "uo",
      category: "Overflowing trash",
      locationName: "Student Recreation Center",
      spotDetails: "Bins by the north entrance",
      // Intentionally the MOST-reported issue — to show volume can't
      // push a low-stakes category above Medium (category ceiling 60).
      description:
        "Overflowing for days onto the walkway. The most-reported spot on campus right now.",
      createdAt: iso(5),
      duplicates: 18,
      geo: { lat: 44.0444, lng: -123.068 },
    }),
    buildReport({
      id: "amazon-bike",
      source: "uo",
      category: "Blocked bike lane",
      locationName: "Amazon Corner area",
      spotDetails: "Bike lane blocked by a parked delivery van",
      description:
        "Delivery vans keep parking across the bike lane. Cyclists forced into car traffic.",
      createdAt: iso(2),
      duplicates: 2,
      geo: { lat: 44.0388, lng: -123.0726 },
    }),
  ];
}
