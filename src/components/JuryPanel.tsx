"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — community verification panel
//
// Citizens verify whether a report is credible. Their verifications
// feed the report's credibility score (see lib/jury.ts) and earn the
// verifier reputation. Severity is unaffected — verification judges
// the *report*, not how dangerous the hazard is.
// ─────────────────────────────────────────────────────────────

import { useStore } from "@/lib/store";
import type { JurorVerdict, Report } from "@/lib/types";
import { juryTally, scoreReport } from "@/lib/jury";
import { ReportScoreBadge } from "./ui";
import { ShieldIcon, ThumbUpIcon, ThumbDownIcon } from "./Icons";
import { timeAgo } from "@/lib/format";

export function JuryPanel({ report }: { report: Report }) {
  const { castJurorVote } = useStore();
  const tally = juryTally(report);
  const rs = scoreReport(report);
  const myVote = report.jury.find((j) => j.juror === "You");

  const consensus =
    tally.confirm > tally.reject + tally.unsure
      ? "Community confirms"
      : tally.reject >= tally.confirm
      ? "Community is skeptical"
      : "Needs more verification";

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldIcon className="h-4 w-4 text-brand-400" />
          <span className="font-semibold text-white">Community verifications</span>
        </div>
        <ReportScoreBadge score={rs} />
      </div>

      <p className="mt-1 text-[11px] text-white/45">
        {report.jury.length} verifications · {consensus}
      </p>

      {/* tally bar */}
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10">
        <div className="bg-emerald-500" style={{ width: `${pct(tally.confirm, tally.total)}%` }} />
        <div className="bg-yellow-500" style={{ width: `${pct(tally.unsure, tally.total)}%` }} />
        <div className="bg-red-500" style={{ width: `${pct(tally.reject, tally.total)}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-white/50">
        <span className="text-emerald-300">{tally.confirm} confirm</span>
        <span className="text-yellow-300">{tally.unsure} unsure</span>
        <span className="text-red-300">{tally.reject} reject</span>
      </div>

      {/* your verification */}
      <div className="mt-3 rounded-xl border border-white/10 bg-app-800 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
          {myVote ? "Your verification (+5 reputation)" : "Verify reports from other users — earn reputation"}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <VoteBtn label="Confirm" active={myVote?.verdict === "Confirm"} tone="emerald" onClick={() => castJurorVote(report.id, "Confirm")}>
            <ThumbUpIcon className="h-4 w-4" />
          </VoteBtn>
          <VoteBtn label="Unsure" active={myVote?.verdict === "Need more info"} tone="yellow" onClick={() => castJurorVote(report.id, "Need more info")}>
            ?
          </VoteBtn>
          <VoteBtn label="Reject" active={myVote?.verdict === "Reject"} tone="red" onClick={() => castJurorVote(report.id, "Reject")}>
            <ThumbDownIcon className="h-4 w-4" />
          </VoteBtn>
        </div>
      </div>

      {/* roster */}
      <div className="mt-3 space-y-1.5">
        {report.jury.slice(0, 5).map((j, i) => (
          <div key={i} className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-white/70">
                {initials(j.juror)}
              </span>
              <span className="text-white/75">{j.juror}</span>
            </span>
            <span className={verdictColor(j.verdict)}>{j.verdict}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoteBtn({
  label,
  children,
  active,
  tone,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  active?: boolean;
  tone: "emerald" | "yellow" | "red";
  onClick: () => void;
}) {
  const tones: Record<string, string> = {
    emerald: active ? "border-emerald-400 bg-emerald-500/20 text-emerald-200" : "border-white/10 text-white/70 hover:border-emerald-500/40",
    yellow: active ? "border-yellow-400 bg-yellow-500/20 text-yellow-200" : "border-white/10 text-white/70 hover:border-yellow-500/40",
    red: active ? "border-red-400 bg-red-500/20 text-red-200" : "border-white/10 text-white/70 hover:border-red-500/40",
  };
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs font-semibold transition ${tones[tone]}`}
    >
      <span className="grid h-4 place-items-center">{children}</span>
      {label}
    </button>
  );
}

function pct(n: number, total: number): number {
  return total === 0 ? 0 : (n / total) * 100;
}
function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function verdictColor(v: JurorVerdict): string {
  return v === "Confirm" ? "text-emerald-300" : v === "Reject" ? "text-red-300" : "text-yellow-300";
}
