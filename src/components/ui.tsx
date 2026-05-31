// ─────────────────────────────────────────────────────────────
// FixFirst — shared UI primitives (dark / Citizen-style)
// ─────────────────────────────────────────────────────────────

import type {
  AccessibilityImpact,
  PriorityLabel,
  ReportSource,
  ReportStatus,
  ReportScore,
} from "@/lib/types";
import { PRIORITY_STYLE } from "@/lib/priority";
import { slaFor, sourceLabel } from "@/lib/routing";
import { AccessibilityIcon, ClockIcon, ShieldIcon, StarIcon } from "./Icons";

// The one signal we keep fully colored — it's the core of the product.
export function PriorityBadge({
  label,
  size = "md",
}: {
  label: PriorityLabel;
  size?: "sm" | "md";
}) {
  const s = PRIORITY_STYLE[label];
  return (
    <span
      className={`chip border border-white/[0.08] bg-white/[0.04] ${s.text} ${
        size === "sm" ? "text-[11px]" : ""
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

const ACCESS_DOT: Record<AccessibilityImpact, string> = {
  High: "bg-red-400",
  Medium: "bg-orange-400",
  Low: "bg-yellow-400",
  None: "bg-white/30",
};

export function AccessibilityBadge({ impact }: { impact: AccessibilityImpact }) {
  return (
    <span className="chip border border-white/[0.08] bg-white/[0.04] text-white/65">
      <AccessibilityIcon className="h-3 w-3 text-white/50" />
      {impact} access
      <span className={`h-1.5 w-1.5 rounded-full ${ACCESS_DOT[impact]}`} />
    </span>
  );
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const dot: Record<ReportStatus, string> = {
    New: "bg-sky-400",
    Unresolved: "bg-white/40",
    Verified: "bg-brand-400",
    Routed: "bg-violet-400",
    "In progress": "bg-brand-400",
    "Waiting on department": "bg-amber-400",
    Fixed: "bg-emerald-400",
    "Verified fixed": "bg-emerald-400",
    Reopened: "bg-red-400",
  };
  return (
    <span className="chip border border-white/[0.08] bg-white/[0.04] text-white/65">
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

export function ReportScoreBadge({ score }: { score: ReportScore }) {
  const tone =
    score.score >= 80 ? "text-emerald-300" : score.score >= 60 ? "text-brand-300" : score.score >= 40 ? "text-yellow-300" : "text-white/55";
  return (
    <span className="chip border border-white/[0.08] bg-white/[0.04] text-white/65">
      <StarIcon className={`h-3 w-3 ${tone}`} />
      <span className={tone}>{score.score}</span>
      <span className="text-white/45">{score.label}</span>
    </span>
  );
}

const SOURCE_DOT: Record<ReportSource, string> = {
  user: "bg-brand-400",
  uo: "bg-emerald-400",
  sf311: "bg-sky-400",
  nyc311: "bg-sky-400",
  chicago311: "bg-sky-400",
  community: "bg-violet-400",
};

export function SourceBadge({ source }: { source: ReportSource }) {
  return (
    <span className="chip border border-white/[0.08] bg-white/[0.04] text-white/55">
      <span className={`h-1.5 w-1.5 rounded-full ${SOURCE_DOT[source]}`} />
      {sourceLabel(source)}
    </span>
  );
}

export function SlaBadge({ label }: { label: PriorityLabel }) {
  const tone =
    label === "Urgent" ? "text-red-300" : label === "High" ? "text-orange-300" : "text-white/55";
  return (
    <span className={`chip border border-white/[0.08] bg-white/[0.04] ${tone}`}>
      <ClockIcon className="h-3 w-3" />
      {slaFor(label).text}
    </span>
  );
}

export function DeptBadge({ department }: { department: string }) {
  return (
    <span className="chip border border-white/[0.08] bg-white/[0.04] text-white/55">
      <ShieldIcon className="h-3 w-3 text-white/45" />
      {department}
    </span>
  );
}

export function SeverityBar({ value }: { value: number }) {
  const color =
    value >= 85 ? "bg-red-500" : value >= 65 ? "bg-orange-500" : value >= 40 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-sm font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-white/45">{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${accent ?? "text-white"}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-white/45">{hint}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-400">{eyebrow}</div>
      )}
      <h2 className="mt-0.5 text-xl font-bold text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-white/55">{subtitle}</p>}
    </div>
  );
}

// A compact top bar used at the top of app screens.
export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-app-950/90 px-4 py-3 backdrop-blur">
      <div>
        <div className="text-base font-bold text-white">{title}</div>
        {subtitle && <div className="text-[11px] text-white/50">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
