// ─────────────────────────────────────────────────────────────
// FixFirst — San Francisco 311 adapter (REAL open data)
//
// Primary: SF's GeoReport v2 Open311 endpoint (keyless). Mirrors the
// shape used in lib/open311.ts but emitted as NormalizedReport. SF also
// publishes a Socrata dataset (vw6y-z8j6) if the Open311 host is down.
// ─────────────────────────────────────────────────────────────

import type { NormalizedReport } from "../normalizeReport";
import { normalizeStatus, parseGeo } from "../normalizeReport";

const OPEN311 = "https://mobile311.sfgov.org/open311/v2/requests.json";
export const SOURCE_LABEL = "SF 311 open data";

export async function fetchSf311(limit = 60): Promise<NormalizedReport[]> {
  const params = new URLSearchParams({ page_size: String(limit), jurisdiction_id: "sfgov.org" });
  const res = await fetch(`${OPEN311}?${params}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
    next: { revalidate: 300 },
  } as RequestInit);
  if (!res.ok) throw new Error(`SF 311 responded ${res.status}`);

  const rows = (await res.json()) as any[];
  const out: NormalizedReport[] = [];
  for (const r of rows) {
    const geo = parseGeo(r.lat ?? r.latitude, r.long ?? r.longitude ?? r.lng);
    if (!geo) continue;
    out.push({
      externalId: String(r.service_request_id ?? r.token ?? `${geo.lat},${geo.lng}`),
      serviceName: String(r.service_name ?? "Service request"),
      description: String(r.description ?? r.service_name ?? ""),
      address: String(r.address ?? r.address_string ?? ""),
      geo,
      status: normalizeStatus(r.status),
      createdAt: String(r.requested_datetime ?? new Date().toISOString()),
      updatedAt: String(r.updated_datetime ?? r.requested_datetime ?? new Date().toISOString()),
      sourceKey: "sf311",
      sourceLabel: SOURCE_LABEL,
    });
  }
  return out;
}
