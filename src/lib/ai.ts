// ─────────────────────────────────────────────────────────────
// FixFirst — AI analysis engine
//
// Today this runs deterministic mock logic so the demo works with
// zero keys. It is structured so Google Gemini (multimodal) and
// ElevenLabs (voice) can be dropped in behind the same interface.
//
// ╭─ GEMINI INTEGRATION POINTS ────────────────────────────────╮
// │ When GEMINI_API_KEY is set, replace the mock branches below: │
// │  1. Analyze the uploaded photo (visual hazard detection).    │
// │  2. Analyze the voice transcript (spoken human impact).      │
// │  3. Merge visual evidence + spoken context into one signal.  │
// │  4. Generate severity + accessibility scoring.               │
// │  5. Generate the facilities-ready report text.               │
// ╰─────────────────────────────────────────────────────────────╯
// ─────────────────────────────────────────────────────────────

import type {
  AccessibilityImpact,
  Analysis,
  HazardCategory,
  PriorityLabel,
} from "./types";
import { computePriority } from "./priority";

export interface AnalyzeInput {
  category: HazardCategory;
  locationName: string;
  spotDetails: string;
  description: string;
  hasPhoto: boolean;
  hasVoiceNote: boolean;
}

// Per-category knowledge base. In production this is what Gemini infers
// from the photo + transcript; here we encode the required demo behavior.
interface CategoryProfile {
  baseSeverity: number;
  accessibility: AccessibilityImpact;
  affected: string[];
  fix: string;
  safety: string;
  transcriptHint: string;
}

const PROFILES: Record<HazardCategory, CategoryProfile> = {
  "Blocked wheelchair ramp": {
    baseSeverity: 90,
    accessibility: "High",
    affected: [
      "wheelchair users",
      "people with mobility aids",
      "parents with strollers",
      "delivery workers with carts",
    ],
    fix: "Immediately clear the obstruction and post an accessible detour, then inspect ramp surface for permanent damage.",
    safety:
      "A blocked accessible ramp removes the only step-free path, stranding wheelchair users and violating accessibility access.",
    transcriptHint:
      "The ramp by the entrance is completely blocked. I use a wheelchair and there is no other way up — I had to wait for someone to help me.",
  },
  "Cracked sidewalk": {
    baseSeverity: 78,
    accessibility: "High",
    affected: [
      "wheelchair users",
      "visually impaired pedestrians",
      "elderly pedestrians",
      "students walking at night",
    ],
    fix: "Place a temporary warning marker, then schedule concrete leveling or slab replacement.",
    safety:
      "The raised crack is a trip hazard and blocks accessible travel paths for wheels and canes.",
    transcriptHint:
      "There's a big crack in the sidewalk here. Someone almost tripped. It's really hard to get a wheelchair over it.",
  },
  Pothole: {
    baseSeverity: 72,
    accessibility: "Medium",
    affected: [
      "cyclists",
      "drivers",
      "pedestrians stepping into the road",
      "scooter riders",
    ],
    fix: "Cold-patch the pothole as a temporary fix and queue a permanent asphalt repair.",
    safety:
      "The pothole can throw cyclists off their line into traffic and damage vehicles.",
    transcriptHint:
      "There's a deep pothole in the bike lane. I nearly got thrown off my bike swerving around it into the car lane.",
  },
  "Broken light": {
    baseSeverity: 66,
    accessibility: "Medium",
    affected: [
      "students walking at night",
      "pedestrians",
      "cyclists",
      "people who feel unsafe in the dark",
    ],
    fix: "Dispatch electrical maintenance to replace the fixture; add temporary lighting if the area is high-traffic at night.",
    safety:
      "The dark stretch is a night-safety risk, reducing visibility and increasing the chance of falls and incidents.",
    transcriptHint:
      "This light has been out for days. It's pitch black at night here and it feels really unsafe walking through.",
  },
  "Unsafe crossing": {
    baseSeverity: 80,
    accessibility: "Medium",
    affected: [
      "pedestrians",
      "children",
      "elderly pedestrians",
      "visually impaired pedestrians",
    ],
    fix: "Add high-visibility markings and signage; evaluate for a signal, beacon, or crossing guard.",
    safety:
      "Poor visibility and fast traffic create a pedestrian collision risk at this crossing.",
    transcriptHint:
      "Cars fly through this crossing and don't stop. I've seen near-misses with students every morning.",
  },
  "Overflowing trash": {
    baseSeverity: 48,
    accessibility: "Low",
    affected: [
      "nearby residents",
      "students",
      "facilities staff",
      "people with respiratory sensitivities",
    ],
    fix: "Schedule an extra pickup and increase bin capacity or collection frequency for this location.",
    safety:
      "Overflowing waste is a sanitation and pest-attraction risk and can spread onto walkways.",
    transcriptHint:
      "The trash here is overflowing onto the path and it smells. There are already pests around it.",
  },
  "Blocked bike lane": {
    baseSeverity: 64,
    accessibility: "Low",
    affected: [
      "cyclists",
      "scooter riders",
      "delivery riders",
      "drivers sharing the merged lane",
    ],
    fix: "Clear the obstruction and enforce no-parking; add bollards or signage if it recurs.",
    safety:
      "A blocked bike lane forces cyclists to merge into car traffic, a serious collision risk.",
    transcriptHint:
      "Someone parked across the bike lane again. I had to swerve into the road with cars right behind me.",
  },
  "Broken curb cut": {
    baseSeverity: 84,
    accessibility: "High",
    affected: ["wheelchair users", "visually impaired pedestrians", "parents with strollers", "delivery workers"],
    fix: "Repair or rebuild the curb cut to ADA grade and restore the flush transition to the crossing.",
    safety: "A broken curb cut breaks the step-free path between sidewalk and street, stranding wheeled users mid-route.",
    transcriptHint: "The curb cut here is broken up — I can't get my wheelchair down to the crosswalk safely.",
  },
  "Missing tactile paving": {
    baseSeverity: 76,
    accessibility: "High",
    affected: ["visually impaired pedestrians", "guide-dog users", "elderly pedestrians"],
    fix: "Install detectable warning (tactile) paving at the crossing edge to standard.",
    safety: "Missing tactile warnings remove the cue that tells blind pedestrians where the sidewalk meets traffic.",
    transcriptHint: "There's no tactile strip at this corner, so there's no warning before you step into the street.",
  },
  "Crosswalk signal issue": {
    baseSeverity: 78,
    accessibility: "Medium",
    affected: ["pedestrians", "visually impaired pedestrians", "children", "elderly pedestrians"],
    fix: "Dispatch signals maintenance to fix the walk phase / audible cue and verify timing.",
    safety: "A faulty walk signal leaves pedestrians guessing when it is safe to cross a live traffic lane.",
    transcriptHint: "The walk signal never changes and the audible beeper is dead, so people just cross and hope.",
  },
  "Flooding / standing water": {
    baseSeverity: 70,
    accessibility: "Medium",
    affected: ["pedestrians", "cyclists", "wheelchair users", "transit riders"],
    fix: "Clear the blocked drain and inspect grading; place a hazard marker until water recedes.",
    safety: "Standing water hides hazards, freezes into ice, and forces pedestrians off the path into traffic.",
    transcriptHint: "This whole walkway floods and you can't get through without stepping into the road.",
  },
  "Damaged sign": {
    baseSeverity: 56,
    accessibility: "Low",
    affected: ["drivers", "pedestrians", "cyclists"],
    fix: "Replace or re-mount the damaged sign; verify it is visible from the approach.",
    safety: "A missing or damaged sign removes a warning or wayfinding cue people rely on.",
    transcriptHint: "The stop sign here is bent over and you can barely see it coming up to the corner.",
  },
  "Fallen tree / branch": {
    baseSeverity: 74,
    accessibility: "Medium",
    affected: ["pedestrians", "drivers", "cyclists", "wheelchair users"],
    fix: "Dispatch urban forestry to clear the limb and inspect the tree for further failure risk.",
    safety: "A downed limb blocks the path and can conceal or create a fall and collision hazard.",
    transcriptHint: "A big branch came down across the sidewalk and everyone's walking around it into the street.",
  },
  "Scooter / bike obstruction": {
    baseSeverity: 58,
    accessibility: "Medium",
    affected: ["wheelchair users", "visually impaired pedestrians", "pedestrians", "parents with strollers"],
    fix: "Relocate the parked devices to a corral; add designated parking if it recurs.",
    safety: "Dockless scooters left across the walkway block the accessible path and trip blind pedestrians.",
    transcriptHint: "There are scooters dumped right across the sidewalk again — no way through with a wheelchair.",
  },
  Other: {
    baseSeverity: 50,
    accessibility: "Low",
    affected: ["pedestrians", "nearby community members"],
    fix: "Triage on site and route to the appropriate maintenance team.",
    safety: "Potential hazard to people using this space; needs inspection.",
    transcriptHint:
      "There's something wrong here that needs to be looked at. It's been like this for a while.",
  },
};

// What the photo/video appears to show, per category.
// GEMINI: this is exactly the visual-evidence finding the multimodal
// model returns after analyzing the uploaded photo/video frames.
const VISUAL: Record<HazardCategory, string> = {
  "Blocked wheelchair ramp": "Curb ramp appears blocked by debris and signage.",
  "Cracked sidewalk": "Raised, cracked slab visible — uneven walking surface.",
  Pothole: "Significant pavement pothole in the travel/bike lane.",
  "Broken light": "Light fixture appears dark / non-functional.",
  "Unsafe crossing": "Faded crossing markings and poor pedestrian visibility.",
  "Overflowing trash": "Bin overflowing with waste spilling onto the path.",
  "Blocked bike lane": "Bike lane obstructed, forcing a merge into traffic.",
  "Broken curb cut": "Curb cut broken / crumbling — no flush transition to the crossing.",
  "Missing tactile paving": "No detectable warning strip at the sidewalk-to-street edge.",
  "Crosswalk signal issue": "Pedestrian signal appears dark or stuck — no walk phase.",
  "Flooding / standing water": "Standing water pooled across the path / roadway.",
  "Damaged sign": "Sign bent, knocked down, or obscured at the approach.",
  "Fallen tree / branch": "Downed limb blocking the walkway / lane.",
  "Scooter / bike obstruction": "Dockless scooters / bikes left across the accessible path.",
  Other: "Potential hazard visible in the submitted photo.",
};

// Small deterministic pseudo-random based on a string seed so the demo is
// stable across renders (no Math.random flicker), but still varied per report.
function seededInt(seed: string, min: number, max: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = Math.abs(h) % (max - min + 1);
  return min + n;
}

function clampSeverity(n: number): number {
  return Math.max(1, Math.min(100, Math.round(n)));
}

/**
 * Analyze a hazard report.
 *
 * MOCK MODE (default): deterministic, category-aware scoring.
 * GEMINI MODE (future): call the multimodal model with the photo bytes
 * and transcript, then map its JSON response onto this same Analysis shape.
 */
export function analyzeReport(input: AnalyzeInput): Analysis {
  // GEMINI: if (process.env.GEMINI_API_KEY) return await geminiAnalyze(input)
  // The mock below mirrors the structure Gemini would return.

  const profile = PROFILES[input.category];
  const seed = `${input.category}|${input.locationName}|${input.spotDetails}|${input.description}`;

  // Evidence richness nudges severity + confidence — more signals, more trust.
  let severity = profile.baseSeverity;
  if (input.hasPhoto) severity += 4;
  if (input.hasVoiceNote) severity += 4;
  if (input.description.trim().length > 40) severity += 2;
  // Keyword escalation (Gemini would do this from natural language).
  const text = `${input.description} ${input.spotDetails}`.toLowerCase();
  if (/(deep|huge|large|broken|exposed|dangerous|night|blood|fell|injur)/.test(text)) {
    severity += 6;
  }
  severity = clampSeverity(severity + seededInt(seed, -3, 3));

  const duplicateProbability = seededInt(seed + "dup", 20, 78);
  const confidence = clampSeverity(
    72 + (input.hasPhoto ? 10 : 0) + (input.hasVoiceNote ? 8 : 0) + seededInt(seed, -4, 6)
  );

  const breakdown = computePriority(
    severity,
    profile.accessibility,
    0, // a freshly submitted report has no duplicates yet
    0,
    input.category
  );
  const priority: PriorityLabel =
    input.category === "Blocked wheelchair ramp" ? "Urgent" : breakdown.label;

  const where = input.locationName || "the reported location";
  const summary = `A ${priorityWord(priority)} ${input.category.toLowerCase()} was reported near ${where}. ${profile.safety}`;

  const followUpText = buildFollowUp(input, severity, priority, profile, where);

  // VOICE TRANSCRIPT:
  // ElevenLabs / Gemini would transcribe the actual recording here.
  // We synthesize a plausible transcript from the category + description.
  const transcript = input.hasVoiceNote
    ? input.description.trim().length > 0
      ? `${profile.transcriptHint} ${input.description.trim()}`
      : profile.transcriptHint
    : "";

  // GEMINI: merge visual evidence + spoken context into the reasoning the
  // user sees on the report detail page ("AI Reasoning").
  const visualEvidence = input.hasPhoto
    ? VISUAL[input.category]
    : "No photo submitted — analysis based on category and description.";
  const voiceContext = input.hasVoiceNote
    ? `Reporter described the human impact: "${profile.transcriptHint}"`
    : input.description.trim().length > 0
    ? `Text report: "${input.description.trim()}"`
    : "No voice note attached.";

  return {
    issueType: input.category,
    severity,
    priority,
    accessibilityImpact: profile.accessibility,
    affectedGroups: profile.affected,
    suggestedFix: profile.fix,
    duplicateProbability,
    duplicateNote: buildDuplicateNote(duplicateProbability, where),
    confidence,
    summary,
    followUpText,
    publicSafetyConcern: profile.safety,
    transcript,
    visualEvidence,
    voiceContext,
  };
}

function priorityWord(p: PriorityLabel): string {
  switch (p) {
    case "Urgent":
      return "high-risk";
    case "High":
      return "serious";
    case "Medium":
      return "moderate";
    default:
      return "minor";
  }
}

function buildDuplicateNote(prob: number, where: string): string {
  if (prob >= 60) return `${prob}% — a similar report was already found near ${where}.`;
  if (prob >= 35) return `${prob}% — possibly related to an open report nearby.`;
  return `${prob}% — looks like a new, distinct issue.`;
}

function buildFollowUp(
  input: AnalyzeInput,
  severity: number,
  priority: PriorityLabel,
  profile: CategoryProfile,
  where: string
): string {
  return [
    `FixFirst follow-up report`,
    ``,
    `Issue: ${input.category}`,
    `Location: ${where}${input.spotDetails ? ` — ${input.spotDetails}` : ""}`,
    `Severity: ${severity}/100 (${priority})`,
    `Accessibility impact: ${profile.accessibility}`,
    `Who is affected: ${profile.affected.join(", ")}`,
    ``,
    `Summary: ${profile.safety}`,
    `Recommended action: ${profile.fix}`,
  ].join("\n");
}

// ╭─ GEMINI: facilities-ready report generator ───────────────────────╮
// │ Given a fully analyzed report, Gemini drafts a professional        │
// │ maintenance write-up. Mock version assembles it from fields.       │
// ╰────────────────────────────────────────────────────────────────────╯

// Map a free-text service name / description (e.g. from a real Open311
// feed) onto a FixFirst hazard category. GEMINI would classify this from
// the photo + text; here we keyword-match the real service names.
export function categorizeText(text: string): HazardCategory {
  const t = text.toLowerCase();
  // Specific matchers first so they win over the broad ones below.
  if (/flood|standing water|ponding|drain(age)?|storm water/.test(t)) return "Flooding / standing water";
  if (/\btree\b|branch|limb|fallen/.test(t)) return "Fallen tree / branch";
  if (/tactile|detectable warning|truncated dome/.test(t)) return "Missing tactile paving";
  if (/curb cut|curb ramp/.test(t)) return "Broken curb cut";
  if (/scooter|dockless|e-?scooter|lime|bird|jump bike/.test(t)) return "Scooter / bike obstruction";
  if (/walk signal|ped(estrian)? signal|signal (out|broken|dark|stuck)|push button|beg button/.test(t))
    return "Crosswalk signal issue";
  if (/pothole|pavement|roadway|street defect|asphalt/.test(t)) return "Pothole";
  if (/sidewalk|trip|pavement crack|walkway/.test(t)) return "Cracked sidewalk";
  if (/ramp|wheelchair|\bada\b|accessib/.test(t)) return "Blocked wheelchair ramp";
  if (/light|lamp|lighting|street ?light|illuminat/.test(t)) return "Broken light";
  if (/crossing|crosswalk|pedestrian|traffic signal/.test(t)) return "Unsafe crossing";
  if (/\bsign\b|signage|stop sign|sign down/.test(t)) return "Damaged sign";
  if (/trash|garbage|litter|sanitation|dumping|debris|overflow|waste/.test(t))
    return "Overflowing trash";
  if (/bike|bicycle|cycle/.test(t)) return "Blocked bike lane";
  return "Other";
}
