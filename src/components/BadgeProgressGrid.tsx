"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — achievements as PROGRESS.
// Unlocked badges glow; locked badges stay faded-but-aspirational with
// a progress bar, % complete, requirement, and reward points.
// ─────────────────────────────────────────────────────────────

import { badgeProgress } from "@/lib/reputation";
import type { Report, UserProfile } from "@/lib/types";
import { StarIcon, CheckIcon } from "./Icons";

export function BadgeProgressGrid({ user, reports }: { user: UserProfile; reports: Report[] }) {
  const badges = badgeProgress(user, reports);
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-bold text-white">Achievements</h3>
        <span className="text-[11px] text-white/45">
          {earned}/{badges.length} unlocked
        </span>
      </div>
      <div className="space-y-2.5">
        {badges.map((b) => (
          <div
            key={b.label}
            className={`card p-3.5 transition ${
              b.earned ? "ff-badge-glow border-yellow-500/30" : "opacity-95"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  b.earned ? "bg-yellow-500/15 text-yellow-400" : "bg-white/[0.05] text-white/35"
                }`}
              >
                {b.earned ? <CheckIcon className="h-5 w-5" /> : <StarIcon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${b.earned ? "text-white" : "text-white/75"}`}>
                    {b.label}
                  </span>
                  <span
                    className={`shrink-0 text-[11px] font-bold tabular-nums ${
                      b.earned ? "text-yellow-300" : "text-white/45"
                    }`}
                  >
                    {b.earned ? "Unlocked" : `${b.pct}%`}
                  </span>
                </div>
                <div className="mt-1 text-[11px] leading-snug text-white/50">{b.requirement}</div>
              </div>
            </div>

            {!b.earned && (
              <>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-[width] duration-700"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/40">
                  <span>
                    {b.current}/{b.goal} complete
                  </span>
                  <span className="text-emerald-300/70">+{b.rewardPoints} pts on unlock</span>
                </div>
              </>
            )}
            {b.earned && (
              <p className="mt-2 text-[11px] leading-snug text-white/55">{b.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
