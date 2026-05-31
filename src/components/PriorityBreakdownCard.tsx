"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — transparent 6-factor priority score breakdown
// Shows exactly how severity + four capped bonuses + location risk
// add up to the final score. Severity is the foundation; volume can
// only nudge. The category ceiling guarantees report volume can never
// override real severity.
// ─────────────────────────────────────────────────────────────

import { priorityForReport, priorityFactors } from "@/lib/priority";
import type { Report } from "@/lib/types";
import { PriorityBadge } from "./ui";
import { ChartIcon } from "./Icons";

export function PriorityBreakdownCard({
  report,
  onHowItWorks,
}: {
  report: Report;
  onHowItWorks?: () => void;
}) {
  const breakdown = priorityForReport(report);
  const factors = priorityFactors(breakdown);
  // The largest bonus sets the bar scale so each is proportional to the rest.
  const maxBonus = Math.max(1, ...factors.filter((f) => !f.isBase).map((f) => f.value));

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ChartIcon className="h-4 w-4 text-brand-400" />
          <span className="font-semibold text-white">Priority score breakdown</span>
        </div>
        {onHowItWorks && (
          <button
            onClick={onHowItWorks}
            className="text-[11px] font-semibold text-brand-300 hover:text-brand-200"
          >
            How scoring works
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2.5">
        {factors.map((f) => {
          if (f.isBase) {
            return (
              <div
                key={f.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-app-950/50 px-3 py-2.5"
              >
                <div>
                  <div className="text-[13px] font-semibold text-white">{f.label}</div>
                  <div className="text-[10.5px] text-white/45">Foundation · severity-weighted</div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold tabular-nums text-white">{f.value}</span>
                  <span className="text-sm text-white/40">/100</span>
                </div>
              </div>
            );
          }
          const muted = f.value === 0;
          const pct = Math.round((f.value / maxBonus) * 100);
          return (
            <div key={f.label} className="flex items-center gap-3">
              <span className={`w-9 shrink-0 text-right text-[13px] font-semibold tabular-nums ${muted ? "text-white/30" : "text-emerald-300"}`}>
                +{f.value}
              </span>
              <div className="min-w-0 flex-1">
                <div className={`text-[12px] ${muted ? "text-white/40" : "text-white/75"}`}>{f.label}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${muted ? "bg-white/15" : "bg-brand-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-3 border-t border-white/10" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tabular-nums text-white">{breakdown.total}</span>
          <span className="text-base text-white/40">/100</span>
        </div>
        <PriorityBadge label={breakdown.label} />
      </div>

      <p className="mt-2 text-[10.5px] leading-snug text-white/40">
        Category cap {breakdown.ceiling} — volume can&apos;t override severity.
      </p>
    </div>
  );
}
