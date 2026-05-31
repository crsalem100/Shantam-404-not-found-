// ─────────────────────────────────────────────────────────────
// FixFirst — REAL civic data via Open311 (GeoReport v2)
//
// These are genuinely real, public, keyless endpoints. When the app
// is deployed (with internet), /api/incidents fetches live service
// requests near the user, normalizes them, and scores them through
// the same severity engine. If a user's area has no Open311 coverage
// (e.g. Eugene), we pick the nearest covered city and clearly label
// the feed as "nearest live civic feed", with a real-data snapshot as
// the final fallback so the demo always has real-shaped data.
//
// SNOWFLAKE: in production, fetched incidents are upserted into the
// warehouse and deduplicated into clusters there.
// ─────────────────────────────────────────────────────────────

import type { GeoPoint, ReportStatus } from "./types";
import { distanceKm } from "./geo.shared";

export interface Open311City {
  key: string;
  name: string;
  center: GeoPoint;
  endpoint: string; // GeoReport v2 requests.json
  jurisdiction?: string;
}

// Real public GeoReport v2 endpoints.
export const OPEN311_CITIES: Open311City[] = [
  {
    key: "sf",
    name: "San Francisco, CA",
    center: { lat: 37.7749, lng: -122.4194 },
    endpoint: "https://mobile311.sfgov.org/open311/v2/requests.json",
    jurisdiction: "sfgov.org",
  },
  {
    key: "boston",
    name: "Boston, MA",
    center: { lat: 42.3601, lng: -71.0589 },
    endpoint: "https://311.boston.gov/open311/v2/requests.json",
  },
  {
    key: "baltimore",
    name: "Baltimore, MD",
    center: { lat: 39.2904, lng: -76.6122 },
    endpoint: "https://311.baltimorecity.gov/open311/v2/requests.json",
  },
  {
    key: "bloomington",
    name: "Bloomington, IN",
    center: { lat: 39.1653, lng: -86.5264 },
    endpoint: "https://bloomington.in.gov/crm/open311/v2/requests.json",
  },
  {
    key: "brookline",
    name: "Brookline, MA",
    center: { lat: 42.3318, lng: -71.1212 },
    endpoint: "https://spot.brooklinema.gov/open311/v2/requests.json",
  },
  {
    key: "peoria",
    name: "Peoria, IL",
    center: { lat: 40.6936, lng: -89.589 },
    endpoint: "https://ureport.peoriagov.org/open311/v2/requests.json",
  },
];

export function nearestCity(point: GeoPoint): {
  city: Open311City;
  distanceKm: number;
} {
  let best = OPEN311_CITIES[0];
  let bestD = Infinity;
  for (const c of OPEN311_CITIES) {
    const d = distanceKm(point, c.center);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return { city: best, distanceKm: bestD };
}

export interface RawIncident {
  externalId: string;
  serviceName: string;
  description: string;
  address: string;
  geo: GeoPoint;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

function mapStatus(s?: string): ReportStatus {
  const t = (s ?? "").toLowerCase();
  if (t.includes("closed") || t.includes("resolved") || t.includes("fixed"))
    return "Fixed";
  if (t.includes("progress") || t.includes("assigned") || t.includes("acknowledged"))
    return "In progress";
  return "Unresolved";
}

// Fetch real recent requests from a city's Open311 endpoint.
export async function fetchOpen311(city: Open311City): Promise<RawIncident[]> {
  const params = new URLSearchParams({ page_size: "120" });
  if (city.jurisdiction) params.set("jurisdiction_id", city.jurisdiction);
  const url = `${city.endpoint}?${params.toString()}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
    // Cache real data briefly so we don't hammer city servers.
    next: { revalidate: 300 },
  } as RequestInit);

  if (!res.ok) throw new Error(`Open311 ${city.key} responded ${res.status}`);

  const data = (await res.json()) as any[];
  if (!Array.isArray(data)) throw new Error("Open311 unexpected payload");

  const out: RawIncident[] = [];
  for (const r of data) {
    const lat = parseFloat(r.lat ?? r.latitude);
    const lng = parseFloat(r.long ?? r.longitude ?? r.lng);
    if (!isFinite(lat) || !isFinite(lng)) continue; // need real coordinates
    out.push({
      externalId: String(r.service_request_id ?? r.token ?? `${lat},${lng}`),
      serviceName: String(r.service_name ?? "Service request"),
      description: String(r.description ?? r.service_name ?? ""),
      address: String(r.address ?? r.address_string ?? ""),
      geo: { lat, lng },
      status: mapStatus(r.status),
      createdAt: String(r.requested_datetime ?? new Date().toISOString()),
      updatedAt: String(r.updated_datetime ?? r.requested_datetime ?? new Date().toISOString()),
    });
  }
  return out;
}
