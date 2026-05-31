// ─────────────────────────────────────────────────────────────
// FixFirst — United States civic snapshot
//
// Headline city cards drawn from the multi-city data layer. Mirrors
// the severity-weighted engine that re-ranks 311-style civic data.
// Self-contained: rendered on the dashboard and elsewhere.
// ─────────────────────────────────────────────────────────────

import { CITY_DATASETS, SNAPSHOT_CITIES, cityByKey } from "@/lib/cities";
import { ChartIcon, MapPinIcon, BoltIcon, ClockIcon, AccessibilityIcon } from "@/components/Icons";

function nf(n: number): string {
  return n.toLocaleString("en-US");
}

export function CivicSnapshot() {
  const cities = SNAPSHOT_CITIES.map((key) => cityByKey(key)).filter((c) =>
    CITY_DATASETS.includes(c),
  );

  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <ChartIcon className="h-4 w-4 text-brand-400" />
        <h2 className="text-base font-bold text-white">United States Civic Snapshot</h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {cities.map((c) => (
          <div key={c.key} className="card p-3.5">
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5 text-white/45" />
              <span className="truncate text-sm font-semibold text-white">{c.name}</span>
            </div>

            <div className="mt-2.5 space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-white/55">
                  <ChartIcon className="h-3.5 w-3.5 text-white/40" /> Open
                </span>
                <span className="font-bold tabular-nums text-white">{nf(c.snapshot.openReports)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-white/55">
                  <BoltIcon className="h-3.5 w-3.5 text-white/40" /> Urgent
                </span>
                <span className="font-bold tabular-nums text-red-300">{nf(c.snapshot.urgent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-white/55">
                  <ClockIcon className="h-3.5 w-3.5 text-white/40" /> Avg days
                </span>
                <span className="font-bold tabular-nums text-white">{c.snapshot.avgUnresolvedDays}</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 border-t border-white/[0.08] pt-2 text-[11px] text-white/55">
              <AccessibilityIcon className="h-3 w-3 shrink-0 text-white/40" />
              <span className="truncate">{c.snapshot.topCategory}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-white/40">
        FixFirst can ingest 311-style civic data and re-rank issues by severity,
        accessibility impact, duplicate reports, and unresolved time.
      </p>
    </section>
  );
}
