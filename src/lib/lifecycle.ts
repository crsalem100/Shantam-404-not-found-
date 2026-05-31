// ─────────────────────────────────────────────────────────────
// FixFirst — report lifecycle timeline
//
// Derives an accountable, ordered set of stages from a report's
// fields — from first submission through department routing to a
// community-verified fix. Pure + deterministic: no AI, no randomness,
// just the report's own state. Used by ReportTimeline on the detail page.
// ─────────────────────────────────────────────────────────────

import { juryTally } from "./jury";
import { priorityForReport } from "./priority";
import type { Report, ReportStatus } from "./types";

export interface LifecycleEvent {
  key: string;
  label: string;
  detail?: string;
  at?: string;
  done: boolean;
  current?: boolean;
}

// Statuses that mean the report has reached (or passed) department routing.
const ROUTED_STATUSES: ReportStatus[] = [
  "Verified",
  "Routed",
  "In progress",
  "Waiting on department",
  "Fixed",
  "Verified fixed",
];

// Statuses where a facilities work order / report has been generated.
const FACILITIES_STATUSES: ReportStatus[] = [
  "Routed",
  "In progress",
  "Waiting on department",
  "Fixed",
  "Verified fixed",
];

// Statuses where the fix is actively under way.
const IN_PROGRESS_STATUSES: ReportStatus[] = [
  "In progress",
  "Waiting on department",
  "Fixed",
  "Verified fixed",
];

// Statuses where the repair has been marked complete.
const FIXED_STATUSES: ReportStatus[] = ["Fixed", "Verified fixed"];

export function lifecycleFor(report: Report): LifecycleEvent[] {
  const { confirm } = juryTally(report);
  const priority = priorityForReport(report);
  const status = report.status;

  const dupDetail =
    report.duplicates >= 1
      ? `${report.duplicates} related report${report.duplicates === 1 ? "" : "s"}`
      : report.analysis.duplicateNote;

  const events: LifecycleEvent[] = [
    {
      key: "submitted",
      label: "Report submitted",
      detail: report.caseId,
      at: report.createdAt,
      done: true,
    },
    {
      key: "analysis",
      label: "Priority analysis completed",
      detail: `Severity ${report.analysis.severity}/100 · ${priority.label} priority`,
      at: report.createdAt,
      done: true,
    },
    {
      key: "duplicates",
      label: "Duplicate cluster checked",
      detail: dupDetail,
      done: report.duplicates >= 1,
    },
    {
      key: "verification",
      label: "Community verification received",
      detail: confirm >= 1 ? `${confirm} verification${confirm === 1 ? "" : "s"}` : undefined,
      done: confirm >= 1,
    },
    {
      key: "routed",
      label: "Routed to department",
      detail: report.department,
      done: ROUTED_STATUSES.includes(status) || confirm >= 1,
    },
    {
      key: "facilities",
      label: "Facilities report generated",
      done: FACILITIES_STATUSES.includes(status),
    },
    {
      key: "in-progress",
      label: "Marked in progress",
      done: IN_PROGRESS_STATUSES.includes(status),
    },
    {
      key: "fixed",
      label: "Marked fixed",
      at: FIXED_STATUSES.includes(status) ? report.updatedAt : undefined,
      done: FIXED_STATUSES.includes(status),
    },
    {
      key: "verified-fixed",
      label: "Fix verified by community",
      at: status === "Verified fixed" ? report.updatedAt : undefined,
      done: status === "Verified fixed",
    },
  ];

  // Mark the first not-done stage as the current step.
  const firstPending = events.find((e) => !e.done);
  if (firstPending) firstPending.current = true;

  return events;
}

// Reference mapping of each lifecycle status to a tailwind text tone,
// for status pills across the app. Kept in lifecycle order.
export const LIFECYCLE_STATUSES: { status: ReportStatus; tone: string }[] = [
  { status: "New", tone: "text-white/60" },
  { status: "Unresolved", tone: "text-yellow-300" },
  { status: "Verified", tone: "text-brand-400" },
  { status: "Routed", tone: "text-brand-400" },
  { status: "In progress", tone: "text-orange-300" },
  { status: "Waiting on department", tone: "text-orange-300" },
  { status: "Fixed", tone: "text-emerald-300" },
  { status: "Verified fixed", tone: "text-emerald-300" },
  { status: "Reopened", tone: "text-red-300" },
];
