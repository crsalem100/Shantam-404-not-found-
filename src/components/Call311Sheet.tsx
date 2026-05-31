"use client";

// Minimal 311 helper — a script you can read or copy, plus a tap-to-call
// link. Keeps the "FixFirst organizes, 311 dispatches" framing simple.

import { useState } from "react";
import { useStore } from "@/lib/store";
import { generate311Script, CALL_311_DISCLAIMER } from "@/lib/call311";
import { speak } from "@/lib/voice";
import type { Report } from "@/lib/types";
import { CloseIcon, SpeakerIcon, CheckIcon } from "./Icons";

export function Call311Sheet({ report, onClose }: { report: Report; onClose: () => void }) {
  const { voicePresetId } = useStore();
  const script = generate311Script(report);
  const [copied, setCopied] = useState(false);

  function copy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="animate-sheet w-full rounded-t-3xl border-t border-white/10 bg-app-900 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Call 311</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="rounded-2xl bg-app-850 p-3.5 text-[13px] leading-relaxed text-white/85">
          {script}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <a href="tel:311" className="btn-primary py-2.5 text-sm">Call 311</a>
          <button onClick={() => speak(script, voicePresetId)} className="btn-ghost py-2.5 text-sm">
            <SpeakerIcon className="h-4 w-4" /> Read
          </button>
          <button onClick={copy} className="btn-ghost py-2.5 text-sm">
            {copied ? <><CheckIcon className="h-4 w-4 text-emerald-300" /> Copied</> : "Copy"}
          </button>
        </div>

        <p className="mt-3 text-[11px] leading-snug text-white/40">{CALL_311_DISCLAIMER}</p>
      </div>
    </div>
  );
}
