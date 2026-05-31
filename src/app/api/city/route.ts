// ─────────────────────────────────────────────────────────────
// FixFirst — /api/city?key=nyc311
//
// Loads a city's civic dataset through its adapter (src/data/adapters),
// scores every record with the same severity-weighted engine, and
// returns reports + an HONEST provenance label:
//   • live   → "NYC 311 open data"
//   • snapshot → "Demo data modeled after NYC 311 reports"
// SF / NYC / Chicago attempt a real keyless open-data endpoint; if it's
// unreachable (offline demo host), we fall back to the labeled snapshot.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAdapter } from "@/data/adapters";
import { reportFromRaw, buildCityReports } from "@/lib/reportFactory";
import { cityByKey } from "@/lib/cities";
import { distanceKm } from "@/lib/geo.shared";
import type { GeoPoint } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") ?? "uo";
  const city = cityByKey(key);
  const adapter = getAdapter(key);

  // Snapshot helper — always real-shaped, fully scored, honestly labeled.
  const snapshot = (label: string, live: boolean) => {
    const incidents = buildCityReports(key);
    return NextResponse.json({
      cityKey: key,
      city: city.name,
      center: city.center,
      zoom: city.zoom,
      source: live ? "live" : "snapshot",
      live,
      sourceLabel: label,
      count: incidents.length,
      incidents,
    });
  };

  if (!adapter || !adapter.isReal) {
    return snapshot(adapter?.snapshotLabel ?? `${city.selectorLabel} (demo)`, false);
  }

  try {
    const rows = await adapter.fetchNormalized(60);
    // Keep records nearest the city center (the map is framed there).
    const center: GeoPoint = city.center;
    const incidents = rows
      .map((r, i) => ({ r, i, d: distanceKm(center, r.geo) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 40)
      .map(({ r, i }) => reportFromRaw(r, i, city.source));

    if (incidents.length === 0) throw new Error("no usable rows");

    return NextResponse.json({
      cityKey: key,
      city: city.name,
      center: city.center,
      zoom: city.zoom,
      source: "live",
      live: true,
      sourceLabel: adapter.liveLabel,
      count: incidents.length,
      incidents,
    });
  } catch {
    // Offline / endpoint down → labeled snapshot.
    return snapshot(adapter.snapshotLabel, false);
  }
}
