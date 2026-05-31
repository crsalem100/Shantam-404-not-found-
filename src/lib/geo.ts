"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — live location tracker (client)
// Pure helpers live in geo.shared.ts (safe on server too).
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import type { GeoPoint } from "./types";

export {
  distanceKm,
  formatDistance,
  nearbyUsers,
  watchersFor,
} from "./geo.shared";

export interface LiveLocation {
  point: GeoPoint | null;
  accuracy: number | null;
  status: "idle" | "locating" | "tracking" | "denied" | "unavailable";
  error?: string;
}

// A real, live location tracker using the browser Geolocation API.
// watchPosition keeps the blue dot following the user as they move.
export function useLiveLocation(autoStart = true): LiveLocation & {
  start: () => void;
} {
  const [state, setState] = useState<LiveLocation>({
    point: null,
    accuracy: null,
    status: "idle",
  });
  const watchId = useRef<number | null>(null);

  function start() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((s) => ({ ...s, status: "unavailable" }));
      return;
    }
    setState((s) => ({ ...s, status: "locating" }));
    if (watchId.current !== null) return;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          point: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracy: pos.coords.accuracy,
          status: "tracking",
        });
      },
      (err) => {
        setState((s) => ({
          ...s,
          status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
          error: err.message,
        }));
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }

  useEffect(() => {
    if (autoStart) start();
    return () => {
      if (watchId.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, start };
}
