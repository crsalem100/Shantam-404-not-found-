// ─────────────────────────────────────────────────────────────
// FixFirst — pure geo helpers (safe on server + client)
// ─────────────────────────────────────────────────────────────

import type { GeoPoint } from "./types";

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

export function formatDistance(km: number): string {
  if (km < 0.1) return "right here";
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Deterministic, stable "people nearby" from rounded location + time bucket.
export function nearbyUsers(point: GeoPoint | null, epochMs: number): number {
  if (!point) return 0;
  const cell = `${point.lat.toFixed(2)},${point.lng.toFixed(2)}`;
  const bucket = Math.floor(epochMs / (5 * 60 * 1000));
  return 8 + (hash(`${cell}:${bucket}`) % 233);
}

export function watchersFor(seed: string, epochMs: number): number {
  const bucket = Math.floor(epochMs / (5 * 60 * 1000));
  return 3 + (hash(`${seed}:${bucket}`) % 180);
}
