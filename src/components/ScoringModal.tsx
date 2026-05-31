"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — "How scoring works" modal / bottom-sheet
// Plain-English breakdown of the severity-weighted priority formula
// and the four score bands. Reinforces the guardrail: every category
// has a ceiling, so report volume can never push a low-stakes issue
// above its real severity.
// ─────────────────────────────────────────────────────────────

import { SCORE_BANDS, PRIORITY_STYLE } from "@/lib/priority";
import { PriorityBadge } from "./ui";
import { CloseIcon } from "./Icons";

const FORMULA: { term: string; desc: string }[] = [
  { term: "Severity", desc: "How dangerous the hazard itself is — the dominant base." },
  { term: "Accessibility impact", desc: "Bonus when it blocks ramps, crossings, or accessible travel." },
  { term: "Duplicate cluster", desc: "Related nearby reports nudge it up — capped, severity-scaled." },
  { term: "Unresolved time", desc: "Time pressure as days pass without a fix — capped." },
  { term: "Community verification", desc: "Confirmations from people on the ground corroborate it." },
  { term: "Location risk", desc: "High-traffic spots carry more people through the hazard." },
];

export function ScoringModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="animate-backdrop absolute inset-0 z-[80] flex items-end justify-center bg-black/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-sheet no-scrollbar max-h-[90%] w-full overflow-y-auto rounded-t-3xl border-t border-white/10 bg-app-900 sm:max-w-md sm:rounded-3xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-app-900/95 px-4 py-3 backdrop-blur">
          <h3 className="text-base font-bold text-white">How scoring works</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-4 py-4">
          <div>
            <p className="text-[12px] leading-snug text-white/60">
              Priority = Severity + Accessibility impact + Duplicate cluster + Unresolved time +
              Community verification + Location risk.
            </p>
            <div className="mt-3 space-y-2">
              {FORMULA.map((f) => (
                <div
                  key={f.term}
                  className="rounded-xl border border-white/[0.07] bg-app-950/50 px-3 py-2.5"
                >
                  <div className="text-[13px] font-semibold text-white">{f.term}</div>
                  <div className="mt-0.5 text-[11.5px] leading-snug text-white/50">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
              Score bands
            </div>
            <div className="mt-2 space-y-1.5">
              {SCORE_BANDS.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-app-950/40 px-3 py-2"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_STYLE[b.label].dot}`} />
                  <div className="flex w-full items-center justify-between gap-2">
                    <div>
                      <span className="text-[13px] font-semibold text-white">{b.label}</span>
                      <span className="ml-2 text-[11px] tabular-nums text-white/45">{b.range}</span>
                    </div>
                    <span className="shrink-0 text-[11px] text-white/50">{b.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="rounded-xl border border-white/[0.07] bg-app-950/50 px-3 py-2.5 text-[11.5px] leading-snug text-white/55">
            Each category has a ceiling so report volume can never push a low-stakes issue above its
            real severity.
          </p>

          <button onClick={onClose} className="btn-primary w-full py-3">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
