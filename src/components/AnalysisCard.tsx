"use client";

import type { Report } from "@/lib/types";
import { priorityForReport } from "@/lib/priority";
import { PriorityBadge, AccessibilityBadge, SeverityBar } from "./ui";
import { CategoryIcon, SparkIcon, UsersIcon, SpeakerIcon } from "./Icons";
import { speak } from "@/lib/voice";
import { useStore } from "@/lib/store";
import { pct } from "@/lib/format";

export function AnalysisCard({ report }: { report: Report }) {
  const a = report.analysis;
  const p = priorityForReport(report);
  const Icon = CategoryIcon[report.category];
  const { voicePresetId } = useStore();

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-brand-500/10 p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-400">
              <SparkIcon className="h-3.5 w-3.5" /> AI analysis
            </div>
            <div className="text-lg font-bold text-white">{a.issueType}</div>
          </div>
        </div>
        <PriorityBadge label={p.label} />
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Severity (hazard-driven)">
          <SeverityBar value={a.severity} />
          <div className="mt-1 text-[11px] text-white/45">
            {a.severity}/100 — set by danger, not report volume
          </div>
        </Field>

        <Field label="Priority label">
          <div className="flex items-center gap-2">
            <PriorityBadge label={p.label} />
            <span className="text-[11px] text-white/45">score {p.total}/100</span>
          </div>
        </Field>

        <Field label="Accessibility impact">
          <AccessibilityBadge impact={a.accessibilityImpact} />
        </Field>

        <Field label="Report confidence">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${a.confidence}%` }} />
            </div>
            <span className="text-sm font-semibold text-white">{pct(a.confidence)}</span>
          </div>
        </Field>

        <Field label="Who is affected" full>
          <div className="flex flex-wrap gap-1.5">
            {a.affectedGroups.map((g) => (
              <span key={g} className="chip bg-white/5 text-white/75">
                <UsersIcon className="h-3 w-3 text-white/45" />
                {g}
              </span>
            ))}
          </div>
        </Field>

        <Field label="Suggested fix" full>
          <p className="text-sm text-white/80">{a.suggestedFix}</p>
        </Field>

        <Field label="Duplicate report probability" full>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold tabular-nums ${a.duplicateProbability >= 60 ? "text-orange-300" : "text-white"}`}>
              {pct(a.duplicateProbability)}
            </span>
            <span className="text-sm text-white/55">{a.duplicateNote}</span>
          </div>
        </Field>
      </div>

      <div className="border-t border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
              City / campus-ready summary
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/80">{a.summary}</p>
          </div>
          <button
            onClick={() => speak(a.summary, voicePresetId)}
            className="btn-ghost shrink-0"
            title="Read aloud"
          >
            <SpeakerIcon className="h-4 w-4" /> Aloud
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/45">
        {label}
      </div>
      {children}
    </div>
  );
}
