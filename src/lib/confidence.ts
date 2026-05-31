// ─────────────────────────────────────────────────────────────
// FixFirst — decision-confidence metrics (Fix First Intelligence)
//
// Turns a report's evidence + community signal into the confidence
// percentages shown in the "Fix First Intelligence" panel. These make
// the ranking read as transparent DECISION INTELLIGENCE — not chatbot
// magic. Every number is derived from the report's own fields.
//
// GEMINI: in production, severity / accessibility / duplicate-match
// confidences come from the multimodal model's analysis of the photo,
// video, and voice transcript. Here they're computed deterministically.
// ─────────────────────────────────────────────────────────────

import type { Report } from "./types";

export interface ConfidenceMetric {
  label: string;
  pct: number; // 0–100
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function confidenceMetrics(report: Report): ConfidenceMetric[] {
  const a = report.analysis;
  const confirms = report.jury.filter((j) => j.verdict === "Confirm").length;
  const total = report.jury.length || 1;

  // Severity confidence: the model's stated confidence, lifted by evidence.
  const evidence =
    (report.photoDataUrl ? 1 : report.source !== "user" ? 1 : 0) +
    (report.videoDataUrl ? 1 : 0) +
    (report.hasVoiceNote ? 1 : 0);
  const severityConf = clamp(a.confidence + evidence * 2);

  // Accessibility-impact confidence.
  const accBase =
    a.accessibilityImpact === "High"
      ? 88
      : a.accessibilityImpact === "Medium"
      ? 72
      : a.accessibilityImpact === "Low"
      ? 55
      : 30;

  // Duplicate-match confidence comes straight from the cluster probability.
  const dupConf = clamp(a.duplicateProbability);

  // Community-verification confidence scales with confirm ratio + count.
  const verifyConf = clamp((confirms / total) * 70 + Math.min(confirms, 5) * 6);

  return [
    { label: "Severity confidence", pct: severityConf },
    { label: "Accessibility impact confidence", pct: clamp(accBase) },
    { label: "Duplicate match confidence", pct: dupConf },
    { label: "Community verification confidence", pct: verifyConf },
  ];
}
