"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — voice note capture (dark)
// Records via MediaRecorder or accepts an upload. ElevenLabs/Gemini
// would transcribe the captured audio at analysis time.
// ─────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import { MicIcon } from "./Icons";

export function VoiceRecorder({
  onAudio,
}: {
  onAudio: (hasAudio: boolean, dataUrl?: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const url = reader.result as string;
          setAudioUrl(url);
          onAudio(true, url);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Mic unavailable — upload an audio file instead.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setAudioUrl(url);
      onAudio(true, url);
    };
    reader.readAsDataURL(file);
  }

  function clear() {
    setAudioUrl(null);
    setSeconds(0);
    onAudio(false);
  }

  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-app-800/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {!recording ? (
          <button type="button" onClick={start} className="btn-ghost">
            <MicIcon className="h-4 w-4" /> Record
          </button>
        ) : (
          <button type="button" onClick={stop} className="btn-danger">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
            Stop · {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </button>
        )}
        <label className="btn-ghost cursor-pointer">
          Upload audio
          <input type="file" accept="audio/*" className="hidden" onChange={onUpload} />
        </label>
        {audioUrl && (
          <button type="button" onClick={clear} className="text-xs text-white/50 underline">
            Remove
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}

      {audioUrl && (
        <div className="mt-3">
          <audio controls src={audioUrl} className="w-full" />
          <p className="mt-2 rounded-lg bg-app-850 p-2 text-[11px] text-white/55">
            <span className="font-semibold text-white/80">Transcript (auto):</span> captured —
            FixFirst transcribes during analysis.
            {/* GEMINI/ELEVENLABS: real transcription at analysis time */}
          </p>
        </div>
      )}
    </div>
  );
}
