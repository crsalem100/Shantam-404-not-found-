"use client";

import { useStore } from "@/lib/store";
import { VOICE_PRESETS, speak } from "@/lib/voice";
import { SpeakerIcon, PlayIcon } from "./Icons";

// Pick the persona used for all spoken output (briefings, confirmations,
// accessibility alerts). MVP uses browser TTS; presets carry ElevenLabs
// voice ids for when a key is connected.
export function VoicePicker() {
  const { voicePresetId, setVoicePreset } = useStore();

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <SpeakerIcon className="h-4 w-4 text-brand-400" />
        <span className="font-semibold text-white">Audio Accessibility Mode</span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-white/55">
        Voice summaries help visually impaired users, pedestrians on the move, and
        facilities teams receive hands-free hazard briefings.
      </p>
      <div className="mt-3 space-y-2">
        {VOICE_PRESETS.map((v) => {
          const active = v.id === voicePresetId;
          return (
            <div
              key={v.id}
              className={`flex items-center justify-between gap-2 rounded-xl border p-3 transition ${
                active ? "border-brand-500 bg-brand-500/10" : "border-white/10 bg-app-800"
              }`}
            >
              <button onClick={() => setVoicePreset(v.id)} className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  {v.label}
                  {active && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-brand-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> selected
                    </span>
                  )}
                </div>
                <div className="truncate text-[11px] text-white/45">{v.blurb}</div>
              </button>
              <button
                onClick={() => {
                  setVoicePreset(v.id);
                  speak(
                    "This is FixFirst. A high-priority hazard was reported near you.",
                    v.id
                  );
                }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label={`Preview ${v.label}`}
              >
                <PlayIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-white/35">
        Browser voices vary by device. ElevenLabs voice IDs are wired per persona
        for when a key is connected.
      </p>
    </div>
  );
}
