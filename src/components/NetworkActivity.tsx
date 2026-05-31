"use client";

// "Your network" — focused civic activity, not a social feed.
import Link from "next/link";
import { MOCK_ACTIVITY } from "@/lib/social";
import { Avatar } from "./Avatar";
import { ShieldIcon, ArrowIcon, UsersIcon, BoltIcon } from "./Icons";

export function NetworkActivity() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-brand-400" />
          <span className="font-semibold text-white">Your network</span>
        </div>
        <Link href="/friends" className="text-[11px] font-semibold text-brand-400">
          Friends &amp; teams
        </Link>
      </div>
      <div className="mt-3 space-y-2.5">
        {MOCK_ACTIVITY.map((a) => (
          <div key={a.id} className="flex items-start gap-2.5">
            {a.kind === "team" || a.kind === "goal" ? (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                {a.kind === "goal" ? <BoltIcon className="h-4 w-4" /> : <ShieldIcon className="h-4 w-4" />}
              </span>
            ) : (
              <Avatar name={a.who} size={32} />
            )}
            <p className="text-[12px] leading-snug text-white/75">
              <span className="font-semibold text-white">{a.who}</span> {a.text}
            </p>
          </div>
        ))}
      </div>
      <Link
        href="/teams"
        className="mt-3 flex items-center justify-center gap-1 rounded-xl border border-white/10 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/5"
      >
        View civic teams <ArrowIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
