"use client";

// Report lifecycle timeline — a vertical accountability rail tracking a
// report from submission through department routing to a community-verified
// fix. Operational, not AI-magic: every node is derived from the report's
// own state via lifecycleFor.

import { lifecycleFor } from "@/lib/lifecycle";
import { timeAgo } from "@/lib/format";
import type { Report } from "@/lib/types";
import { CheckIcon } from "./Icons";

export function ReportTimeline({ report }: { report: Report }) {
  const events = lifecycleFor(report);

  return (
    <div className="card p-4">
      <div>
        <span className="font-semibold text-white">Report lifecycle</span>
        <p className="mt-0.5 text-[11px] text-white/50">Tracked from report to verified fix.</p>
      </div>

      <ol className="mt-3.5">
        {events.map((e, i) => {
          const last = i === events.length - 1;
          return (
            <li key={e.key} className="relative flex gap-3 pb-4 last:pb-0">
              {/* connector rail */}
              {!last && (
                <span
                  aria-hidden
                  className={`absolute left-[11px] top-6 bottom-0 w-px ${e.done ? "bg-emerald-500/40" : "bg-white/10"}`}
                />
              )}

              {/* node */}
              <span className="relative z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                {e.done ? (
                  <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/40">
                    <CheckIcon className="h-3 w-3 text-emerald-300" />
                  </span>
                ) : e.current ? (
                  <span className="flex h-[22px] w-[22px] items-center justify-center">
                    <span className="absolute h-[22px] w-[22px] animate-ping rounded-full bg-brand-500/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-brand-500/40" />
                  </span>
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full border border-white/20 bg-transparent" />
                )}
              </span>

              {/* body */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`text-[13px] font-medium ${
                      e.done || e.current ? "text-white" : "text-white/40"
                    }`}
                  >
                    {e.label}
                  </span>
                  {e.at && (
                    <span className="shrink-0 text-[10px] text-white/40">{timeAgo(e.at)}</span>
                  )}
                </div>
                {e.detail && <p className="mt-0.5 text-[11px] text-white/50">{e.detail}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
