// ─────────────────────────────────────────────────────────────
// FixFirst — juror / report-credibility scoring
//
// Separate from severity. Severity = how dangerous the hazard is.
// Report score = how good / trustworthy the *report* is, based on the
// evidence attached and the community jury's verdicts.
//
// A great report (photo + video + voice + precise GPS + jury confirms)
// scores high; a one-line text-only report scores low even for a
// dangerous hazard — prompting facilities to ask for more before acting.
// ─────────────────────────────────────────────────────────────

import type { Report, ReportScore } from "./types";

export function scoreReport(report: Report): ReportScore {
  const factors = [
    { label: "Photo evidence", points: 22, has: !!report.photoDataUrl || report.source !== "user" },
    { label: "Video evidence", points: 16, has: !!report.videoDataUrl },
    { label: "Voice note", points: 16, has: report.hasVoiceNote },
    { label: "Detailed description", points: 12, has: report.description.trim().length >= 40 },
    { label: "Exact spot given", points: 8, has: report.spotDetails.trim().length > 0 },
    { label: "GPS attached", points: 12, has: report.hasGps },
  ];

  let score = factors.reduce((s, f) => s + (f.has ? f.points : 0), 0);

  // Jury adjustment: confirmations add credibility, rejections subtract.
  const confirms = report.jury.filter((j) => j.verdict === "Confirm").length;
  const rejects = report.jury.filter((j) => j.verdict === "Reject").length;
  score += confirms * 4 - rejects * 8;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const label: ReportScore["label"] =
    score >= 80 ? "Verified" : score >= 60 ? "Credible" : score >= 40 ? "Needs review" : "Low quality";

  return { score, label, factors };
}

export const REPORT_SCORE_STYLE: Record<
  ReportScore["label"],
  { text: string; bg: string; border: string }
> = {
  Verified: { text: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  Credible: { text: "text-brand-400", bg: "bg-brand-500/15", border: "border-brand-500/30" },
  "Needs review": { text: "text-yellow-300", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
  "Low quality": { text: "text-white/60", bg: "bg-white/5", border: "border-white/15" },
};

export function juryTally(report: Report) {
  const confirm = report.jury.filter((j) => j.verdict === "Confirm").length;
  const reject = report.jury.filter((j) => j.verdict === "Reject").length;
  const unsure = report.jury.filter((j) => j.verdict === "Need more info").length;
  return { confirm, reject, unsure, total: report.jury.length };
}
