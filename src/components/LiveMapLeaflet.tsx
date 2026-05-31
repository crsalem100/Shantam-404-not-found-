"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — real map (Leaflet + CARTO dark basemap, no API key)
//
// Accurate lat/lng placement of the user's live location and every
// incident. The map, the city selector, and the priority queue act as
// ONE system:
//   • change city → map flyTo()s to that city's center/zoom
//   • tap a pin   → selects + flies to that report
//   • Follow me   → keeps the map centered on the user as they move
// Swap the TileLayer url for Mapbox/Google if you add a key.
// ─────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint, Report } from "@/lib/types";
import { priorityForReport, PRIORITY_STYLE } from "@/lib/priority";
import { CATEGORY_GLYPH } from "./categoryGlyph";

function incidentIcon(report: Report, active: boolean): L.DivIcon {
  const p = priorityForReport(report);
  const hex = PRIORITY_STYLE[p.label].hex;
  const size = active ? 40 : 30;
  const dim = report.status === "Fixed" ? 0.45 : 1;
  const urgent = p.label === "Urgent" && report.status !== "Fixed";
  const pulseClass =
    report.status === "Fixed" ? "" : urgent ? "ff-pin-live ff-pin-urgent" : "ff-pin-live";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;opacity:${dim}" class="ff-pin ${pulseClass} ${
      active ? "ff-pin-active" : ""
    }">
      <span class="ff-pin-dot" style="background:${hex}">${CATEGORY_GLYPH[report.category]}</span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div class="ff-user"><span class="ff-user-ping"></span><span class="ff-user-dot"></span></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function FollowUser({ point, follow }: { point: GeoPoint | null; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (point && follow) {
      const z = Math.max(map.getZoom(), 15);
      map.setView([point.lat, point.lng], z, { animate: true });
    }
  }, [point, follow, map]);
  return null;
}

// Fly the viewport to the selected city whenever the city changes
// (and once on mount so the initial city is framed correctly).
function FlyToCity({ cityKey, center, zoom }: { cityKey: string; center: GeoPoint; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom, { duration: 1.1, easeLinearity: 0.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityKey]);
  return null;
}

// Fly to a specific report when it is focused (tapped pin / card).
function FlyToReport({ report }: { report: Report | null }) {
  const map = useMap();
  const last = useRef<string>("");
  useEffect(() => {
    if (report?.geo && report.id !== last.current) {
      last.current = report.id;
      const z = Math.max(map.getZoom(), 16);
      map.flyTo([report.geo.lat, report.geo.lng], z, { duration: 0.8 });
    }
  }, [report, map]);
  return null;
}

export default function LiveMapLeaflet({
  reports,
  userPoint,
  selectedId,
  onSelect,
  follow = true,
  cityKey = "uo",
  cityCenter,
  cityZoom = 13,
  focusReport = null,
}: {
  reports: Report[];
  userPoint: GeoPoint | null;
  selectedId?: string;
  onSelect?: (id: string) => void;
  follow?: boolean;
  cityKey?: string;
  cityCenter?: GeoPoint;
  cityZoom?: number;
  focusReport?: Report | null;
}) {
  const router = useRouter();
  const initialCenter = useMemo<[number, number]>(
    () =>
      cityCenter
        ? [cityCenter.lat, cityCenter.lng]
        : userPoint
        ? [userPoint.lat, userPoint.lng]
        : [44.0448, -123.0726],
    // initial only — flyTo handles subsequent changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <MapContainer
      center={initialCenter}
      zoom={cityZoom}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%", background: "#08090d" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        // © OpenStreetMap contributors © CARTO
      />
      {cityCenter && <FlyToCity cityKey={cityKey} center={cityCenter} zoom={cityZoom} />}
      <FollowUser point={userPoint} follow={follow} />
      <FlyToReport report={focusReport} />

      {reports
        .filter((r) => r.geo)
        .map((r) => (
          <Marker
            key={r.id}
            position={[r.geo!.lat, r.geo!.lng]}
            icon={incidentIcon(r, selectedId === r.id)}
            zIndexOffset={selectedId === r.id ? 1000 : 0}
            eventHandlers={{
              click: () => (onSelect ? onSelect(r.id) : router.push(`/reports/${r.id}`)),
            }}
          />
        ))}

      {userPoint && <Marker position={[userPoint.lat, userPoint.lng]} icon={userIcon} interactive={false} />}
    </MapContainer>
  );
}
