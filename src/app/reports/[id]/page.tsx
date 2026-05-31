"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { priorityForReport, whyFirstReasons } from "@/lib/priority";
import { juryTally } from "@/lib/jury";
import { slaFor } from "@/lib/routing";
import { routeDisruptionFor } from "@/lib/civic";
import { AnalysisCard } from "@/components/AnalysisCard";
import { FacilitiesReportModal } from "@/components/FacilitiesReportModal";
import { AskFriendsToVerify } from "@/components/AskFriendsToVerify";
import { JuryPanel } from "@/components/JuryPanel";
import { PriorityBreakdownCard } from "@/components/PriorityBreakdownCard";
import { ScoringModal } from "@/components/ScoringModal";
import { ReportTimeline } from "@/components/ReportTimeline";
import { Call311Sheet } from "@/components/Call311Sheet";
import { StatusBadge, PriorityBadge, SourceBadge } from "@/components/ui";
import {
  CategoryIcon, CameraIcon, SpeakerIcon, CheckIcon, MapPinIcon, ClockIcon, ArrowIcon,
  CrosshairIcon, NavigateIcon, ShareIcon, UsersIcon, CloseIcon,
} from "@/components/Icons";
import { speak, accessibilityAlertScript } from "@/lib/voice";
import { timeAgo, formatDate } from "@/lib/format";
import type { CommunityUpdateType, Report } from "@/lib/types";

const UPDATE_OPTIONS: { label: string; type: CommunityUpdateType; tone: string }[] = [
  { label: "I saw this", type: "I saw this", tone: "border-white/15 text-white/80" },
  { label: "Still broken", type: "Still broken", tone: "border-white/15 text-white/80" },
  { label: "Worse now", type: "Worse", tone: "border-red-500/40 text-red-300" },
  { label: "Fixed", type: "Fixed", tone: "border-emerald-500/40 text-emerald-300" },
];

export default function ReportDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const { getReport, ready, updateStatus, addCommunityUpdate, voicePresetId, isAuthed } = useStore();
  const report = getReport(id);
  const [showModal, setShowModal] = useState(false);
  const [showAsk, setShowAsk] = useState(false);
  const [showScoring, setShowScoring] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [followUpPhoto, setFollowUpPhoto] = useState<string | null>(null);

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
  const tally = juryTally(report);
  const sla = slaFor(p.label);
  const Icon = CategoryIcon[report.category];

  function onFollowUpPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFollowUpPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="pb-4">
      {/* hero */}
      <div className="relative aspect-[5/3] w-full bg-app-black">
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-app-black/95 to-transparent p-4 pt-12">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xl font-bold leading-tight text-white">{report.category}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[12px] text-white/65">
                <MapPinIcon className="h-3.5 w-3.5" /> {report.locationName}
              </div>
            </div>
            <PriorityBadge label={p.label} />
          </div>
        </div>
      </div>

      <div className="space-y-3.5 p-4">
        {/* chips */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <SourceBadge source={report.source} />
          {tally.confirm > 0 && (
            <span className="chip bg-white/[0.04] text-white/65">
              <CheckIcon className="h-3 w-3 text-emerald-300" /> Verified by {tally.confirm}
            </span>
          )}
          {report.hasGps && (
            <span className="chip bg-white/[0.04] text-white/55">
              <CrosshairIcon className="h-3 w-3 text-live" /> GPS
            </span>
          )}
        </div>

        {/* one-line impact */}
        <p className="text-[15px] leading-snug text-white/85">{routeDisruptionFor(report)}.</p>

        {/* quick facts */}
        <div className="card grid grid-cols-2 gap-x-4 gap-y-3 p-4">
          <Fact label="Priority" value={`${p.total} · ${p.label}`} />
          <Fact label="SLA" value={sla.text} />
          <Fact label="Department" value={report.department} />
          <Fact label="Related" value={`${report.duplicates} reports`} />
          <Fact label="Case ID" value={report.caseId} mono />
          <Fact label="Updated" value={timeAgo(report.updatedAt)} />
        </div>

        {/* proof of fix */}
        {report.proofOfFix && <ProofOfFix report={report} />}

        {/* why it matters */}
        <div className="card p-4">
          <h3 className="font-semibold text-white">Why it matters</h3>
          <ul className="mt-2.5 grid gap-1.5">
            {whyFirstReasons(report).map((r) => (
              <li key={r} className="flex items-start gap-2 text-[13px] text-white/80">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" /> {r}
              </li>
            ))}
          </ul>
        </div>

        {/* priority breakdown */}
        <PriorityBreakdownCard report={report} onHowItWorks={() => setShowScoring(true)} />

        {/* primary actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => (isAuthed ? setShowVerify(true) : alert("Sign in to verify reports."))}
            className="btn-primary"
          >
            <CheckIcon className="h-4 w-4" /> Verify
          </button>
          <button onClick={() => setShowModal(true)} className="btn-ghost">Generate report</button>
          <button onClick={() => setShowCall(true)} className="btn-ghost">Call 311</button>
          <button onClick={() => shareReport(report.category, report.locationName)} className="btn-ghost">
            <ShareIcon className="h-4 w-4" /> Share
          </button>
        </div>

        {/* details toggle */}
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 py-1.5 text-[13px] font-semibold text-white/55 hover:text-white/80"
        >
          {showDetails ? "Hide details" : "View details"}
          <ArrowIcon className={`h-3.5 w-3.5 transition-transform ${showDetails ? "-rotate-90" : "rotate-90"}`} />
        </button>

        {showDetails && (
          <div className="space-y-3.5">
            {/* voice */}
            {(report.hasVoiceNote || report.analysis.transcript) && (
              <div className="card p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Voice note</div>
                {report.audioDataUrl ? (
                  <audio controls src={report.audioDataUrl} className="mt-2 w-full" />
                ) : null}
                {report.analysis.transcript && (
                  <p className="mt-2 text-sm italic text-white/75">&ldquo;{report.analysis.transcript}&rdquo;</p>
                )}
              </div>
            )}

            {followUpPhoto && (
              <div className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={followUpPhoto} alt="Follow-up" className="aspect-video w-full object-cover" />
                <div className="p-2.5 text-[11px] text-white/45">Follow-up · just now</div>
              </div>
            )}

            <AnalysisCard report={report} />
            <JuryPanel report={report} />
            <ReportTimeline report={report} />

            {/* community history */}
            {report.community.length > 0 && (
              <div className="card p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Recent updates</div>
                <div className="mt-2 space-y-1.5">
                  {report.community.slice(0, 6).map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white/80">
                        {u.type}
                        {u.by && <span className="text-white/45"> · {u.by}</span>}
                      </span>
                      <span className="text-[11px] text-white/40">{timeAgo(u.at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* secondary actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => (isAuthed ? setShowAsk(true) : alert("Sign in to ask friends to verify."))}
                className="btn-ghost"
              >
                <UsersIcon className="h-4 w-4" /> Ask friends
              </button>
              <button onClick={() => updateStatus(report.id, "Fixed")} disabled={report.status === "Fixed"} className="btn-ghost">
                <CheckIcon className="h-4 w-4" /> {report.status === "Fixed" ? "Fixed" : "Mark fixed"}
              </button>
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
              <label className="btn-ghost cursor-pointer">
                <CameraIcon className="h-4 w-4" /> Follow-up
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFollowUpPhoto} />
              </label>
            </div>
            <button
              onClick={() => speak(accessibilityAlertScript(report.category, report.locationName), voicePresetId)}
              className="btn-ghost w-full"
            >
              <SpeakerIcon className="h-4 w-4" /> Play accessibility alert
            </button>
            <div className="text-center text-[11px] text-white/40">Submitted {formatDate(report.createdAt)}</div>
          </div>
        )}
      </div>

      {showModal && <FacilitiesReportModal report={report} onClose={() => setShowModal(false)} />}
      {showAsk && <AskFriendsToVerify report={report} onClose={() => setShowAsk(false)} />}
      {showScoring && <ScoringModal onClose={() => setShowScoring(false)} />}
      {showCall && <Call311Sheet report={report} onClose={() => setShowCall(false)} />}
      {showVerify && (
        <VerifySheet
          report={report}
          onClose={() => setShowVerify(false)}
          onUpdate={(type) => {
            addCommunityUpdate(report.id, { type, at: new Date().toISOString() });
            setShowVerify(false);
          }}
        />
      )}
    </div>
  );
}

function VerifySheet({
  report,
  onClose,
  onUpdate,
}: {
  report: Report;
  onClose: () => void;
  onUpdate: (type: CommunityUpdateType) => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div className="animate-sheet w-full rounded-t-3xl border-t border-white/10 bg-app-900 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Verify this report</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="text-[12px] text-white/50">Your update re-ranks the case automatically.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {UPDATE_OPTIONS.map((o) => (
            <button
              key={o.label}
              onClick={() => onUpdate(o.type)}
              className={`rounded-xl border bg-app-850 px-3 py-2.5 text-sm font-medium transition active:scale-95 ${o.tone}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProofOfFix({ report }: { report: Report }) {
  const pf = report.proofOfFix!;
  return (
    <div className="card overflow-hidden border-emerald-500/25">
      <div className="flex items-center gap-2 border-b border-white/10 bg-emerald-500/10 px-4 py-2.5">
        <CheckIcon className="h-4 w-4 text-emerald-300" />
        <span className="font-semibold text-white">Proof of fix</span>
        <span className="ml-auto text-[11px] text-emerald-300">{pf.confidence}% confidence</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-white/[0.06] text-[12px]">
        <div className="bg-app-900 p-3">
          <div className="text-[10px] uppercase tracking-wide text-white/40">Before</div>
          <p className="mt-1 text-white/70">{report.description}</p>
        </div>
        <div className="bg-app-900 p-3">
          <div className="text-[10px] uppercase tracking-wide text-emerald-300/70">After</div>
          <p className="mt-1 text-white/70">{pf.afterNote}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 p-4">
        <Fact label="Fixed by" value={pf.fixedBy} />
        <Fact label="Time to fix" value={`${pf.timeToFixDays} days`} />
        <Fact label="Verified by" value={`${pf.verifiedBy.length} community`} />
        <Fact label="Reporter earned" value={`+${pf.pointsAwarded} pts`} />
      </div>
      <p className="px-4 pb-4 text-[12px] text-white/60">{pf.impact}</p>
    </div>
  );
}

function shareReport(category: string, location: string) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const data = { title: `FixFirst — ${category}`, text: `${category} at ${location}.`, url };
  if (typeof navigator !== "undefined" && navigator.share) navigator.share(data).catch(() => {});
  else if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(url);
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center px-4 py-24 text-center">{children}</div>;
}

function Fact({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wide text-white/40">{label}</dt>
      <dd className={`mt-0.5 text-[13px] font-medium text-white ${mono ? "font-mono tabular-nums" : ""}`}>{value}</dd>
    </div>
  );
}

function PhotoPlaceholder({ category, location }: { category: string; location: string }) {
  const Icon = CategoryIcon[category as keyof typeof CategoryIcon] ?? CategoryIcon.Other;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-app-900 text-white/45">
      <Icon className="h-9 w-9" />
      <div className="mt-2 text-sm font-medium text-white/70">{category}</div>
      <div className="text-xs text-white/40">{location}</div>
    </div>
  );
}
