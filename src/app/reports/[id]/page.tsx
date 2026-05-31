"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { priorityForReport } from "@/lib/priority";
import { scoreReport, juryTally } from "@/lib/jury";
import { slaFor } from "@/lib/routing";
import { AnalysisCard } from "@/components/AnalysisCard";
import { AIReasoning } from "@/components/AIReasoning";
import { FacilitiesReportModal } from "@/components/FacilitiesReportModal";
import { AskFriendsToVerify } from "@/components/AskFriendsToVerify";
import { JuryPanel } from "@/components/JuryPanel";
import { FixFirstIntelligence } from "@/components/FixFirstIntelligence";
import { PriorityBreakdownCard } from "@/components/PriorityBreakdownCard";
import { ScoringModal } from "@/components/ScoringModal";
import { ReportTimeline } from "@/components/ReportTimeline";
import { StatusBadge, PriorityBadge, ReportScoreBadge, SourceBadge } from "@/components/ui";
import {
  CategoryIcon, CameraIcon, SpeakerIcon, MicIcon, CheckIcon, MapPinIcon, ClockIcon, EyeIcon, ArrowIcon,
  CrosshairIcon, NavigateIcon, ShareIcon, UsersIcon, ShieldIcon,
} from "@/components/Icons";
import { speak, accessibilityAlertScript } from "@/lib/voice";
import { timeAgo, formatDate } from "@/lib/format";
import type { CommunityUpdateType } from "@/lib/types";

const UPDATE_OPTIONS: { label: string; type: CommunityUpdateType; tone: string }[] = [
  { label: "I saw this", type: "I saw this", tone: "border-white/15 text-white/80" },
  { label: "Still broken", type: "Still broken", tone: "border-white/15 text-white/80" },
  { label: "Worse now", type: "Worse", tone: "border-red-500/40 text-red-300" },
  { label: "Partially fixed", type: "Partially fixed", tone: "border-yellow-500/40 text-yellow-300" },
  { label: "Fixed", type: "Fixed", tone: "border-emerald-500/40 text-emerald-300" },
  { label: "Duplicate of another report", type: "Duplicate", tone: "border-white/15 text-white/55" },
];

export default function ReportDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const { getReport, ready, updateStatus, addCommunityUpdate, voicePresetId, isAuthed } = useStore();
  const report = getReport(id);
  const [showModal, setShowModal] = useState(false);
  const [showAsk, setShowAsk] = useState(false);
  const [showScoring, setShowScoring] = useState(false);
  const [followUpPhoto, setFollowUpPhoto] = useState<string | null>(null);

  // Auto-open the generated report when arriving from the dashboard's
  // "Open & generate report" action (/reports/<id>?report=1).
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("report") === "1") {
      setShowModal(true);
    }
  }, []);

  if (!ready) return <Center>Loading…</Center>;
  if (!report)
    return (
      <Center>
        <p className="text-white/60">Report not found.</p>
        <Link href="/" className="btn-primary mt-4">Back to map</Link>
      </Center>
    );

  const p = priorityForReport(report);
  const rs = scoreReport(report);
  const tally = juryTally(report);
  const sla = slaFor(p.label);
  const Icon = CategoryIcon[report.category];
  const recentWorse = report.community.slice(0, 3).some((u) => u.type === "Worse");

  function onFollowUpPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFollowUpPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="pb-4">
      {/* hero media */}
      <div className="relative aspect-[4/3] w-full bg-app-black">
        {report.videoDataUrl ? (
          <video src={report.videoDataUrl} controls playsInline className="h-full w-full object-cover" />
        ) : report.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={report.photoDataUrl} alt={report.category} className="h-full w-full object-cover" />
        ) : (
          <PhotoPlaceholder category={report.category} location={report.locationName} />
        )}
        <Link href="/" className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur">
          <ArrowIcon className="h-5 w-5 rotate-180" />
        </Link>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <span className="chip border border-white/20 bg-black/50 text-white backdrop-blur">
            <EyeIcon className="h-3.5 w-3.5" /> {report.watchers}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-app-black to-transparent p-3 pt-10">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white"><Icon className="h-5 w-5" /></span>
            <div className="flex-1">
              <div className="text-lg font-bold leading-tight text-white">{report.category}</div>
              <div className="flex items-center gap-1 text-[11px] text-white/60">
                <MapPinIcon className="h-3 w-3" /> {report.locationName}
              </div>
            </div>
            <PriorityBadge label={p.label} />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <ReportScoreBadge score={rs} />
          <span className="chip border border-white/[0.08] bg-white/[0.04] text-white/55"><ClockIcon className="h-3.5 w-3.5" /> {timeAgo(report.updatedAt)}</span>
          {report.hasGps && (
            <span className="chip border border-white/[0.08] bg-white/[0.04] text-white/55">
              <CrosshairIcon className="h-3.5 w-3.5 text-live" /> GPS
            </span>
          )}
        </div>

        {/* case details — civic metadata */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Case details</h3>
            <SourceBadge source={report.source} />
          </div>
          <p className="mt-0.5 text-[11px] text-white/45">Official case record · routed for repair.</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Meta label="Case ID" value={report.caseId} mono />
            <Meta label="Status" value={report.status} />
            <Meta
              label="Routed to"
              value={
                <span className="inline-flex items-center gap-1">
                  <ShieldIcon className="h-3.5 w-3.5 text-brand-400" /> {report.department}
                </span>
              }
            />
            <Meta
              label="Recommended SLA"
              value={
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5 text-brand-400" /> {sla.text}
                </span>
              }
            />
            <Meta label="Last updated" value={timeAgo(report.updatedAt)} />
            <Meta label="Data timestamp" value={formatDate(report.createdAt)} />
            <Meta label="Duplicate cluster" value={`${report.duplicates} related reports grouped into 1 case`} />
            <Meta label="Verifications" value={`${tally.confirm}`} />
          </dl>
        </div>

        {report.duplicates >= 2 && (
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] text-white/75">
            <UsersIcon className="h-4 w-4 shrink-0 text-brand-400" />
            <span>
              <span className="font-semibold text-white">{report.duplicates} related reports</span> grouped into 1 case — duplicate cluster detected nearby.
            </span>
          </div>
        )}

        {/* Fix First Intelligence — why the engine ranked this */}
        <FixFirstIntelligence report={report} />

        {report.spotDetails && (
          <p className="text-sm text-white/65"><span className="font-medium text-white">Spot:</span> {report.spotDetails}</p>
        )}

        {/* follow-up photo */}
        {followUpPhoto && (
          <div className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={followUpPhoto} alt="Follow-up" className="aspect-video w-full object-cover" />
            <div className="p-2.5 text-[11px] text-white/45">Follow-up photo · just now</div>
          </div>
        )}

        {/* voice */}
        <div className="card p-4">
          <div className="mb-2 flex items-center gap-2">
            <MicIcon className="h-4 w-4 text-brand-400" />
            <span className="font-semibold text-white">Voice note</span>
          </div>
          {report.audioDataUrl ? (
            <audio controls src={report.audioDataUrl} className="w-full" />
          ) : report.hasVoiceNote ? (
            <div className="rounded-lg bg-app-800 p-2.5 text-sm text-white/50">Voice note on file</div>
          ) : (
            <div className="rounded-lg bg-app-800 p-2.5 text-sm text-white/40">No voice note attached.</div>
          )}
          <div className="mt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Transcript</div>
            <p className="mt-1 text-sm italic text-white/75">
              {report.analysis.transcript ? `"${report.analysis.transcript}"` : "—"}
            </p>
          </div>
        </div>

        {/* AI analysis */}
        <AnalysisCard report={report} />

        {/* AI reasoning — why it ranked this way */}
        <AIReasoning report={report} />

        {/* community verification */}
        <JuryPanel report={report} />

        {/* transparent 6-factor priority breakdown */}
        <PriorityBreakdownCard report={report} onHowItWorks={() => setShowScoring(true)} />

        {/* report lifecycle timeline */}
        <ReportTimeline report={report} />

        {/* community verification workflow */}
        <div className="card p-4">
          <h3 className="font-semibold text-white">Community verification</h3>
          <p className="mt-0.5 text-[11px] text-white/45">Confirm status — verifications re-rank this case automatically.</p>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] text-white/75">
            <UsersIcon className="h-4 w-4 shrink-0 text-brand-400" />
            <span>
              <span className="font-semibold text-white">{tally.confirm} verification{tally.confirm === 1 ? "" : "s"}</span>{" "}
              confirm this {report.category.toLowerCase()} is still blocked.
            </span>
          </div>

          {recentWorse && (
            <div className="mt-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] font-medium text-red-300">
              Users marked this issue worse recently.
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            {UPDATE_OPTIONS.map((o) => (
              <button
                key={o.label}
                onClick={() => addCommunityUpdate(report.id, { type: o.type, at: new Date().toISOString() })}
                className={`rounded-xl border bg-app-850 px-3 py-2 text-sm font-medium transition active:scale-95 ${o.tone}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            {report.community.length === 0 && <p className="text-[11px] text-white/35">No verifications yet.</p>}
            {report.community.slice(0, 6).map((u, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-app-800 px-3 py-2 text-sm">
                <span className="font-medium text-white/80">
                  {u.type}
                  {u.by && <span className="font-normal text-white/45"> · {u.by}</span>}
                </span>
                <span className="text-[11px] text-white/40">{timeAgo(u.at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* actions */}
        <div className="space-y-2">
          <button onClick={() => setShowModal(true)} className="btn-primary w-full">Generate facilities report</button>
          <button
            onClick={() => (isAuthed ? setShowAsk(true) : alert("Sign in to ask friends to verify."))}
            className="btn-ghost w-full"
          >
            <UsersIcon className="h-4 w-4" /> Ask friends to verify
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => updateStatus(report.id, "Fixed")} disabled={report.status === "Fixed"} className="btn-ghost">
              <CheckIcon className="h-4 w-4" /> {report.status === "Fixed" ? "Fixed" : "Mark fixed"}
            </button>
            <label className="btn-ghost cursor-pointer">
              <CameraIcon className="h-4 w-4" /> Follow-up
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFollowUpPhoto} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={
                report.geo
                  ? `https://www.google.com/maps/dir/?api=1&destination=${report.geo.lat},${report.geo.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.locationName)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <NavigateIcon className="h-4 w-4" /> Directions
            </a>
            <button onClick={() => shareReport(report.category, report.locationName)} className="btn-ghost">
              <ShareIcon className="h-4 w-4" /> Share
            </button>
          </div>
          <button
            onClick={() => speak(accessibilityAlertScript(report.category, report.locationName), voicePresetId)}
            className="btn-ghost w-full"
          >
            <SpeakerIcon className="h-4 w-4" /> Play accessibility alert
          </button>
          <div className="text-center text-[11px] text-white/40">Submitted {formatDate(report.createdAt)}</div>
        </div>
      </div>

      {showModal && <FacilitiesReportModal report={report} onClose={() => setShowModal(false)} />}
      {showAsk && <AskFriendsToVerify report={report} onClose={() => setShowAsk(false)} />}
      {showScoring && <ScoringModal onClose={() => setShowScoring(false)} />}
    </div>
  );
}

function shareReport(category: string, location: string) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const data = {
    title: `FixFirst — ${category}`,
    text: `${category} reported at ${location}. View on FixFirst:`,
    url,
  };
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share(data).catch(() => {});
  } else if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(url);
  }
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center px-4 py-24 text-center">{children}</div>;
}
function Meta({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wide text-white/40">{label}</dt>
      <dd className={`mt-0.5 text-sm font-medium text-white ${mono ? "font-mono tabular-nums" : ""}`}>{value}</dd>
    </div>
  );
}
function PhotoPlaceholder({ category, location }: { category: string; location: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-app-800 to-app-950 text-white">
      <CameraIcon className="h-10 w-10 opacity-40" />
      <div className="mt-2 text-sm font-medium opacity-80">{category}</div>
      <div className="text-xs opacity-50">{location}</div>
    </div>
  );
}
