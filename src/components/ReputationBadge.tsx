"use client";

import type { UserProfile } from "@/lib/types";
import { tierFor } from "@/lib/reputation";
import { ShieldIcon } from "./Icons";

export function ReputationBadge({
  user,
  size = "md",
}: {
  user: UserProfile;
  size?: "sm" | "md";
}) {
  const { tier } = tierFor(user.reputation);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{
        color: tier.color,
        borderColor: `${tier.color}55`,
        backgroundColor: `${tier.color}1a`,
      }}
    >
      <ShieldIcon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {tier.title} · {user.reputation}
    </span>
  );
}

export function ReputationMeter({ user }: { user: UserProfile }) {
  const { tier, next, progress } = tierFor(user.reputation);
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold" style={{ color: tier.color }}>
          {tier.title}
        </span>
        {next && (
          <span className="text-white/45">
            {next.min - user.reputation} pts → {next.title}
          </span>
        )}
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress * 100}%`, backgroundColor: tier.color }}
        />
      </div>
    </div>
  );
}
