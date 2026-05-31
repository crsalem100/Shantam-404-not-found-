"use client";

// Weekly civic challenges with progress — engagement tied to verified
// action, never to raw posting. Each shows progress, %, reward, deadline.
import { MOCK_CHALLENGES } from "@/lib/social";
import { BoltIcon, CheckIcon, ClockIcon } from "./Icons";

export function ChallengesCard({ limit }: { limit?: number }) {
  const list = limit ? MOCK_CHALLENGES.slice(0, limit) : MOCK_CHALLENGES;
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BoltIcon className="h-4 w-4 text-brand-400" />
          <span className="font-semibold text-white">Weekly challenges</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Resets Sunday</span>
      </div>
      <div className="mt-3 space-y-3.5">
        {list.map((c) => {
          const pct = Math.min(100, Math.round((c.current / c.goal) * 100));
          const done = c.current >= c.goal;
          return (
            <div key={c.id}>
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="font-medium text-white/85">{c.title}</span>
                <span className={`shrink-0 font-semibold ${done ? "text-emerald-300" : "text-white/45"}`}>
                  {done ? <CheckIcon className="inline h-3.5 w-3.5" /> : `${c.current}/${c.goal}`}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ${done ? "bg-emerald-500" : "bg-brand-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-white/45">{pct}% · {c.reward}</span>
                <span className="flex items-center gap-1 text-white/35">
                  <ClockIcon className="h-3 w-3" /> {c.deadline}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
