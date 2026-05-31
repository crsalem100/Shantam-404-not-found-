"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore, makeReport } from "@/lib/store";
import { analyzeReport } from "@/lib/ai";
import { useLiveLocation } from "@/lib/geo";
import { VISIBILITY_OPTIONS } from "@/lib/social";
import { priorityForReport } from "@/lib/priority";
import { pointsForSubmission } from "@/lib/reputation";
import type { HazardCategory, Report, ReportVisibility } from "@/lib/types";
import {
  CameraIcon, VideoIcon, SparkIcon, MapPinIcon, CategoryIcon, CrosshairIcon, CloseIcon,
} from "@/components/Icons";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { CelebrationPopup } from "@/components/CelebrationPopup";

const CATEGORIES: HazardCategory[] = [
  "Pothole", "Cracked sidewalk", "Blocked wheelchair ramp", "Broken light",
  "Unsafe crossing", "Overflowing trash", "Blocked bike lane", "Other",
];

export default function ReportPage() {
  const router = useRouter();
  const { addReport, isAuthed, logout } = useStore();
  const loc = useLiveLocation(true);

  const [category, setCategory] = useState<HazardCategory>("Cracked sidewalk");
  const [visibility, setVisibility] = useState<ReportVisibility>("public");
  const [locationName, setLocationName] = useState("");
  const [spotDetails, setSpotDetails] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [hasVoice, setHasVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [analyzing, setAnalyzing] = useState(false);
  const [submitted, setSubmitted] = useState<Report | null>(null);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }
  function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setVideoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setAnalyzing(true);
    // GEMINI: analyze photo + video + transcript and merge here.
    const analysis = analyzeReport({
      category,
      locationName,
      spotDetails,
      description,
      hasPhoto: !!photoUrl,
      hasVoiceNote: hasVoice,
    });
    const report = {
      ...makeReport({
        category,
        locationName: locationName || "Dropped pin",
        spotDetails,
        description: description || "No additional description provided.",
        photoDataUrl: photoUrl,
        videoDataUrl: videoUrl,
        audioDataUrl: audioUrl,
        hasVoiceNote: hasVoice,
        analysis,
        geo: loc.point ?? undefined, // attach real GPS if available
      }),
      visibility,
    };
    addReport(report); // SNOWFLAKE insert · BACKBOARD remember
    // Celebrate the submission (priority count-up + routing + points),
    // then continue to the full analysis on CTA.
    setTimeout(() => {
      setAnalyzing(false);
      setSubmitted(report);
    }, 1100);
  }

  // Reporting requires an account (guests can browse the map).
  if (!isAuthed) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-300">
          <SparkIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-white">Sign in to report a hazard</h1>
        <p className="mt-2 max-w-xs text-sm text-white/60">
          Create an account to track your reports, earn civic impact points, verify hazards with
          friends, and unlock rewards.
        </p>
        <button onClick={logout} className="btn-primary mt-5">Create free account</button>
        <Link href="/" className="mt-2 text-sm text-white/50">Back to map</Link>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-app-950/90 px-4 py-3 backdrop-blur">
        <div>
          <div className="text-base font-bold text-white">Report a hazard</div>
          <div className="text-[11px] text-white/50">Show it · say it · we prioritize it</div>
        </div>
        <button onClick={() => router.push("/")} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4 p-4">
        {/* GPS status */}
        <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${
          loc.point ? "border-live/30 bg-live/10 text-live" : "border-white/10 bg-app-850 text-white/60"
        }`}>
          <span className="flex items-center gap-2">
            <CrosshairIcon className="h-4 w-4" />
            {loc.point
              ? `GPS attached · ${loc.point.lat.toFixed(4)}, ${loc.point.lng.toFixed(4)}`
              : loc.status === "denied" ? "Location denied — add it manually below" : "Getting your location…"}
          </span>
          {!loc.point && (
            <button type="button" onClick={loc.start} className="text-xs font-semibold underline">
              Retry
            </button>
          )}
        </div>

        {/* media: photo + video */}
        <div className="grid grid-cols-2 gap-3">
          <MediaTile label="Photo" filled={!!photoUrl} onClear={() => setPhotoUrl(undefined)}>
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Empty icon={<CameraIcon className="h-7 w-7" />} text="Add / take photo" />
            )}
            <input type="file" accept="image/*" capture="environment" className="absolute inset-0 cursor-pointer opacity-0" onChange={onPhoto} />
          </MediaTile>

          <MediaTile label="Video" filled={!!videoUrl} onClear={() => setVideoUrl(undefined)}>
            {videoUrl ? (
              <video src={videoUrl} className="h-full w-full object-cover" muted playsInline />
            ) : (
              <Empty icon={<VideoIcon className="h-7 w-7" />} text="Add / take video" />
            )}
            <input type="file" accept="video/*" capture="environment" className="absolute inset-0 cursor-pointer opacity-0" onChange={onVideo} />
          </MediaTile>
        </div>

        {/* voice */}
        <div>
          <label className="field-label">Voice note — the human impact</label>
          <VoiceRecorder onAudio={(has, url) => { setHasVoice(has); setAudioUrl(url); }} />
        </div>

        {/* category */}
        <div>
          <label className="field-label">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = CategoryIcon[c];
              const active = c === category;
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center text-[10px] font-medium leading-tight transition ${
                    active ? "border-brand-500 bg-brand-500/15 text-brand-300" : "border-white/10 bg-app-850 text-white/65"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {c.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* location */}
        <div className="space-y-3">
          <div>
            <label className="field-label">Location name</label>
            <div className="relative">
              <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input className="field-input pl-9" placeholder="e.g. Market St & 5th" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="field-label">Exact spot / details</label>
            <input className="field-input" placeholder="e.g. South ramp by the doors" value={spotDetails} onChange={(e) => setSpotDetails(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Description <span className="font-normal text-white/35">(optional)</span></label>
            <textarea className="field-input min-h-[84px] resize-y" placeholder="Who does it affect? What happened?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        {/* visibility / privacy */}
        <div>
          <label className="field-label">Report visibility</label>
          <div className="grid grid-cols-2 gap-2">
            {VISIBILITY_OPTIONS.map((o) => {
              const active = o.value === visibility;
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => setVisibility(o.value)}
                  className={`rounded-xl border p-2.5 text-left transition ${
                    active ? "border-brand-500 bg-brand-500/10" : "border-white/10 bg-app-850"
                  }`}
                >
                  <div className="text-[13px] font-medium text-white">{o.label}</div>
                  <div className="text-[10px] leading-snug text-white/45">{o.note}</div>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[10px] text-white/35">
            Exact location is never shared with friends by default.
          </p>
        </div>

        <button type="submit" disabled={analyzing} className="btn-primary w-full py-3.5 text-base">
          {analyzing ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Analyzing…</>
          ) : (
            <><SparkIcon className="h-5 w-5" /> Analyze report</>
          )}
        </button>
      </form>

      {submitted && (
        <CelebrationPopup
          kind="report"
          eyebrow="Report submitted"
          title={`${submitted.category} logged`}
          subtitle={`Scored by the repair-priority engine and routed for repair.`}
          scoreTo={priorityForReport(submitted).total}
          rows={[
            { label: "Routed to", value: submitted.department },
            { label: "Case ID", value: submitted.caseId },
            {
              label: "Priority",
              value: priorityForReport(submitted).label,
            },
          ]}
          points={pointsForSubmission(submitted)}
          ctaLabel="View full analysis"
          onCta={() => router.push(`/report/result?id=${submitted.id}`)}
          onClose={() => router.push(`/report/result?id=${submitted.id}`)}
        />
      )}
    </div>
  );
}

function MediaTile({
  label, filled, children, onClear,
}: {
  label: string; filled: boolean; children: React.ReactNode; onClear: () => void;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-xl border-2 border-dashed border-white/15 bg-app-850">
        {children}
        {filled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-1.5 top-1.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-white/40">
      {icon}
      <span className="text-[11px] font-medium">{text}</span>
    </div>
  );
}
