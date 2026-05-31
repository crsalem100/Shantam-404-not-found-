"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { ReputationMeter } from "@/components/ReputationBadge";
import { VoicePicker } from "@/components/VoicePicker";
import { IncidentCard } from "@/components/IncidentCard";
import { Stat, AppHeader } from "@/components/ui";
import { tierFor, REWARDS, REWARDS_NOTE } from "@/lib/reputation";
import { BadgeProgressGrid } from "@/components/BadgeProgressGrid";
import { ChallengesCard } from "@/components/ChallengesCard";
import { shareContent, INVITE_TEXT } from "@/lib/share";
import { ShieldIcon, StarIcon, GavelIcon, CheckIcon, ArrowIcon, UsersIcon } from "@/components/Icons";

export default function ProfilePage() {
  const { user, userReports, resetDemo, friends, joinedTeams, authStatus, logout } = useStore();
  const { tier } = tierFor(user.reputation);
  const rewardsPreview = REWARDS.slice(0, 3);
  const mine = userReports.filter((r) => r.source === "uo" || r.source === "user");

  return (
    <div className="pb-4">
      <AppHeader title="Profile" subtitle="Your civic reputation" />

      <div className="space-y-4 p-4">
        {/* identity */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-14 w-14 place-items-center rounded-2xl text-2xl font-black text-white"
              style={{ backgroundColor: tier.color }}
            >
              {user.name[0]}
            </span>
            <div className="flex-1">
              <div className="text-lg font-bold text-white">{user.name}</div>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: tier.color }}>
                <ShieldIcon className="h-4 w-4" /> {tier.title}
              </div>
            </div>
          </div>
          <div className="mt-4"><ReputationMeter user={user} /></div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Reputation" value={user.reputation} accent="text-brand-400" />
          <Stat label="Reports" value={user.reportsFiled} />
          <Stat label="Verifications" value={user.jurorVotesCast} />
        </div>

        {/* my network */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/friends" className="card flex flex-col gap-1 p-3.5 hover:border-white/20">
            <UsersIcon className="h-5 w-5 text-brand-300" />
            <div className="text-sm font-semibold text-white">Friends</div>
            <div className="text-[11px] text-white/50">{friends.length} connected</div>
          </Link>
          <Link href="/teams" className="card flex flex-col gap-1 p-3.5 hover:border-white/20">
            <ShieldIcon className="h-5 w-5 text-brand-300" />
            <div className="text-sm font-semibold text-white">Civic teams</div>
            <div className="text-[11px] text-white/50">{joinedTeams.length} joined</div>
          </Link>
        </div>

        {/* leaderboard link */}
        <Link
          href="/leaderboard"
          className="card flex items-center gap-3 p-3.5 transition-colors hover:border-white/20"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
            <StarIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">Civic Leaderboard</div>
            <div className="text-[11px] text-white/50">City · Friends · Teams · verified impact</div>
          </div>
          <ArrowIcon className="h-4 w-4 shrink-0 text-white/40" />
        </Link>

        {/* how points work */}
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">How reputation works</div>
          <ul className="mt-2 space-y-1.5 text-[12px] text-white/70">
            <li className="flex items-center gap-2"><StarIcon className="h-3.5 w-3.5 text-brand-400" /> File a well-evidenced report (+8–30, by report score)</li>
            <li className="flex items-center gap-2"><GavelIcon className="h-3.5 w-3.5 text-brand-400" /> Verify reports from other users (+5)</li>
            <li className="flex items-center gap-2"><ShieldIcon className="h-3.5 w-3.5 text-brand-400" /> Your report confirmed by the jury (+15)</li>
          </ul>
          <p className="mt-2 text-[11px] text-white/40">Quality &gt; volume — mirrors the severity-weighted ranking.</p>
        </div>

        {/* weekly challenges */}
        <ChallengesCard limit={3} />

        {/* achievements as progress */}
        <BadgeProgressGrid user={user} reports={userReports} />

        {/* rewards preview */}
        <div className="card p-3.5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Rewards</div>
            <Link href="/leaderboard" className="text-[11px] font-semibold text-brand-400">
              View all
            </Link>
          </div>
          <div className="mt-2.5 space-y-2">
            {rewardsPreview.map((r) => {
              const unlocked = user.reputation >= r.unlockAt;
              return (
                <div key={r.label} className={`flex items-center gap-2.5 ${unlocked ? "" : "opacity-60"}`}>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                      unlocked ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.04] text-white/40"
                    }`}
                  >
                    {unlocked ? <CheckIcon className="h-3.5 w-3.5" /> : <ShieldIcon className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-white/85">{r.label}</span>
                  <span
                    className={`shrink-0 text-[11px] font-semibold tabular-nums ${
                      unlocked ? "text-emerald-300" : "text-white/45"
                    }`}
                  >
                    {unlocked ? "Unlocked" : `${r.unlockAt} pts`}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-white/40">{REWARDS_NOTE}</p>
        </div>

        {/* voice settings */}
        <VoicePicker />

        {/* your reports */}
        <div>
          <h3 className="mb-2 font-bold text-white">Your reports</h3>
          <div className="space-y-2.5">
            {mine.map((r) => (
              <IncidentCard key={r.id} report={r} compact />
            ))}
            {mine.length === 0 && (
              <Link href="/report" className="card block p-6 text-center text-sm text-white/50">
                No reports yet — file your first one.
              </Link>
            )}
          </div>
        </div>

        {/* account + settings */}
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Account</div>
          <div className="mt-1.5 text-sm text-white/80">
            {authStatus === "authed"
              ? `Signed in as ${user.name}${user.city ? ` · ${user.city}` : ""}`
              : "Browsing as guest"}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => shareContent({ title: "Join me on FixFirst", text: INVITE_TEXT })}
              className="btn-ghost py-2 text-xs"
            >
              <UsersIcon className="h-4 w-4" /> Invite friend
            </button>
            <button onClick={logout} className="btn-ghost py-2 text-xs">
              {authStatus === "authed" ? "Log out" : "Create account"}
            </button>
          </div>
        </div>

        <button onClick={resetDemo} className="w-full py-2 text-center text-xs text-white/40">
          Reset demo data
        </button>
      </div>
    </div>
  );
}
