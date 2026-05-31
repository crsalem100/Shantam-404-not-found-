"use client";

// Analytics strip — real percentages from the current queue. Makes
// FixFirst read like a repair-prioritization platform, not a feed.

import { useMemo } from "react";
import { cityInsights } from "@/lib/insights";
import { ChartIcon } from "./Icons";
import type { Report } from "@/lib/types";

export function CivicInsights({
  reports,
  cityLabel,
  limit = 4,
}: {
  reports: Report[];
  cityLabel?: string;
  limit?: number;
}) {
  const insights = useMemo(() => cityInsights(reports).slice(0, limit), [reports, limit]);
  if (reports.length === 0) return null;

  return (
    <div className="card p-3.5">
      <div className="flex items-center gap-2">
        <ChartIcon className="h-4 w-4 text-brand-400" />
        <span className="text-sm font-semibold text-white">Snapshot{cityLabel ? ` · ${cityLabel}` : ""}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {insights.map((i) => (
          <div key={i.label} className="rounded-xl border border-white/[0.07] bg-app-950/50 p-2.5">
            <div className="text-lg font-bold leading-none text-white">{i.value}</div>
            <div className="mt-1 text-[10.5px] leading-snug text-white/50">{i.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
