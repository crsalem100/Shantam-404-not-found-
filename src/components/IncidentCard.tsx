"use client";

import Link from "next/link";
import type { GeoPoint, Report } from "@/lib/types";
import { priorityForReport, PRIORITY_STYLE } from "@/lib/priority";
import { scoreReport, juryTally } from "@/lib/jury";
import { CategoryIcon, MapPinIcon, EyeIcon, ClockIcon, VideoIcon, MicIcon, StarIcon, ShieldIcon } from "./Icons";
import { PriorityBadge, StatusBadge, SourceBadge, DeptBadge, SlaBadge } from "./ui";
import { timeAgo } from "@/lib/format";
import { distanceKm, formatDistance } from "@/lib/geo";

export function IncidentCard({
  report,
  userPoint,
  compact,
}: {
  report: Report;
  userPoint?: GeoPoint | null;
  compact?: boolean;
}) {
  const p = priorityForReport(report);
  const style = PRIORITY_STYLE[p.label];
  const rs = scoreReport(report);
  const verified = juryTally(report).confirm;
  const Icon = CategoryIcon[report.category];
  const dist =
    userPoint && report.geo ? formatDistance(distanceKm(userPoint, report.geo)) : null;

  return (
    <Link
      href={`/reports/${report.id}`}
      className="card block overflow-hidden transition active:scale-[0.99]"
    >
      <div className="flex">
        {/* priority spine */}
        <span className="w-1 shrink-0" style={{ backgroundColor: style.hex }} />
        <div className="flex-1 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-white"
                style={{ backgroundColor: style.hex }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-wide text-white/40">{report.caseId}</div>
                <div className="truncate font-semibold text-white">{report.category}</div>
                <div className="flex items-center gap-1 truncate text-[11px] text-white/50">
                  <MapPinIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{report.locationName}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold leading-none tabular-nums text-white">{p.total}</div>
              <div className="text-[9px] uppercase tracking-wide text-white/40">priority</div>
            </div>
          </div>

          {!compact && (
            <p className="mt-2 line-clamp-2 text-[13px] text-white/65">{report.description}</p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <PriorityBadge label={p.label} size="sm" />
            <StatusBadge status={report.status} />
            <span className="chip border border-white/[0.08] bg-white/[0.04] text-white/60">
              <StarIcon className={`h-3 w-3 ${rs.score >= 60 ? "text-emerald-300" : "text-white/45"}`} />
              {rs.score}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <SourceBadge source={report.source} />
            <DeptBadge department={report.department} />
          </div>

          <div className="mt-1.5">
            <SlaBadge label={p.label} />
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-white/8 pt-2 text-[11px] text-white/45">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-white/70">Severity {report.analysis.severity}</span>
              <span className="flex items-center gap-1"><EyeIcon className="h-3 w-3" />{report.watchers}</span>
              <span className="flex items-center gap-1"><ShieldIcon className="h-3 w-3" />{verified} verified</span>
              {report.videoDataUrl && <VideoIcon className="h-3 w-3" />}
              {report.hasVoiceNote && <MicIcon className="h-3 w-3" />}
            </div>
            <span className="flex items-center gap-1">
              {dist ? dist : <><ClockIcon className="h-3 w-3" />{timeAgo(report.updatedAt)}</>}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
