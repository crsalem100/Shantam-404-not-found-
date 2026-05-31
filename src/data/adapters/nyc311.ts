// ─────────────────────────────────────────────────────────────
// FixFirst — NYC 311 adapter (REAL open data, keyless Socrata SODA)
//
// Dataset: NYC 311 Service Requests (erm2-nwe9). Public, no API key
// required for modest pulls. We request the most recent infrastructure-
// relevant complaints with coordinates and normalize them.
// Docs: https://dev.socrata.com/foundry/data.cityofnewyork.us/erm2-nwe9
// ─────────────────────────────────────────────────────────────

import type { NormalizedReport } from "../normalizeReport";
import { normalizeStatus, parseGeo } from "../normalizeReport";

const ENDPOINT = "https://data.cityofnewyork.us/resource/erm2-nwe9.json";
export const SOURCE_LABEL = "NYC 311 open data";

export async function fetchNyc311(limit = 60): Promise<NormalizedReport[]> {
  const params = new URLSearchParams({
    $limit: String(limit),
    $order: "created_date DESC",
    $where: "latitude IS NOT NULL",
    $select:
      "unique_key,complaint_type,descriptor,incident_address,latitude,longitude,status,created_date,resolution_action_updated_date",
  });
  const res = await fetch(`${ENDPOINT}?${params}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
    next: { revalidate: 300 },
  } as RequestInit);
  if (!res.ok) throw new Error(`NYC 311 responded ${res.status}`);

  const rows = (await res.json()) as any[];
  const out: NormalizedReport[] = [];
  for (const r of rows) {
    const geo = parseGeo(r.latitude, r.longitude);
    if (!geo) continue;
    out.push({
      externalId: String(r.unique_key ?? `${geo.lat},${geo.lng}`),
      serviceName: String(r.complaint_type ?? "Service request"),
      description: String(r.descriptor ?? r.complaint_type ?? ""),
      address: String(r.incident_address ?? ""),
      geo,
      status: normalizeStatus(r.status),
      createdAt: String(r.created_date ?? new Date().toISOString()),
      updatedAt: String(r.resolution_action_updated_date ?? r.created_date ?? new Date().toISOString()),
      sourceKey: "nyc311",
      sourceLabel: SOURCE_LABEL,
    });
  }
  return out;
}
