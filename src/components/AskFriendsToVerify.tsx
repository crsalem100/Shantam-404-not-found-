"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — friend-based verification request (bottom sheet)
// Inviting friends/teams to verify a hazard raises its confidence
// (report credibility score), making the report more trustworthy.
// ─────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Report } from "@/lib/types";
import { userById, teamById } from "@/lib/social";
import { scoreReport } from "@/lib/jury";
import { Avatar } from "./Avatar";
import { Firsty } from "./Firsty";
import { CountUp } from "./CountUp";
import { CloseIcon, CheckIcon, ShieldIcon, ArrowIcon } from "./Icons";

export function AskFriendsToVerify({ report, onClose }: { report: Report; onClose: () => void }) {
  const { friends, joinedTeams, askFriendsToVerify } = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState<{ before: number; after: number; names: string[] } | null>(null);

  const friendUsers = useMemo(() => friends.map(userById).filter(Boolean), [friends]) as NonNullable<
    ReturnType<typeof userById>
  >[];
  const teams = useMemo(() => joinedTeams.map(teamById).filter(Boolean), [joinedTeams]) as NonNullable<
    ReturnType<typeof teamById>
  >[];

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  function send() {
    const before = scoreReport(report).score;
    const names = selected
      .map((id) => userById(id)?.name ?? teamById(id)?.name)
      .filter(Boolean) as string[];
    askFriendsToVerify(report.id, selected);
    // Estimate post-verification confidence (each confirm adds ~4 to score).
    const after = Math.min(100, before + names.length * 4);
    setSent({ before, after, names });
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="animate-sheet no-scrollbar max-h-[88%] w-full overflow-y-auto rounded-t-3xl border-t border-white/10 bg-app-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-app-900/95 px-4 py-3 backdrop-blur">
          <h3 className="text-base font-bold text-white">Ask friends to verify</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-4 px-4 py-6 text-center">
            <div className="animate-unlock mx-auto h-16 w-16">
              <Firsty className="h-16 w-16" bob />
            </div>
            <div>
              <div className="font-semibold text-white">Thanks for verifying</div>
              <p className="mt-1 text-sm text-white/60">
                Verification request sent to {sent.names.join(", ")}.
              </p>
            </div>
            <div className="card mx-auto max-w-xs p-3.5">
              <div className="text-[11px] uppercase tracking-wide text-white/45">Report confidence</div>
              <div className="mt-1 flex items-center justify-center gap-2 text-2xl font-bold">
                <span className="text-white/40">{sent.before}%</span>
                <ArrowIcon className="h-5 w-5 text-emerald-300" />
                <CountUp from={sent.before} to={sent.after} suffix="%" className="text-emerald-300" />
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-1000 ease-out"
                  style={{ width: `${sent.after}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-white/45">
                Community verification increased confidence from {sent.before}% to {sent.after}%.
              </p>
            </div>
            <button onClick={onClose} className="btn-primary w-full">Done</button>
          </div>
        ) : (
          <div className="space-y-4 px-4 py-4">
            <p className="text-[12px] text-white/55">
              Invite people you trust to confirm this {report.category.toLowerCase()} near {report.locationName}. They can verify without seeing your live location.
            </p>

            {friendUsers.length > 0 && (
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">Friends</div>
                <div className="space-y-2">
                  {friendUsers.map((u) => (
                    <Row key={u.id} selected={selected.includes(u.id)} onClick={() => toggle(u.id)}>
                      <Avatar name={u.name} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">{u.name}</div>
                        <div className="text-[11px] text-white/45">{u.verifications} verifications</div>
                      </div>
                    </Row>
                  ))}
                </div>
              </div>
            )}

            {teams.length > 0 && (
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">Your civic teams</div>
                <div className="space-y-2">
                  {teams.map((t) => (
                    <Row key={t.id} selected={selected.includes(t.id)} onClick={() => toggle(t.id)}>
                      <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-brand-500/15 text-brand-300">
                        <ShieldIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">{t.name}</div>
                        <div className="text-[11px] text-white/45">{t.members} members</div>
                      </div>
                    </Row>
                  ))}
                </div>
              </div>
            )}

            <button onClick={send} disabled={selected.length === 0} className="btn-primary w-full py-3">
              Send verification request{selected.length ? ` (${selected.length})` : ""}
            </button>
            <p className="text-center text-[11px] text-white/35">
              Friends can verify reports but cannot track you live.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
        selected ? "border-brand-500 bg-brand-500/10" : "border-white/10 bg-app-850"
      }`}
    >
      {children}
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          selected ? "border-brand-400 bg-brand-500 text-white" : "border-white/20"
        }`}
      >
        {selected && <CheckIcon className="h-3 w-3" />}
      </span>
    </button>
  );
}
