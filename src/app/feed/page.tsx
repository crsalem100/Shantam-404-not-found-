"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useLiveLocation, distanceKm } from "@/lib/geo";
import { priorityForReport } from "@/lib/priority";
import { IncidentCard } from "@/components/IncidentCard";
import { AppHeader } from "@/components/ui";
import type { Report } from "@/lib/types";

type FilterKey =
  | "all" | "urgent" | "accessibility" | "potholes" | "sidewalks" | "lighting" | "unresolved" | "fixed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "accessibility", label: "Accessibility" },
  { key: "potholes", label: "Potholes" },
  { key: "sidewalks", label: "Sidewalks" },
  { key: "lighting", label: "Lighting" },
  { key: "unresolved", label: "Unresolved" },
  { key: "fixed", label: "Fixed" },
];

function matches(r: Report, f: FilterKey): boolean {
  switch (f) {
    case "all": return true;
    case "urgent": return priorityForReport(r).label === "Urgent";
    case "accessibility": return r.analysis.accessibilityImpact === "High" || r.analysis.accessibilityImpact === "Medium";
    case "potholes": return r.category === "Pothole";
    case "sidewalks": return r.category === "Cracked sidewalk" || r.category === "Blocked wheelchair ramp";
    case "lighting": return r.category === "Broken light";
    case "unresolved": return r.status !== "Fixed";
    case "fixed": return r.status === "Fixed";
  }
}

export default function FeedPage() {
  const { reports, loadIncidents, ready } = useStore();
  const loc = useLiveLocation(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<"priority" | "distance" | "recent">("priority");

  useEffect(() => {
    if (ready) loadIncidents(loc.point ?? null);
  }, [ready, loc.point, loadIncidents]);

  const list = useMemo(() => {
    const out = reports.filter((r) => matches(r, filter));
    out.sort((a, b) => {
      if (sort === "distance" && loc.point) {
        const da = a.geo ? distanceKm(loc.point, a.geo) : 9999;
        const db = b.geo ? distanceKm(loc.point, b.geo) : 9999;
        return da - db;
      }
      if (sort === "recent") return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      return priorityForReport(b).total - priorityForReport(a).total;
    });
    return out;
  }, [reports, filter, sort, loc.point]);

  return (
    <div>
      <AppHeader
        title="Priority Queue"
        subtitle={`${list.length} hazards · severity-weighted ranking`}
        right={
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-white/10 bg-app-800 px-2 py-1.5 text-xs text-white"
          >
            <option value="priority">Priority</option>
            <option value="distance">Nearest</option>
            <option value="recent">Recent</option>
          </select>
        }
      />

      {/* filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/10 px-3 py-2.5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = reports.filter((r) => matches(r, f.key)).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active ? "border-brand-500 bg-brand-600 text-white" : "border-white/10 bg-app-850 text-white/65"
              }`}
            >
              {f.label} <span className={active ? "text-white/70" : "text-white/35"}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5 p-3">
        {list.map((r) => (
          <IncidentCard key={r.id} report={r} userPoint={loc.point} />
        ))}
        {list.length === 0 && (
          <div className="card p-8 text-center text-sm text-white/50">No reports match this filter.</div>
        )}
      </div>
    </div>
  );
}
