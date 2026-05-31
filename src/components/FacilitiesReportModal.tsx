"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — generated facilities report (bottom sheet)
// GEMINI drafts the prose in production; mock assembles from fields.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import type { Report } from "@/lib/types";
import { priorityForReport, suggestedTimeframe } from "@/lib/priority";
import { scoreReport, juryTally } from "@/lib/jury";
import { slaFor, sourceLabel } from "@/lib/routing";
import { formatDate, timeAgo } from "@/lib/format";
import { CloseIcon, SpeakerIcon, CheckIcon } from "./Icons";
import { speak } from "@/lib/voice";
import { useStore } from "@/lib/store";

export function FacilitiesReportModal({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { voicePresetId } = useStore();
  const a = report.analysis;
  const p = priorityForReport(report);
  const rs = scoreReport(report);
  const tally = juryTally(report);
  const sla = slaFor(p.label);
  const timeframe = suggestedTimeframe(p.label);
  const emailBody = buildEmail(report);

  function copyAll() {
    const full = [
      `FACILITIES REPAIR REPORT — FixFirst`,
      `Case ID: ${report.caseId}`,
      `Source: ${sourceLabel(report.source)}`,
      `Issue: ${a.issueType}`,
      `Location: ${report.locationName}${report.spotDetails ? ` — ${report.spotDetails}` : ""}`,
      `Submitted: ${formatDate(report.createdAt)}`,
      `Last updated: ${timeAgo(report.updatedAt)}`,
      `Routed department: ${report.department}`,
      `Recommended SLA: ${sla.text}`,
      `Priority score: ${p.total}/100 (${p.label})`,
      `Severity: ${a.severity}/100`,
      `Accessibility impact: ${a.accessibilityImpact}`,
      `Affected groups: ${a.affectedGroups.join(", ")}`,
      `Duplicate reports: ${report.duplicates} related reports grouped into 1 case`,
      `Community verifications: ${tally.confirm}`,
      `Current status: ${report.status}`,
      `Report credibility: ${rs.score}/100 (${rs.label})`,
      ``,
      `Evidence summary: ${evidenceSummary(report)}`,
      `Recommended action: ${a.suggestedFix}`,
      `Suggested timeframe: ${timeframe}`,
      `Public safety concern: ${a.publicSafetyConcern}`,
      ``,
      emailBody,
    ].join("\n");
    navigator.clipboard?.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="animate-sheet no-scrollbar max-h-[88%] w-full overflow-y-auto rounded-t-3xl border-t border-white/10 bg-app-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-app-900/95 px-4 py-3 backdrop-blur">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">
              Facilities report
            </div>
            <h3 className="text-base font-bold text-white">{a.issueType}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-app-850 p-3 text-sm">
            <Row label="Case ID" value={report.caseId} />
            <Row label="Source" value={sourceLabel(report.source)} />
            <Row label="Issue title" value={a.issueType} />
            <Row label="Location" value={report.locationName} />
            <Row label="Routed department" value={report.department} />
            <Row label="Recommended SLA" value={sla.text} />
            <Row label="Submitted" value={formatDate(report.createdAt)} />
            <Row label="Last updated" value={timeAgo(report.updatedAt)} />
            <Row label="Priority score" value={`${p.total}/100 · ${p.label}`} highlight />
            <Row label="Severity" value={`${a.severity}/100`} />
            <Row label="Accessibility impact" value={a.accessibilityImpact} />
            <Row label="Community verifications" value={`${tally.confirm}`} />
            <Row label="Duplicate reports" value={`${report.duplicates} related`} />
            <Row label="Current status" value={report.status} />
            <Row label="Report credibility" value={`${rs.score} · ${rs.label}`} />
            <Row label="Suggested timeframe" value={timeframe} />
          </div>

          <Block title="Affected groups">{a.affectedGroups.join(", ")}</Block>
          <Block title="Evidence summary">{evidenceSummary(report)}</Block>
          <Block title="Recommended action">{a.suggestedFix}</Block>
          <Block title="Public safety concern">{a.publicSafetyConcern}</Block>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                Email to facilities
              </div>
              <button
                onClick={() => speak(emailBody, voicePresetId)}
                className="flex items-center gap-1 text-[11px] font-semibold text-brand-400"
              >
                <SpeakerIcon className="h-3.5 w-3.5" /> Read aloud
              </button>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-app-850 p-3 font-sans text-[13px] leading-relaxed text-white/80">
              {emailBody}
            </pre>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-2 border-t border-white/10 bg-app-900/95 px-4 py-3 backdrop-blur">
          <button onClick={onClose} className="btn-ghost flex-1">Close</button>
          <button onClick={copyAll} className="btn-primary flex-1">
            {copied ? (<><CheckIcon className="h-4 w-4" /> Copied</>) : "Copy report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function evidenceSummary(report: Report): string {
  const parts: string[] = [];
  parts.push(report.photoDataUrl || report.source !== "user" ? "Photo evidence on file." : "No photo.");
  if (report.videoDataUrl) parts.push("Video evidence attached.");
  parts.push(report.hasVoiceNote ? "Voice note captured." : "Text description provided.");
  if (report.analysis.transcript) parts.push(`Reporter said: "${report.analysis.transcript}"`);
  else if (report.description) parts.push(`Reporter noted: "${report.description}"`);
  parts.push(`Affected: ${report.analysis.affectedGroups.slice(0, 3).join(", ")}.`);
  return parts.join(" ");
}

function buildEmail(report: Report): string {
  const p = priorityForReport(report);
  const sla = slaFor(p.label);
  const timeframe = suggestedTimeframe(p.label).toLowerCase();
  const access = report.analysis.accessibilityImpact === "High";
  const verifications = juryTally(report).confirm;
  return [
    `To: facilities@uoregon.edu`,
    `Subject: [${p.label}] ${report.category} — ${report.locationName} (Case ${report.caseId})`,
    ``,
    `Dear ${report.department},`,
    ``,
    `This case (${report.caseId}) has been routed to your department for repair. A ${p.label.toLowerCase()}-priority ${
      access ? "accessibility hazard" : "infrastructure hazard"
    } has been reported near ${report.locationName}. ${report.analysis.publicSafetyConcern} The issue has been confirmed by ${report.duplicates} related report${
      report.duplicates === 1 ? "" : "s"
    } and ${verifications} community verification${verifications === 1 ? "" : "s"}, and has been unresolved for ${report.daysUnresolved} day${report.daysUnresolved === 1 ? "" : "s"}.`,
    ``,
    `Recommended action: ${report.analysis.suggestedFix}${
      access ? " Inspect alternate accessible route signage." : ""
    }`,
    ``,
    `Recommended SLA: ${sla.text} (suggested timeframe: ${timeframe}).`,
    ``,
    `Severity ${report.analysis.severity}/100 · ${report.analysis.accessibilityImpact} accessibility impact · composite priority ${p.total}/100.`,
    ``,
    `Thank you,`,
    `FixFirst — civic repair priority engine`,
  ].join("\n");
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-white/40">{label}</div>
      <div className={`text-sm ${highlight ? "font-bold text-brand-400" : "font-medium text-white"}`}>{value}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/45">{title}</div>
      <p className="text-sm leading-relaxed text-white/80">{children}</p>
    </div>
  );
}
