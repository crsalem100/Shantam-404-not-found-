// ─────────────────────────────────────────────────────────────
// FixFirst — canonical report normalization
//
// Every data source (SF / NYC / Chicago 311, the UO demo set, and
// in-app user reports) is mapped to ONE normalized shape before it
// touches the priority engine. Adapters in ./adapters/* fetch their
// raw payloads and emit NormalizedReport[]; the API route then scores
// them through the same severity-weighted engine (lib/reportFactory).
//
// This is the seam where real open data plugs in. Each adapter is
// honest about whether it returned LIVE data or a labeled snapshot.
// ─────────────────────────────────────────────────────────────

import type { GeoPoint, ReportSource, ReportStatus } from "@/lib/types";
import type { RawIncident } from "@/lib/open311";

// The normalized record. Structurally a superset of RawIncident so it
// can flow straight into reportFromRaw().
export interface NormalizedReport extends RawIncident {
  sourceKey: ReportSource; // "sf311" | "nyc311" | "chicago311" | "uo" | ...
  sourceLabel: string; // honest provenance label shown in the UI
}

// 311 statuses vary by city; normalize to our three.
export function normalizeStatus(s?: string): ReportStatus {
  const t = (s ?? "").toLowerCase();
  if (t.includes("closed") || t.includes("resolved") || t.includes("completed") || t.includes("fixed"))
    return "Fixed";
  if (t.includes("progress") || t.includes("assigned") || t.includes("acknowledged") || t.includes("open"))
    return "In progress";
  return "Unresolved";
}

export function parseGeo(lat: unknown, lng: unknown): GeoPoint | null {
  const la = typeof lat === "string" ? parseFloat(lat) : (lat as number);
  const ln = typeof lng === "string" ? parseFloat(lng) : (lng as number);
  if (!isFinite(la) || !isFinite(ln) || (la === 0 && ln === 0)) return null;
  return { lat: la, lng: ln };
}

export interface AdapterResult {
  reports: NormalizedReport[];
  live: boolean; // true if a real endpoint answered with usable rows
  sourceLabel: string; // e.g. "NYC 311 open data" or "Demo data modeled after 311 reports"
}
