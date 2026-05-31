// ─────────────────────────────────────────────────────────────
// FixFirst — Chicago 311 adapter (REAL open data, keyless Socrata SODA)
//
// Dataset: Chicago 311 Service Requests (v6vf-nfxy). Public, keyless.
// We pull recent requests with coordinates and normalize them.
// Docs: https://dev.socrata.com/foundry/data.cityofchicago.org/v6vf-nfxy
// ─────────────────────────────────────────────────────────────

import type { NormalizedReport } from "../normalizeReport";
import { normalizeStatus, parseGeo } from "../normalizeReport";

const ENDPOINT = "https://data.cityofchicago.org/resource/v6vf-nfxy.json";
export const SOURCE_LABEL = "Chicago 311 open data";

export async function fetchChicago311(limit = 60): Promise<NormalizedReport[]> {
  const params = new URLSearchParams({
    $limit: String(limit),
    $order: "created_date DESC",
    $where: "latitude IS NOT NULL",
    $select: "sr_number,sr_type,sr_short_code,street_address,latitude,longitude,status,created_date,last_modified_date",
  });
  const res = await fetch(`${ENDPOINT}?${params}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
    next: { revalidate: 300 },
  } as RequestInit);
  if (!res.ok) throw new Error(`Chicago 311 responded ${res.status}`);

  const rows = (await res.json()) as any[];
  const out: NormalizedReport[] = [];
  for (const r of rows) {
    const geo = parseGeo(r.latitude, r.longitude);
    if (!geo) continue;
    out.push({
      externalId: String(r.sr_number ?? `${geo.lat},${geo.lng}`),
      serviceName: String(r.sr_type ?? "Service request"),
      description: String(r.sr_type ?? ""),
      address: String(r.street_address ?? ""),
      geo,
      status: normalizeStatus(r.status),
      createdAt: String(r.created_date ?? new Date().toISOString()),
      updatedAt: String(r.last_modified_date ?? r.created_date ?? new Date().toISOString()),
      sourceKey: "chicago311",
      sourceLabel: SOURCE_LABEL,
    });
  }
  return out;
}
