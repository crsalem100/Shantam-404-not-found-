"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — city / data-source selector
//
// A horizontal pill row that switches the active 311-style dataset.
// UO Demo runs the live/GPS path; the others load mocked 311 data.
// ─────────────────────────────────────────────────────────────

import { useStore } from "@/lib/store";
import { CITY_DATASETS } from "@/lib/cities";

export function CitySelector() {
  const { selectedCityKey, setCity } = useStore();

  return (
    <div className="border-b border-white/[0.08] bg-app-950/70 px-3 py-2.5">
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
        {CITY_DATASETS.map((c) => {
          const active = c.key === selectedCityKey;
          return (
            <button
              key={c.key}
              onClick={() => setCity(c.key)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition active:scale-95 ${
                active
                  ? "bg-brand-600 text-white"
                  : "border border-white/[0.08] bg-app-850 text-white/60 hover:text-white/85"
              }`}
            >
              {c.selectorLabel}
            </button>
          );
        })}
      </div>
      <p className="mt-2 px-0.5 text-[11px] leading-snug text-white/45">
        FixFirst can ingest 311-style civic data and re-rank issues by severity,
        accessibility impact, duplicate reports, and unresolved time.
      </p>
    </div>
  );
}
