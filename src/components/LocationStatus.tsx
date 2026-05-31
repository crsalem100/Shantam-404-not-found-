"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — live location status + nearby context
//
// Surfaces the geolocation state in plain language and computes
// the local picture: nearby reports, urgent reports, and duplicate
// clusters within a 3km radius of the user.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import type { LiveLocation } from "@/lib/geo";
import { distanceKm } from "@/lib/geo";
import { priorityForReport } from "@/lib/priority";
import { MapPinIcon, BoltIcon, UsersIcon, ArrowIcon } from "@/components/Icons";
import type { Report } from "@/lib/types";

export function LocationStatus({
  loc,
  reports,
}: {
  loc: LiveLocation;
  reports: Report[];
}) {
  const point = loc.point;

  // Nearest report by straight-line distance.
  let nearest: Report | null = null;
  if (point) {
    let best = Infinity;
    for (const r of reports) {
      if (!r.geo) continue;
      const d = distanceKm(point, r.geo);
      if (d < best) {
        best = d;
        nearest = r;
      }
    }
  }

  // Local context within 3km.
  const within = point
    ? reports.filter((r) => r.geo && distanceKm(point, r.geo) <= 3)
    : [];
  const nearbyCount = within.length;
  const urgentCount = within.filter(
    (r) => priorityForReport(r).label === "Urgent" && r.status !== "Fixed"
  ).length;
  const clusterCount = within.filter((r) => r.duplicates >= 2).length;

  const locating = loc.status === "locating" || loc.status === "idle";

  return (
    <div className="border-y border-white/[0.08] bg-app-900/60 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
            loc.status === "tracking"
              ? "bg-brand-600/20 text-brand-300"
              : loc.status === "denied"
              ? "bg-red-500/15 text-red-300"
              : "bg-white/[0.06] text-white/50"
          }`}
        >
          <MapPinIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          {locating && (
            <div className="text-[13px] font-medium text-white/75">
              Getting your location…
            </div>
          )}

          {loc.status === "tracking" && (
            <>
              <div className="text-[13px] font-medium text-white">
                Location captured
                {nearest ? <span className="text-white/60">: near {nearest.locationName}</span> : null}
              </div>
              {loc.accuracy != null && (
                <div className="text-[11.5px] text-white/45">
                  Accuracy: within {Math.round(loc.accuracy)} meters
                </div>
              )}
            </>
          )}

          {loc.status === "denied" && (
            <div className="text-[13px] font-medium text-white/75">
              Location permission denied.{" "}
              <Link href="/report" className="inline-flex items-center gap-0.5 text-brand-300">
                Add location manually <ArrowIcon className="h-3 w-3" />
              </Link>
            </div>
          )}

          {loc.status === "unavailable" && (
            <div className="text-[13px] font-medium text-white/75">
              Location unavailable.{" "}
              <Link href="/report" className="inline-flex items-center gap-0.5 text-brand-300">
                Add location manually <ArrowIcon className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {point && (
        <div className="no-scrollbar mt-2.5 flex items-center gap-1.5 overflow-x-auto">
          <span className="chip shrink-0 border border-white/[0.08] bg-app-850 text-white/75">
            <UsersIcon className="h-3.5 w-3.5" />
            {nearbyCount} nearby {nearbyCount === 1 ? "report" : "reports"}
          </span>
          <span className="chip shrink-0 border border-red-500/25 bg-red-500/10 text-red-300">
            <BoltIcon className="h-3.5 w-3.5" />
            {urgentCount} urgent near you
          </span>
          <span className="chip shrink-0 border border-white/[0.08] bg-app-850 text-white/75">
            {clusterCount} duplicate {clusterCount === 1 ? "cluster" : "clusters"} nearby
          </span>
        </div>
      )}
    </div>
  );
}
