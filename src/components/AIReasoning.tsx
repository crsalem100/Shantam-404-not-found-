"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — "AI Reasoning"
//
// Makes the AI's ranking transparent: what the photo showed, what the
// voice note conveyed, and exactly why the composite priority landed
// where it did. In production every line here is produced by Gemini:
//   • analyze photo/video  • analyze voice transcript
//   • merge visual + spoken context  • explain severity/accessibility
// ─────────────────────────────────────────────────────────────

import type { Report } from "@/lib/types";
import { priorityForReport } from "@/lib/priority";
import {
  SparkIcon, CameraIcon, MicIcon, AccessibilityIcon, UsersIcon, ClockIcon,
} from "./Icons";

export function AIReasoning({ report }: { report: Report }) {
  const a = report.analysis;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/10 bg-brand-500/10 px-4 py-3">
        <SparkIcon className="h-4 w-4 text-brand-400" />
        <span className="font-semibold text-white">AI Reasoning</span>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-white/40">Gemini · multimodal</span>
      </div>

      <div className="divide-y divide-white/[0.06]">
        <Row icon={<CameraIcon className="h-4 w-4" />} label="Photo evidence">
          {a.visualEvidence}
        </Row>
        <Row icon={<MicIcon className="h-4 w-4" />} label="Voice context">
          {a.voiceContext}
        </Row>
        <Row icon={<AccessibilityIcon className="h-4 w-4" />} label="Accessibility impact">
          {a.accessibilityImpact}
          {a.accessibilityImpact === "High" && " — blocks accessible travel"}
        </Row>
        <Row icon={<UsersIcon className="h-4 w-4" />} label="Duplicate cluster">
          {report.duplicates > 0
            ? `${report.duplicates} related reports grouped into 1 case`
            : "No duplicates — distinct issue"}
        </Row>
        <Row icon={<ClockIcon className="h-4 w-4" />} label="Time unresolved">
          {report.daysUnresolved} {report.daysUnresolved === 1 ? "day" : "days"}
        </Row>
      </div>

      <div className="border-t border-white/10 bg-white/[0.02] p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
          Priority explanation
        </div>
        <p className="mt-1 text-sm leading-relaxed text-white/85">
          {explain(report)}
        </p>
      </div>
    </div>
  );
}

function explain(report: Report): string {
  const a = report.analysis;
  const p = priorityForReport(report);
  const sevWord =
    a.severity >= 80 ? "Severe hazard" : a.severity >= 60 ? "Serious hazard" : a.severity >= 40 ? "Moderate hazard" : "Minor hazard";

  const parts = [`${sevWord} (severity ${a.severity})`];
  if (a.accessibilityImpact === "High") parts.push("high accessibility impact");
  else if (a.accessibilityImpact === "Medium") parts.push("moderate accessibility impact");
  if (report.duplicates >= 2) parts.push(`${report.duplicates} related reports`);
  if (report.daysUnresolved >= 2) parts.push(`${report.daysUnresolved} days unresolved`);

  const capped = p.total === p.ceiling && p.ceiling < 100;
  const tail = capped
    ? ` Capped at this category's maximum (${p.ceiling}) — report volume can't override how dangerous a hazard actually is.`
    : "";

  return `${parts.join(" + ")} → ${p.label} priority (${p.total}/100).${tail}`;
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 text-white/55">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40">{label}</div>
        <div className="text-sm text-white/85">{children}</div>
      </div>
    </div>
  );
}
