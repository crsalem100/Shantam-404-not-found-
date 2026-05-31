"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { priorityForReport, suggestedTimeframe } from "@/lib/priority";
import { Stat, AppHeader, PriorityBadge, AccessibilityBadge } from "@/components/ui";
import { CategoryIcon, SparkIcon, SpeakerIcon, ArrowIcon, BoltIcon, ShieldIcon, ClockIcon } from "@/components/Icons";
import { speak } from "@/lib/voice";
import { CivicSnapshot } from "@/components/CivicSnapshot";
import { ScoringModal } from "@/components/ScoringModal";
import type { Report } from "@/lib/types";

export default function DashboardPage() {
  const { reports, voicePresetId } = useStore();
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [showScoring, setShowScoring] = useState(false);

  const ranked = useMemo(
    () => [...reports].sort((a, b) => priorityForReport(b).total - priorityForReport(a).total),
    [reports]
  );
  const open = reports.filter((r) => r.status !== "Fixed");
  const urgent = open.filter((r) => priorityForReport(r).label === "Urgent");
  const avgSeverity = reports.length ? Math.round(reports.reduce((s, r) => s + r.analysis.severity, 0) / reports.length) : 0;
  const duplicateClusters = open.filter((r) => r.duplicates >= 2).length;
  const avgDays = open.length ? Math.round(open.reduce((s, r) => s + r.daysUnresolved, 0) / open.length) : 0;
  const top3 = ranked.filter((r) => r.status !== "Fixed").slice(0, 3);

  function playBriefing() {
    // ─ ELEVENLABS: generate a spoken facilities briefing ─
    // When ELEVENLABS_API_KEY is set, send `text` + the selected voice id
    // to ElevenLabs TTS and play the returned audio. Browser TTS fallback:
    const text = buildBriefing(top3);
    setBriefingText(text);
    speak(text, voicePresetId);
  }

  return (
    <div className="pb-4">
      <AppHeader
        title="Facilities action list"
        subtitle="Severity-weighted priority queue"
        right={
          <button onClick={playBriefing} className="btn-ghost text-xs">
            <SpeakerIcon className="h-4 w-4" /> Briefing
          </button>
        }
      />

      <div className="space-y-4 p-4">
        {/* city / national snapshot */}
        <div>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/45">
            City &amp; national snapshot
          </h3>
          <CivicSnapshot />
        </div>

        {/* spoken briefing summary */}
        {briefingText && (
          <div className="card border-brand-500/30 bg-brand-500/5 p-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-300">
                <SpeakerIcon className="h-3.5 w-3.5" /> Facilities briefing
              </span>
              <button onClick={() => speak(briefingText, voicePresetId)} className="text-[11px] font-semibold text-brand-300">
                Replay
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/85">{briefingText}</p>
          </div>
        )}

        {/* analytics */}
        <div className="grid grid-cols-2 gap-2.5">
          <Stat label="Total reports" value={reports.length} hint={`${open.length} open`} />
          <Stat label="Urgent reports" value={urgent.length} accent="text-red-400" hint="urgent action needed" />
          <Stat label="Average severity" value={avgSeverity} hint="across all reports" />
          <Stat label="Duplicate clusters" value={duplicateClusters} hint="grouped repeat reports" />
        </div>
        <Stat label="Average days unresolved" value={avgDays} hint="open reports" />

        {/* severity-weighting explainer */}
        <div className="card flex items-start gap-2.5 border-brand-500/20 bg-brand-500/5 p-3.5">
          <SparkIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
          <p className="text-[12px] leading-relaxed text-white/70">
            <span className="font-semibold text-white">Severity-weighted ranking.</span> The repair priority
            engine orders this action list by how dangerous a hazard is — not how many times it was reported.
            Duplicate clusters and unresolved time only nudge; low-stakes categories like overflowing trash are
            capped so they can&apos;t reach urgent.{" "}
            <button onClick={() => setShowScoring(true)} className="font-semibold text-brand-300 underline">
              How scoring works
            </button>
          </p>
        </div>

        {/* Fix First top 3 */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <BoltIcon className="h-4 w-4 text-brand-400" />
            <h3 className="font-bold text-white">Fix First — top 3</h3>
          </div>
          <div className="space-y-2.5">
            {top3.map((r, i) => (
              <RecCard key={r.id} rank={i + 1} report={r} />
            ))}
          </div>
        </div>

        {/* priority queue */}
        <div>
          <h3 className="mb-2 font-bold text-white">Priority queue</h3>
          <div className="space-y-2">
            {ranked.map((r, i) => {
              const p = priorityForReport(r);
              const Icon = CategoryIcon[r.category];
              return (
                <Link
                  key={r.id}
                  href={`/reports/${r.id}`}
                  className={`card flex items-center gap-3 p-3 ${r.status === "Fixed" ? "opacity-50" : ""}`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <Icon className="h-5 w-5 shrink-0 text-white/55" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">{r.category}</div>
                    <div className="truncate text-[11px] text-white/45">{r.locationName}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <AccessibilityBadge impact={r.analysis.accessibilityImpact} />
                      <DeptBadge department={r.department} />
                      <span className="chip flex items-center gap-1 bg-white/5 text-[10px] text-white/60">
                        <ClockIcon className="h-3 w-3" /> {suggestedTimeframe(p.label)}
                      </span>
                    </div>
                    {r.duplicates >= 2 && (
                      <div className="mt-1 text-[10px] text-white/45">
                        duplicate cluster: {r.duplicates} related reports
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold tabular-nums text-white">{p.total}</div>
                    <PriorityBadge label={p.label} size="sm" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {showScoring && <ScoringModal onClose={() => setShowScoring(false)} />}
    </div>
  );
}

function DeptBadge({ department }: { department: string }) {
  return (
    <span className="chip flex items-center gap-1 bg-white/5 text-[10px] text-white/60">
      <ShieldIcon className="h-3 w-3 text-white/45" /> {department}
    </span>
  );
}

function buildBriefing(top3: Report[]): string {
  if (top3.length === 0) return "No open hazards in the priority queue right now.";
  const r = top3[0];
  const p = priorityForReport(r);
  const sevWord =
    r.analysis.severity >= 80 ? "severe hazard impact" : r.analysis.severity >= 60 ? "serious hazard impact" : "moderate hazard impact";
  let text = `Today's highest-priority issue is a ${r.category.toLowerCase()} at ${r.locationName}. It has ${r.duplicates} related reports, ${r.analysis.accessibilityImpact.toLowerCase()} accessibility impact, and ${sevWord}. Recommended action: ${suggestedTimeframe(p.label).toLowerCase()}.`;
  if (top3[1]) {
    const parts = top3.slice(1).map((x) => `${x.category.toLowerCase()} at ${x.locationName}`);
    text += ` Next in the queue: ${parts.join(", and ")}.`;
  }
  return text;
}

function RecCard({ rank, report }: { rank: number; report: Report }) {
  const p = priorityForReport(report);
  const reasons: string[] = [];
  if (report.analysis.accessibilityImpact === "High") reasons.push("high accessibility impact");
  if (report.analysis.severity >= 80) reasons.push("severe hazard");
  if (report.duplicates >= 2) reasons.push(`duplicate cluster: ${report.duplicates} related reports`);
  if (report.daysUnresolved >= 6) reasons.push(`${report.daysUnresolved} days unresolved`);
  if (reasons.length === 0) reasons.push("elevated composite priority");

  return (
    <div className="card p-3.5">
      <div className="flex items-center justify-between">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{rank}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tabular-nums text-white">{p.total}</span>
          <PriorityBadge label={p.label} size="sm" />
        </div>
      </div>
      <div className="mt-2 font-semibold text-white">{report.category}</div>
      <div className="text-[11px] text-white/45">{report.locationName}</div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <DeptBadge department={report.department} />
        <span className="chip flex items-center gap-1 bg-white/5 text-[11px] text-white/60">
          <ClockIcon className="h-3 w-3" /> SLA {suggestedTimeframe(p.label)}
        </span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {reasons.map((reason) => (
          <li key={reason} className="chip bg-white/5 text-[11px] text-white/70">{reason}</li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
        <span className="text-[11px] text-white/45">Routed to {report.department}</span>
        <Link
          href={`/reports/${report.id}?report=1`}
          className="flex items-center gap-1 text-[11px] font-semibold text-brand-300"
        >
          Open &amp; generate report <ArrowIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
