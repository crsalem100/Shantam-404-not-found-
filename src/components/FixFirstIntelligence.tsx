"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — Fix First Intelligence decision panel
// Transparent, operational read on WHY the repair-priority engine
// ranked a report where it did: the concrete Fix-First reasons plus
// decision-confidence metrics. Reads as decision intelligence, not a
// chatbot — every number traces back to the report's own evidence.
// ─────────────────────────────────────────────────────────────

import { priorityForReport, whyFirstReasons } from "@/lib/priority";
import { confidenceMetrics } from "@/lib/confidence";
import type { Report } from "@/lib/types";
import { PriorityBadge } from "./ui";
import { CountUp } from "./CountUp";
import { BoltIcon, CheckIcon } from "./Icons";

export function FixFirstIntelligence({ report }: { report: Report }) {
  const breakdown = priorityForReport(report);
  const reasons = whyFirstReasons(report);
  const metrics = confidenceMetrics(report);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BoltIcon className="h-4 w-4 text-brand-400" />
          <span className="font-semibold text-white">Fix First Intelligence</span>
        </div>
        <PriorityBadge label={breakdown.label} />
      </div>

      <p className="mt-2 text-[12px] leading-snug text-white/55">
        Why the repair-priority engine ranked this {breakdown.label}{" "}
        <span className="tabular-nums text-white/70">({breakdown.total}/100)</span>.
      </p>

      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
          Why this is Fix First
        </div>
        <ul className="mt-2 space-y-1.5">
          {reasons.map((r) => (
            <li key={r} className="flex items-start gap-2 text-[13px] text-white/80">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckIcon className="h-2.5 w-2.5" />
              </span>
              <span className="leading-snug">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
          Decision confidence
        </div>
        <div className="mt-2.5 space-y-2.5">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="text-white/70">{m.label}</span>
                <CountUp to={m.pct} suffix="%" className="font-semibold text-white/85" />
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-[width] duration-1000 ease-out"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
