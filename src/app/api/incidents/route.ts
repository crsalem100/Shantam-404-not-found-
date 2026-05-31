// ─────────────────────────────────────────────────────────────
// FixFirst — /api/incidents
//
// Returns REAL civic incidents near a lat/lng using Open311, scored
// through the severity engine. Falls back to a real-data snapshot
// when the nearest city has no reachable endpoint (e.g. Eugene) or
// when this host has no internet.
//
// GET /api/incidents?lat=..&lng=..
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { nearestCity, fetchOpen311 } from "@/lib/open311";
import { reportFromRaw, buildSnapshotReports } from "@/lib/reportFactory";
import { distanceKm } from "@/lib/geo.shared";
import type { GeoPoint } from "@/lib/types";

export const dynamic = "force-dynamic";

// Demo home: University of Oregon, Eugene (QuackHacks). Used when the
// client hasn't shared GPS yet so judges see the local feed immediately.
const UO: GeoPoint = { lat: 44.0448, lng: -123.0726 };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const point: GeoPoint = isFinite(lat) && isFinite(lng) ? { lat, lng } : UO;

  // Eugene has no public Open311 endpoint — serve the UO civic feed
  // directly when the user is near campus (or hasn't shared GPS yet).
  if (distanceKm(point, UO) < 60) {
    const incidents = buildSnapshotReports(UO, "University of Oregon · Eugene");
    return NextResponse.json({
      source: "snapshot",
      city: "University of Oregon · Eugene",
      cityKey: "uo",
      center: UO,
      distanceKm: 0,
      nearbyCoverage: true,
      count: incidents.length,
      incidents,
    });
  }

  const { city, distanceKm: cityDist } = nearestCity(point);

  try {
    const raw = await fetchOpen311(city);
    // Keep the closest, most recent real incidents to the user.
    const incidents = raw
      .map((r, i) => ({ r, i, d: distanceKm(point, r.geo) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 40)
      .map(({ r, i }) => reportFromRaw(r, i));

    if (incidents.length > 0) {
      return NextResponse.json({
        source: "open311-live",
        city: city.name,
        cityKey: city.key,
        center: city.center,
        distanceKm: Math.round(cityDist),
        nearbyCoverage: cityDist < 40,
        count: incidents.length,
        incidents,
      });
    }
    throw new Error("no incidents returned");
  } catch (err) {
    // Real-data-shaped snapshot so the demo always works.
    const incidents = buildSnapshotReports(city.center, city.name);
    return NextResponse.json({
      source: "snapshot",
      city: city.name,
      cityKey: city.key,
      center: city.center,
      distanceKm: Math.round(cityDist),
      nearbyCoverage: cityDist < 40,
      count: incidents.length,
      note: "Live Open311 unreachable from this host; showing a real-data-shaped snapshot.",
      incidents,
    });
  }
}
