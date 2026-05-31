"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/ui";
import { ReputationBadge } from "@/components/ReputationBadge";
import { ChallengesCard } from "@/components/ChallengesCard";
import { shareContent } from "@/lib/share";
import { POINT_RULES, REWARDS, REWARDS_NOTE, badgesFor, tierFor } from "@/lib/reputation";
import { MOCK_TEAMS, userById } from "@/lib/social";
import type { Team } from "@/lib/social";
import type { UserProfile } from "@/lib/types";
import {
  ShieldIcon, StarIcon, CheckIcon, BoltIcon, AccessibilityIcon, UsersIcon, GavelIcon, ShareIcon,
} from "@/components/Icons";

interface CivicUser extends UserProfile {
  verifiedReports: number;
  reportsLedToFix: number;
  communityVerifications: number;
  accessibilityReports: number;
  highSeverityReports: number;
  rankMovement: number; // +up / -down / 0 since last week
}

const MOCK_USERS: CivicUser[] = [
  { name: "Maya Ortiz", reputation: 842, reportsFiled: 61, jurorVotesCast: 140, confirmedReports: 47, verifiedReports: 47, reportsLedToFix: 29, communityVerifications: 140, accessibilityReports: 22, highSeverityReports: 18, rankMovement: 0 },
  { name: "Devon Walsh", reputation: 604, reportsFiled: 44, jurorVotesCast: 98, confirmedReports: 33, verifiedReports: 33, reportsLedToFix: 19, communityVerifications: 98, accessibilityReports: 11, highSeverityReports: 14, rankMovement: 2 },
  { name: "Priya Nair", reputation: 471, reportsFiled: 38, jurorVotesCast: 76, confirmedReports: 26, verifiedReports: 26, reportsLedToFix: 15, communityVerifications: 76, accessibilityReports: 17, highSeverityReports: 9, rankMovement: -1 },
  { name: "Alex Chen", reputation: 376, reportsFiled: 30, jurorVotesCast: 60, confirmedReports: 20, verifiedReports: 20, reportsLedToFix: 11, communityVerifications: 60, accessibilityReports: 5, highSeverityReports: 8, rankMovement: 1 },
  { name: "Jordan Lee", reputation: 295, reportsFiled: 24, jurorVotesCast: 47, confirmedReports: 14, verifiedReports: 14, reportsLedToFix: 7, communityVerifications: 47, accessibilityReports: 4, highSeverityReports: 6, rankMovement: -2 },
  { name: "Lena Fischer", reputation: 196, reportsFiled: 19, jurorVotesCast: 41, confirmedReports: 11, verifiedReports: 11, reportsLedToFix: 5, communityVerifications: 41, accessibilityReports: 8, highSeverityReports: 4, rankMovement: 3 },
];

type MetricKey = "reputation" | "communityVerifications" | "accessibilityReports" | "reportsLedToFix";
const TABS: { key: string; label: string; metric: MetricKey; teams?: boolean; friends?: boolean }[] = [
  { key: "city", label: "City", metric: "reputation" },
  { key: "campus", label: "Campus", metric: "reputation" },
  { key: "friends", label: "Friends", metric: "reputation", friends: true },
  { key: "teams", label: "Teams", metric: "reputation", teams: true },
  { key: "week", label: "This week", metric: "communityVerifications" },
  { key: "access", label: "Accessibility", metric: "accessibilityReports" },
  { key: "fixes", label: "Led to fixes", metric: "reportsLedToFix" },
  { key: "verifiers", label: "Verifiers", metric: "communityVerifications" },
];

export default function LeaderboardPage() {
  const { user, userReports, friends } = useStore();
  const [tabKey, setTabKey] = useState("city");
  const tab = TABS.find((t) => t.key === tabKey)!;

  const me: CivicUser & { isMe: boolean } = {
    ...user,
    verifiedReports: user.confirmedReports,
    reportsLedToFix: userReports.filter((r) => r.status === "Fixed").length,
    communityVerifications: user.jurorVotesCast,
    accessibilityReports: userReports.filter((r) => r.analysis.accessibilityImpact === "High" || r.analysis.accessibilityImpact === "Medium").length,
    highSeverityReports: userReports.filter((r) => r.analysis.severity >= 70).length,
    rankMovement: 2,
    isMe: true,
  };

  const friendNames = useMemo(
    () => friends.map((id) => userById(id)?.name).filter(Boolean) as string[],
    [friends]
  );

  const list = useMemo(() => {
    let people = [...MOCK_USERS.map((u) => ({ ...u, isMe: false })), me];
    if (tab.friends) people = people.filter((u) => u.isMe || friendNames.includes(u.name));
    return people.sort((a, b) => (b[tab.metric] as number) - (a[tab.metric] as number));
  }, [tab, friendNames, me]);

  const teamsRanked = useMemo(() => [...MOCK_TEAMS].sort((a, b) => b.points - a.points), []);
  const badges = badgesFor(user, userReports);

  // "You are ranked #X — N points away from top 10" (current tab/metric).
  const myRank = !tab.teams ? list.findIndex((u) => u.isMe) + 1 : 0;
  const top10Cut = list[Math.min(9, list.length - 1)]?.[tab.metric] as number | undefined;
  const ptsToTop10 =
    myRank > 10 && top10Cut != null ? top10Cut - (me[tab.metric] as number) : 0;

  return (
    <div className="pb-4">
      <AppHeader
        title="Civic Leaderboard"
        subtitle="Ranked by verified civic impact, not volume"
        right={
          <button
            onClick={() => shareContent({ title: "FixFirst", text: `I'm ranked on the FixFirst civic leaderboard with ${user.reputation} verified impact points.` })}
            className="btn-ghost text-xs"
          >
            <ShareIcon className="h-4 w-4" /> Rank
          </button>
        }
      />

      {/* tabs */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/[0.08] px-3 py-2.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTabKey(t.key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              t.key === tabKey ? "border-brand-500 bg-brand-600 text-white" : "border-white/10 bg-app-850 text-white/65"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-4">
        <div className="card flex items-start gap-2.5 p-3.5">
          <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
          <div>
            <div className="text-sm font-bold text-white">FixFirst rewards verified impact, not spam.</div>
            <p className="mt-0.5 text-[12px] text-white/55">
              Rank reflects confirmed reports, fixes triggered, and community verifications — never raw posting volume.
            </p>
          </div>
        </div>

        {!tab.teams && myRank > 0 && (
          <div className="card flex items-center gap-3 border-brand-500/30 bg-brand-500/5 p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-black text-white">
              #{myRank}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">
                You are ranked #{myRank} {tabKey === "week" || tabKey === "verifiers" ? "this week" : "in your city"}
              </div>
              <div className="text-[12px] text-white/55">
                {ptsToTop10 > 0
                  ? `${ptsToTop10} ${METRIC_LABEL[tab.metric]} away from the top 10.`
                  : "You're in the top 10 — keep verifying to climb."}
              </div>
            </div>
            <RankMovement movement={me.rankMovement} />
          </div>
        )}

        {tab.teams ? (
          <div className="space-y-2.5">
            {teamsRanked.map((t, i) => (
              <TeamRow key={t.id} team={t} rank={i + 1} />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {list.map((u, i) => (
              <UserRow key={`${u.name}-${i}`} u={u} rank={i + 1} metric={tab.metric} />
            ))}
            {list.length === 1 && tab.friends && (
              <p className="text-center text-[12px] text-white/45">Add friends to see them ranked here.</p>
            )}
          </div>
        )}

        {/* challenges */}
        <ChallengesCard />

        {/* how points work */}
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">How points work</div>
          <ul className="mt-2 space-y-1.5 text-[12px]">
            {POINT_RULES.map((rule) => (
              <li key={rule.label} className="flex items-center justify-between gap-2">
                <span className="text-white/70">{rule.label}</span>
                <span className={`font-bold tabular-nums ${rule.points < 0 ? "text-red-400" : "text-emerald-300"}`}>
                  {rule.points > 0 ? `+${rule.points}` : rule.points}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* badges */}
        <div>
          <h3 className="mb-2 font-bold text-white">Your badges</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {badges.map((b) => (
              <div key={b.label} className={`card flex flex-col items-center gap-1.5 p-3 text-center ${b.earned ? "" : "opacity-35"}`}>
                <StarIcon className={`h-6 w-6 ${b.earned ? "text-yellow-400" : "text-white/40"}`} />
                <span className="text-[10px] font-medium leading-tight text-white/80">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* rewards */}
        <div>
          <h3 className="mb-2 font-bold text-white">Rewards</h3>
          <div className="space-y-2.5">
            {REWARDS.map((r) => {
              const unlocked = user.reputation >= r.unlockAt;
              return (
                <div key={r.label} className={`card flex items-center gap-3 p-3.5 ${unlocked ? "" : "opacity-60"}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${unlocked ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.04] text-white/40"}`}>
                    {unlocked ? <CheckIcon className="h-4 w-4" /> : <ShieldIcon className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white">{r.label}</div>
                    <div className="text-[11px] text-white/50">{r.detail}</div>
                  </div>
                  <span className={`shrink-0 text-[11px] font-semibold tabular-nums ${unlocked ? "text-emerald-300" : "text-white/45"}`}>
                    {unlocked ? "Unlocked" : `${r.unlockAt} pts`}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-white/40">{REWARDS_NOTE}</p>
        </div>
      </div>
    </div>
  );
}

const METRIC_LABEL: Record<MetricKey, string> = {
  reputation: "impact pts",
  communityVerifications: "verifications",
  accessibilityReports: "accessibility",
  reportsLedToFix: "led to fixes",
};

function UserRow({ u, rank, metric }: { u: CivicUser & { isMe: boolean }; rank: number; metric: MetricKey }) {
  const { tier } = tierFor(u.reputation);
  return (
    <div className={`card p-3.5 ${u.isMe ? "border-brand-500/60 ring-1 ring-brand-500/30" : ""}`}>
      <div className="flex items-center gap-3">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-black tabular-nums ${rank <= 3 ? "text-app-950" : "text-white/70"}`}
          style={{ backgroundColor: rank <= 3 ? tier.color : "rgba(255,255,255,0.06)" }}
        >
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold text-white">{u.name}</span>
            {u.isMe && <span className="chip border border-brand-500/40 bg-brand-500/10 text-brand-300">You</span>}
            <RankMovement movement={u.rankMovement} />
          </div>
          <div className="mt-1"><ReputationBadge user={u} size="sm" /></div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold tabular-nums text-white">{u[metric] as number}</div>
          <div className="text-[9px] uppercase tracking-wide text-white/45">{METRIC_LABEL[metric]}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <Metric icon={<CheckIcon className="h-3.5 w-3.5 text-emerald-400" />} label="Verified reports" value={u.verifiedReports} />
        <Metric icon={<BoltIcon className="h-3.5 w-3.5 text-brand-400" />} label="Led to fixes" value={u.reportsLedToFix} />
        <Metric icon={<GavelIcon className="h-3.5 w-3.5 text-white/50" />} label="Verifications" value={u.communityVerifications} />
        <Metric icon={<AccessibilityIcon className="h-3.5 w-3.5 text-orange-300" />} label="Accessibility" value={u.accessibilityReports} />
      </div>
    </div>
  );
}

function TeamRow({ team, rank }: { team: Team; rank: number }) {
  return (
    <div className="card p-3.5">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-sm font-black tabular-nums text-white/70">{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold text-white">{team.name}</div>
          <div className="flex items-center gap-1 text-[11px] text-white/45"><UsersIcon className="h-3 w-3" /> {team.members} members · {team.title}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold tabular-nums text-white">{team.points.toLocaleString()}</div>
          <div className="text-[9px] uppercase tracking-wide text-white/45">impact pts</div>
        </div>
      </div>
    </div>
  );
}

function RankMovement({ movement }: { movement: number }) {
  if (!movement) {
    return <span className="text-[10px] font-semibold text-white/30" title="No change">—</span>;
  }
  const up = movement > 0;
  return (
    <span
      className={`ff-rank-move inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums ${
        up ? "text-emerald-300" : "text-red-300"
      }`}
      title={`${up ? "Up" : "Down"} ${Math.abs(movement)} since last week`}
    >
      {up ? "▲" : "▼"}
      {Math.abs(movement)}
    </span>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-white/50">{label}</span>
      <span className="ml-auto font-bold tabular-nums text-white/85">{value}</span>
    </div>
  );
}
