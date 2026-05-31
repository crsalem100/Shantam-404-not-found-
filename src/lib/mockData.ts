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
    // ── open accessibility cluster near EMU ───────────────────
    buildReport({
      id: "emu-tactile",
      source: "uo",
      category: "Missing tactile paving",
      locationName: "EMU entrance",
      spotDetails: "North crossing edge by the bus pull-out",
      description:
        "There's no tactile warning strip at this corner — a blind student said there's no cue before the street.",
      createdAt: iso(4),
      duplicates: 3,
      hasVoiceNote: true,
      status: "Waiting on department",
      geo: { lat: 44.0452, lng: -123.0729 },
    }),
    buildReport({
      id: "university-curbcut",
      source: "uo",
      category: "Broken curb cut",
      locationName: "University Street",
      spotDetails: "Curb cut at the 13th Ave corner",
      description:
        "The curb cut is broken up and I can't get my wheelchair down to the crosswalk safely.",
      createdAt: iso(5),
      duplicates: 3,
      hasVoiceNote: true,
      status: "Verified",
      geo: { lat: 44.0451, lng: -123.0735 },
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
      status: "In progress",
      geo: { lat: 44.0457, lng: -123.0707 },
    }),
    buildReport({
      id: "knight-sidewalk",
      source: "uo",
      category: "Cracked sidewalk",
      locationName: "Knight Library",
      spotDetails: "Walkway by the south entrance",
      description:
        "Uplifted slab right on the main study route. People with rollers and wheelchairs detour into the grass.",
      createdAt: iso(6),
      duplicates: 4,
      hasVoiceNote: true,
      geo: { lat: 44.044, lng: -123.0743 },
    }),
    buildReport({
      id: "lillis-crossing",
      source: "uo",
      category: "Unsafe crossing",
      locationName: "Lillis Business Complex",
      spotDetails: "Crosswalk on 13th, faded markings",
      description:
        "Cars don't stop and the paint is gone. Near-misses with students between classes.",
      createdAt: iso(7),
      duplicates: 5,
      hasVoiceNote: true,
      geo: { lat: 44.0455, lng: -123.0709 },
    }),
    buildReport({
      id: "franklin-signal",
      source: "uo",
      category: "Crosswalk signal issue",
      locationName: "Franklin Blvd crossing",
      spotDetails: "Pedestrian signal at Agate St",
      description:
        "The walk signal never changes and the audible beeper is dead, so people just cross and hope.",
      createdAt: iso(6),
      duplicates: 3,
      hasVoiceNote: true,
      status: "In progress",
      geo: { lat: 44.0436, lng: -123.0689 },
    }),
    buildReport({
      id: "franklin-bike",
      source: "uo",
      category: "Blocked bike lane",
      locationName: "Franklin Blvd",
      spotDetails: "Bike lane blocked near the footbridge",
      description:
        "Construction cones left the bike lane blocked for days. Cyclists merge into fast traffic here.",
      createdAt: iso(4),
      duplicates: 3,
      status: "Routed",
      geo: { lat: 44.0439, lng: -123.0681 },
    }),
    buildReport({
      id: "13th-light",
      source: "uo",
      category: "Broken light",
      locationName: "13th Avenue",
      spotDetails: "Path lights between Kincaid and University",
      description: "Several lights out. Pitch black walking to the dorms at night — feels unsafe.",
      createdAt: iso(8),
      duplicates: 4,
      hasVoiceNote: true,
      geo: { lat: 44.0454, lng: -123.0738 },
    }),
    buildReport({
      id: "kincaid-pothole",
      source: "uo",
      category: "Pothole",
      locationName: "Kincaid Street",
      spotDetails: "Northbound lane near 15th Ave",
      description:
        "Deep pothole catching bike tires; riders swerve toward traffic.",
      createdAt: iso(5),
      duplicates: 3,
      hasVoiceNote: true,
      status: "In progress",
      geo: { lat: 44.0461, lng: -123.0717 },
    }),
    buildReport({
      id: "hayward-flood",
      source: "uo",
      category: "Flooding / standing water",
      locationName: "Hayward Field walkway",
      spotDetails: "Low point near the east gate",
      description:
        "This whole walkway floods after rain and you can't get through without stepping into the road.",
      createdAt: iso(3),
      duplicates: 2,
      geo: { lat: 44.042, lng: -123.069 },
    }),
    buildReport({
      id: "jaqua-obstruction",
      source: "uo",
      category: "Scooter / bike obstruction",
      locationName: "Jaqua Center",
      spotDetails: "Accessible path by the main doors",
      description:
        "Scooters dumped right across the accessible path again — no way through with a wheelchair.",
      createdAt: iso(2),
      duplicates: 2,
      status: "Routed",
      geo: { lat: 44.0571, lng: -123.0686 },
    }),
    buildReport({
      id: "gsh-scooter",
      source: "uo",
      category: "Scooter / bike obstruction",
      locationName: "Global Scholars Hall",
      spotDetails: "Sidewalk by the east entrance",
      description: "Pile of scooters blocking the ramp to the residence hall entrance.",
      createdAt: iso(2),
      duplicates: 1,
      geo: { lat: 44.0447, lng: -123.0693 },
    }),
    buildReport({
      id: "oregon-sign",
      source: "uo",
      category: "Damaged sign",
      locationName: "Oregon Hall",
      spotDetails: "Stop sign at the parking exit",
      description: "The stop sign is bent over and you can barely see it coming up to the corner.",
      createdAt: iso(1),
      duplicates: 1,
      status: "New",
      geo: { lat: 44.0431, lng: -123.0712 },
    }),
    buildReport({
      id: "carson-trash",
      source: "uo",
      category: "Overflowing trash",
      locationName: "Carson Hall",
      spotDetails: "Bins by the dining entrance",
      description: "Overflowing onto the path by the dining doors for days.",
      createdAt: iso(4),
      duplicates: 4,
      geo: { lat: 44.0438, lng: -123.0758 },
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
      id: "mka-sidewalk",
      source: "uo",
      category: "Cracked sidewalk",
      locationName: "Matthew Knight Arena walkway",
      spotDetails: "Uneven pavement near the box office",
      description: "Uneven, lifted pavement on the event walkway — trip hazard on game days.",
      createdAt: iso(6),
      duplicates: 2,
      geo: { lat: 44.0445, lng: -123.0671 },
    }),
    buildReport({
      id: "hilyard-obstruction",
      source: "uo",
      category: "Scooter / bike obstruction",
      locationName: "Hilyard Street",
      spotDetails: "Sidewalk near the market",
      description: "Bikes and scooters chained across the sidewalk, blocking the path.",
      createdAt: iso(3),
      duplicates: 1,
      geo: { lat: 44.0419, lng: -123.0739 },
    }),
    buildReport({
      id: "amazon-light",
      source: "uo",
      category: "Broken light",
      locationName: "Amazon Corner area",
      spotDetails: "Path light by the crossing",
      description: "Dark stretch on the bike path; the light's been out for a couple weeks.",
      createdAt: iso(7),
      duplicates: 2,
      geo: { lat: 44.0388, lng: -123.0726 },
    }),
    // ── solved / verified-fixed (Proof of Fix) ────────────────
    buildReport({
      id: "alder-pothole-fixed",
      source: "uo",
      category: "Pothole",
      locationName: "Alder Street",
      spotDetails: "Bike lane near 18th Ave",
      description:
        "Deep pothole in the bike lane forced riders into traffic.",
      createdAt: iso(7),
      updatedAt: iso(3),
      duplicates: 3,
      hasVoiceNote: true,
      status: "Verified fixed",
      geo: { lat: 44.041, lng: -123.0741 },
      proofOfFix: {
        fixedBy: "Public Works",
        timeToFixDays: 4,
        fixedAt: iso(3),
        verifiedBy: ["Maya Ortiz", "Devon Walsh", "Priya Nair"],
        confidence: 94,
        afterNote: "Pothole filled and asphalt re-leveled across the bike lane.",
        impact: "Reduced bike-lane hazard on a daily commute route.",
        pointsAwarded: 25,
      },
    }),
    buildReport({
      id: "patterson-light-fixed",
      source: "uo",
      category: "Broken light",
      locationName: "Patterson Street",
      spotDetails: "Two path lights near the residence halls",
      description: "Dark walking route to the dorms — lights out for over a week.",
      createdAt: iso(11),
      updatedAt: iso(5),
      duplicates: 4,
      status: "Verified fixed",
      geo: { lat: 44.0445, lng: -123.0721 },
      proofOfFix: {
        fixedBy: "Utilities / Facilities",
        timeToFixDays: 6,
        fixedAt: iso(5),
        verifiedBy: ["Alex Chen", "Jordan Lee"],
        confidence: 90,
        afterNote: "Both fixtures replaced; route is lit end to end at night.",
        impact: "Improved night safety on a high-traffic pedestrian route.",
        pointsAwarded: 25,
      },
    }),
    buildReport({
      id: "autzen-branch-fixed",
      source: "uo",
      category: "Fallen tree / branch",
      locationName: "Autzen footbridge area",
      spotDetails: "Path on the river side of the footbridge",
      description: "A large branch came down across the path after the windstorm.",
      createdAt: iso(6),
      updatedAt: iso(4),
      duplicates: 2,
      status: "Fixed",
      geo: { lat: 44.0526, lng: -123.0681 },
      proofOfFix: {
        fixedBy: "Parks / Urban Forestry",
        timeToFixDays: 2,
        fixedAt: iso(4),
        verifiedBy: ["Devon Walsh", "Priya Nair"],
        confidence: 88,
        afterNote: "Limb cleared and the tree inspected for further failure.",
        impact: "Reopened a blocked riverside path and removed a fall hazard.",
        pointsAwarded: 25,
      },
    }),
    buildReport({
      id: "southeugene-crossing-fixed",
      source: "uo",
      category: "Unsafe crossing",
      locationName: "South Eugene neighborhood",
      spotDetails: "Crosswalk near Amazon Park",
      description: "Faded crossing by the park — kids cross here to school every morning.",
      createdAt: iso(14),
      updatedAt: iso(6),
      duplicates: 5,
      hasVoiceNote: true,
      status: "Verified fixed",
      geo: { lat: 44.0334, lng: -123.0905 },
      proofOfFix: {
        fixedBy: "Transportation Safety",
        timeToFixDays: 8,
        fixedAt: iso(6),
        verifiedBy: ["Maya Ortiz", "Alex Chen", "Lena Fischer"],
        confidence: 92,
        afterNote: "High-visibility markings repainted and a pedestrian beacon added.",
        impact: "Reduced collision risk on a daily school-walk route.",
        pointsAwarded: 25,
      },
    }),
  ];
}
