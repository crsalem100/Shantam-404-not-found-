// ─────────────────────────────────────────────────────────────
// FixFirst — global search / parse module
//
// One search field that resolves across the whole platform: cities
// (recenter the map), hazard categories + departments (queue filters),
// case IDs / report titles (jump straight to a report), and a few
// operational commands ("near me", "urgent", "accessibility"). Pure
// TypeScript — the UI layer turns a chosen suggestion into an action.
// ─────────────────────────────────────────────────────────────

import { CITY_DATASETS } from "@/lib/cities";
import { DEPARTMENT_FOR_CATEGORY } from "@/lib/routing";
import type { HazardCategory, Report } from "@/lib/types";

export interface SearchSuggestion {
  id: string;
  label: string;
  sublabel?: string;
  kind: "city" | "category" | "report" | "caseId" | "department" | "command";
  payload: any;
}

// What the UI should do once a suggestion (or free text) is chosen.
export type SearchAction =
  | { type: "recenterCity"; cityKey: string }
  | { type: "openReport"; reportId: string }
  | { type: "filterCategory"; category: HazardCategory }
  | { type: "filterDepartment"; department: string }
  | { type: "nearMe" }
  | { type: "accessibility" }
  | { type: "urgentOnly" }
  | { type: "text"; query: string };

// Every hazard category the engine knows about, plus a few common
// phrasings so partial / pluralized queries still resolve.
const ALL_CATEGORIES: HazardCategory[] = [
  "Pothole",
  "Cracked sidewalk",
  "Blocked wheelchair ramp",
  "Broken light",
  "Unsafe crossing",
  "Overflowing trash",
  "Blocked bike lane",
  "Other",
];

// Extra search terms that should map onto a category (tolerant matching).
const CATEGORY_ALIASES: Record<HazardCategory, string[]> = {
  Pothole: ["pothole", "potholes", "road defect", "street defect"],
  "Cracked sidewalk": ["cracked sidewalk", "sidewalk", "broken sidewalk", "pavement"],
  "Blocked wheelchair ramp": ["blocked ramp", "wheelchair ramp", "ramp", "curb cut", "accessibility ramp"],
  "Broken light": ["broken light", "broken lights", "street light", "streetlight", "lamp", "lighting"],
  "Unsafe crossing": ["unsafe crossing", "crossing", "crosswalk", "intersection"],
  "Overflowing trash": ["overflowing trash", "trash", "garbage", "litter", "bin"],
  "Blocked bike lane": ["blocked bike lane", "bike lane", "cycle lane", "bike"],
  Other: ["other", "misc", "general"],
};

interface Command {
  keys: string[];
  label: string;
  sublabel: string;
  action: Extract<SearchAction, { type: "nearMe" | "urgentOnly" | "accessibility" }>;
}

const COMMANDS: Command[] = [
  {
    keys: ["near me", "nearby", "around me", "my location"],
    label: "Near me",
    sublabel: "Center the map on your location",
    action: { type: "nearMe" },
  },
  {
    keys: ["urgent", "urgent only", "high priority", "critical", "priority"],
    label: "Urgent only",
    sublabel: "Show severity-weighted urgent reports",
    action: { type: "urgentOnly" },
  },
  {
    keys: ["accessibility", "accessible", "a11y", "ada", "wheelchair", "mobility"],
    label: "Accessibility impact",
    sublabel: "Filter to access-blocking hazards",
    action: { type: "accessibility" },
  },
];

function norm(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

// Returns a rank score for how well `haystack` matches `q`.
// Lower is better; -1 means no match. Exact < prefix < word-prefix < includes.
function matchRank(haystack: string, q: string): number {
  const h = norm(haystack);
  if (!q) return -1;
  if (h === q) return 0;
  if (h.startsWith(q)) return 1;
  // any word inside starts with the query
  if (h.split(" ").some((w) => w.startsWith(q))) return 2;
  if (h.includes(q)) return 3;
  return -1;
}

interface Scored {
  s: SearchSuggestion;
  rank: number;
}

const CASE_ID_RE = /^[a-z]{2,3}-(?:ff-)?\d+|^ff-\d+/i;

export function buildSuggestions(query: string, reports: Report[]): SearchSuggestion[] {
  const q = norm(query);
  if (!q) return [];

  const out: Scored[] = [];
  const push = (s: SearchSuggestion, rank: number) => {
    if (rank >= 0) out.push({ s, rank });
  };

  // Commands — surface operational verbs first so "urgent" etc. resolve.
  for (const c of COMMANDS) {
    const rank = Math.min(...c.keys.map((k) => matchRank(k, q)).map((r) => (r < 0 ? 99 : r)));
    if (rank < 99) {
      push(
        {
          id: `cmd-${c.action.type}`,
          label: c.label,
          sublabel: c.sublabel,
          kind: "command",
          payload: c.action,
        },
        rank,
      );
    }
  }

  // Cities — match display name or short selector label.
  for (const city of CITY_DATASETS) {
    const r = Math.min(
      ...[matchRank(city.name, q), matchRank(city.selectorLabel, q)].map((x) => (x < 0 ? 99 : x)),
    );
    if (r < 99) {
      push(
        {
          id: `city-${city.key}`,
          label: city.name,
          sublabel: `Recenter map · ${city.snapshot.openReports.toLocaleString()} open reports`,
          kind: "city",
          payload: { cityKey: city.key },
        },
        r,
      );
    }
  }

  // Categories — match canonical label or any alias.
  for (const cat of ALL_CATEGORIES) {
    const terms = [cat, ...CATEGORY_ALIASES[cat]];
    const r = Math.min(...terms.map((t) => matchRank(t, q)).map((x) => (x < 0 ? 99 : x)));
    if (r < 99) {
      push(
        {
          id: `cat-${cat}`,
          label: cat,
          sublabel: `Filter queue · ${DEPARTMENT_FOR_CATEGORY[cat]}`,
          kind: "category",
          payload: { category: cat },
        },
        r,
      );
    }
  }

  // Departments — unique department names from the routing table.
  const seenDept = new Set<string>();
  for (const dept of Object.values(DEPARTMENT_FOR_CATEGORY)) {
    if (seenDept.has(dept)) continue;
    seenDept.add(dept);
    const r = matchRank(dept, q);
    if (r >= 0) {
      push(
        {
          id: `dept-${dept}`,
          label: dept,
          sublabel: "Route to department",
          kind: "department",
          payload: { department: dept },
        },
        r,
      );
    }
  }

  // Case IDs — strong match when the query looks like a case identifier.
  const looksLikeCase = CASE_ID_RE.test(q);
  for (const rep of reports) {
    const r = matchRank(rep.caseId, q);
    if (r >= 0) {
      push(
        {
          id: `case-${rep.id}`,
          label: rep.caseId,
          sublabel: `${rep.category} · ${rep.locationName}`,
          kind: "caseId",
          payload: { reportId: rep.id },
        },
        // Bias case-ID hits up when the query clearly is a case ID.
        looksLikeCase ? r : r + 1,
      );
    }
  }

  // Report titles / locations — "category + locationName".
  for (const rep of reports) {
    const title = `${rep.category} · ${rep.locationName}`;
    const r = Math.min(
      ...[matchRank(title, q), matchRank(rep.locationName, q)].map((x) => (x < 0 ? 99 : x)),
    );
    if (r < 99) {
      push(
        {
          id: `report-${rep.id}`,
          label: `${rep.category} — ${rep.locationName}`,
          sublabel: `${rep.caseId} · ${rep.status}`,
          kind: "report",
          payload: { reportId: rep.id },
        },
        r + 1, // de-prioritize fuzzy report hits vs. exact city/category/case
      );
    }
  }

  // Stable sort: rank, then kind priority, then label.
  const kindOrder: Record<SearchSuggestion["kind"], number> = {
    command: 0,
    city: 1,
    category: 2,
    department: 3,
    caseId: 4,
    report: 5,
  };
  out.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (kindOrder[a.s.kind] !== kindOrder[b.s.kind]) return kindOrder[a.s.kind] - kindOrder[b.s.kind];
    return a.s.label.localeCompare(b.s.label);
  });

  // De-dupe by id and cap.
  const seen = new Set<string>();
  const result: SearchSuggestion[] = [];
  for (const { s } of out) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    result.push(s);
    if (result.length >= 8) break;
  }
  return result;
}

export function resolveSuggestion(s: SearchSuggestion): SearchAction {
  switch (s.kind) {
    case "city":
      return { type: "recenterCity", cityKey: s.payload.cityKey };
    case "category":
      return { type: "filterCategory", category: s.payload.category };
    case "department":
      return { type: "filterDepartment", department: s.payload.department };
    case "report":
    case "caseId":
      return { type: "openReport", reportId: s.payload.reportId };
    case "command":
      return s.payload as SearchAction;
    default:
      return { type: "text", query: s.label };
  }
}

// Empty-state suggestions — demo recent searches + nearby campus landmarks.
export const RECENT_PLACEHOLDERS: SearchSuggestion[] = [
  {
    id: "recent-urgent",
    label: "Urgent only",
    sublabel: "Recent search",
    kind: "command",
    payload: { type: "urgentOnly" } as SearchAction,
  },
  {
    id: "recent-ramp",
    label: "Blocked wheelchair ramp",
    sublabel: "Recent search",
    kind: "category",
    payload: { category: "Blocked wheelchair ramp" as HazardCategory },
  },
  {
    id: "near-knight",
    label: "Knight Library",
    sublabel: "Nearby landmark · 13th & Kincaid",
    kind: "command",
    payload: { type: "nearMe" } as SearchAction,
  },
  {
    id: "near-lillis",
    label: "Lillis Business Complex",
    sublabel: "Nearby landmark",
    kind: "command",
    payload: { type: "nearMe" } as SearchAction,
  },
  {
    id: "near-emu",
    label: "EMU (Erb Memorial Union)",
    sublabel: "Nearby landmark",
    kind: "command",
    payload: { type: "nearMe" } as SearchAction,
  },
  {
    id: "near-13th",
    label: "13th Ave",
    sublabel: "Nearby landmark",
    kind: "command",
    payload: { type: "nearMe" } as SearchAction,
  },
];
