// ─────────────────────────────────────────────────────────────
// FixFirst — University of Oregon / Eugene adapter (DEMO data)
//
// Eugene has no public Open311 / Socrata feed, so this adapter is
// honestly NOT live: it returns curated cases modeled after real 311
// reports for the QuackHacks demo. The UI labels it as such. When a
// real Eugene endpoint exists, swap fetchMockUO() for a live fetch and
// flip `isReal` to true in the registry.
// ─────────────────────────────────────────────────────────────

import type { NormalizedReport } from "../normalizeReport";

export const SOURCE_LABEL = "UO demo · modeled after 311 reports";

// The detailed UO case set lives in lib/reportFactory (buildSnapshotReports)
// so it can be fully scored. This adapter returns [] to signal "no live
// rows" — the API route then falls back to that scored demo set.
export async function fetchMockUO(): Promise<NormalizedReport[]> {
  return [];
}
