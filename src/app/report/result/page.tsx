"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { AnalysisCard } from "@/components/AnalysisCard";
import { speak } from "@/lib/voice";
import { CheckIcon, MapPinIcon, ChartIcon, ArrowIcon, SpeakerIcon } from "@/components/Icons";

function ResultInner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const { getReport, ready, voicePresetId } = useStore();
  const report = getReport(id);
  const announced = useRef(false);

  // ELEVENLABS: voice confirmation after analysis (browser TTS in MVP).
  useEffect(() => {
    if (report && !announced.current) {
      announced.current = true;
      const line = `Report received. ${report.category} near ${report.locationName}. Priority ${report.analysis.priority}, severity ${report.analysis.severity} out of 100.`;
      const t = setTimeout(() => speak(line, voicePresetId), 600);
      return () => clearTimeout(t);
    }
  }, [report, voicePresetId]);

  if (!ready) return <Center>Loading…</Center>;
  if (!report)
    return (
      <Center>
        <p className="text-white/60">That report could not be found.</p>
        <Link href="/report" className="btn-primary mt-4">Report a hazard</Link>
      </Center>
    );

  const voiceLine = `Report received. ${report.category} near ${report.locationName}. Priority ${report.analysis.priority}, severity ${report.analysis.severity} out of 100.`;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 animate-fade-up">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
          <CheckIcon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="font-semibold text-emerald-200">Analyzed &amp; added near you</div>
          <p className="text-[12px] text-emerald-300/80">Now on the live map, feed, and facilities queue.</p>
        </div>
        <button onClick={() => speak(voiceLine, voicePresetId)} className="btn-ghost shrink-0 border-emerald-500/30 text-emerald-200">
          <SpeakerIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="animate-fade-up"><AnalysisCard report={report} /></div>

      <div className="grid gap-3">
        <div className="card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Voice transcript</div>
          {report.analysis.transcript ? (
            <p className="mt-1.5 text-sm italic text-white/80">&ldquo;{report.analysis.transcript}&rdquo;</p>
          ) : (
            <p className="mt-1.5 text-sm text-white/40">No voice note attached.</p>
          )}
        </div>
        <div className="card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Generated follow-up</div>
          <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-white/75">
            {report.analysis.followUpText}
          </pre>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link href={`/reports/${report.id}`} className="btn-primary w-full">
          Open report details <ArrowIcon className="h-4 w-4" />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/" className="btn-ghost"><MapPinIcon className="h-4 w-4" /> Map</Link>
          <Link href="/dashboard" className="btn-ghost"><ChartIcon className="h-4 w-4" /> Facilities</Link>
        </div>
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center px-4 py-24 text-center text-white/50">{children}</div>;
}

export default function ResultPage() {
  return (
    <Suspense fallback={<Center>Loading analysis…</Center>}>
      <ResultInner />
    </Suspense>
  );
}
