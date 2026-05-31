"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { MOCK_TEAMS, teamById } from "@/lib/social";
import type { Team } from "@/lib/social";
import { shareContent } from "@/lib/share";
import { AppHeader } from "@/components/ui";
import { ShieldIcon, BoltIcon, CheckIcon, PlusIcon, UsersIcon } from "@/components/Icons";

const FOCUS_OPTIONS = ["Accessibility", "Blocked wheelchair ramp", "Broken light", "Pothole", "Blocked bike lane", "General"];

export default function TeamsPage() {
  const { joinedTeams, joinTeam, leaveTeam, isAuthed } = useStore();
  // Guests can browse teams + the leaderboard, but joining requires an account.
  const guardedJoin = (id: string) =>
    isAuthed ? joinTeam(id) : alert("Create a free account to join civic teams.");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ id: string; name: string; focus: string }[]>([]);
  const [name, setName] = useState("");
  const [focus, setFocus] = useState(FOCUS_OPTIONS[0]);

  const mine = useMemo(
    () => joinedTeams.map(teamById).filter(Boolean) as Team[],
    [joinedTeams]
  );
  const ranked = useMemo(() => [...MOCK_TEAMS].sort((a, b) => b.points - a.points), []);

  function create() {
    if (!name.trim()) return;
    if (!isAuthed) {
      alert("Create a free account to start a civic team.");
      return;
    }
    const id = `team-${name.trim().toLowerCase().replace(/\W+/g, "-")}`;
    setCreated((c) => [{ id, name: name.trim(), focus }, ...c]);
    joinTeam(id);
    setName("");
    setCreating(false);
  }

  return (
    <div className="pb-4">
      <AppHeader
        title="Civic teams"
        subtitle="Team impact beats solo volume"
        right={
          <button onClick={() => setCreating((v) => !v)} className="btn-ghost text-xs">
            <PlusIcon className="h-4 w-4" /> Create
          </button>
        }
      />

      <div className="space-y-4 p-4">
        {creating && (
          <div className="card space-y-3 p-4">
            <div className="text-sm font-semibold text-white">New civic team</div>
            <input className="field-input" placeholder="Team name (e.g. EMU Ramp Watch)" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <label className="field-label">Focus category</label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFocus(f)}
                    className={`chip border ${focus === f ? "border-brand-500 bg-brand-500/15 text-brand-200" : "border-white/10 bg-app-850 text-white/60"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={create} className="btn-primary w-full">Create team</button>
          </div>
        )}

        {/* your teams */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Your teams</div>
          {created.map((t) => (
            <div key={t.id} className="card flex items-center gap-3 p-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300"><ShieldIcon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{t.name}</div>
                <div className="text-[11px] text-white/45">Focus: {t.focus} · just created</div>
              </div>
              <span className="chip border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Joined</span>
            </div>
          ))}
          {mine.map((t) => (
            <TeamCard key={t.id} team={t} rank={ranked.findIndex((x) => x.id === t.id) + 1} joined onToggle={() => leaveTeam(t.id)} />
          ))}
          {mine.length === 0 && created.length === 0 && (
            <div className="card p-6 text-center text-sm text-white/50">Join a team below to start.</div>
          )}
        </div>

        {/* team leaderboard / all teams */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <BoltIcon className="h-4 w-4 text-brand-400" />
            <h3 className="font-bold text-white">Team leaderboard</h3>
          </div>
          {ranked.map((t, i) => (
            <TeamCard
              key={t.id}
              team={t}
              rank={i + 1}
              joined={joinedTeams.includes(t.id)}
              onToggle={() => (joinedTeams.includes(t.id) ? leaveTeam(t.id) : guardedJoin(t.id))}
            />
          ))}
        </div>

        <p className="text-[11px] leading-relaxed text-white/40">
          Team impact points come from verified reports and confirmed fixes — not raw posting volume.
        </p>
      </div>
    </div>
  );
}

function TeamCard({ team, rank, joined, onToggle }: { team: Team; rank: number; joined: boolean; onToggle: () => void }) {
  return (
    <div className="card p-3.5">
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{team.name}</div>
          <div className="flex items-center gap-1 text-[11px] text-white/45">
            <UsersIcon className="h-3 w-3" /> {team.members} · {team.title}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold tabular-nums text-white">{team.points.toLocaleString()}</div>
          <div className="text-[9px] uppercase tracking-wide text-white/45">impact pts</div>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-2 text-center">
        <Mini label="Reports" value={team.reportsFiled} />
        <Mini label="Verified" value={team.verifiedReports} />
        <Mini label="Fixes" value={team.reportsLedToFix} />
        <Mini label="Streak" value={`${team.verificationStreak}w`} />
      </div>
      <div className="mt-2.5 flex gap-2">
        <button onClick={onToggle} className={joined ? "btn-ghost flex-1 py-2 text-xs" : "btn-primary flex-1 py-2 text-xs"}>
          {joined ? (<><CheckIcon className="h-4 w-4" /> Joined</>) : "Join team"}
        </button>
        <button
          onClick={() => shareContent({ title: team.name, text: `Join ${team.name} on FixFirst and help verify public-space hazards around UO.` })}
          className="btn-ghost px-3 py-2 text-xs"
        >
          Share
        </button>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-app-850 p-1.5">
      <div className="text-sm font-bold tabular-nums text-white">{value}</div>
      <div className="text-[9px] text-white/45">{label}</div>
    </div>
  );
}
