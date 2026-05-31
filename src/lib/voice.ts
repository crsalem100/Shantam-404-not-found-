"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — voice playback with selectable personas
//
// MVP uses the browser SpeechSynthesis API (zero keys) but lets the
// user pick a voice persona — a "cool guy", a crisp narrator, etc.
// Each preset maps a tone (rate/pitch + preferred system voice) AND
// carries an ElevenLabs voice_id for when a key is connected.
//
// ╭─ ELEVENLABS INTEGRATION ───────────────────────────────────╮
// │ When ELEVENLABS_API_KEY is set, speak() should POST text +   │
// │ preset.elevenVoiceId to the ElevenLabs TTS endpoint and play │
// │ the returned audio. Used for: voice confirmation after       │
// │ analysis, facilities audio briefing, accessibility alerts.   │
// ╰──────────────────────────────────────────────────────────────╯
// ─────────────────────────────────────────────────────────────

export interface VoicePreset {
  id: string;
  label: string;
  blurb: string;
  rate: number;
  pitch: number;
  // substrings to prefer when choosing a system voice
  prefer: string[];
  // ElevenLabs voice id to use when the key is connected
  elevenVoiceId: string;
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: "marcus",
    label: "Facilities Briefing Voice",
    blurb: "Calm, low, hands-free — for maintenance briefings.",
    rate: 0.94,
    pitch: 0.82,
    prefer: ["Daniel", "Alex", "Google UK English Male", "Microsoft Guy", "Aaron", "Male"],
    elevenVoiceId: "onwK4e9ZLuTAKqWW03F9", // Daniel (example)
  },
  {
    id: "nova",
    label: "Clear Alert Voice",
    blurb: "Crisp, high-clarity — for hazard alerts.",
    rate: 1.0,
    pitch: 1.05,
    prefer: ["Samantha", "Google US English", "Microsoft Aria", "Karen", "Female"],
    elevenVoiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah (example)
  },
  {
    id: "ranger",
    label: "Navigation Warning Voice",
    blurb: "Firm and directional — for on-the-move warnings.",
    rate: 0.92,
    pitch: 0.74,
    prefer: ["Fred", "Google UK English Male", "Microsoft David", "Male"],
    elevenVoiceId: "VR6AewLTigWG4xSOukaG", // Arnold (example)
  },
  {
    id: "zara",
    label: "Community Update Voice",
    blurb: "Friendly and clear — for status updates.",
    rate: 1.04,
    pitch: 1.12,
    prefer: ["Victoria", "Google US English", "Microsoft Jenny", "Tessa", "Female"],
    elevenVoiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel (example)
  },
  {
    id: "system",
    label: "Device Default",
    blurb: "Your device's standard voice.",
    rate: 1,
    pitch: 1,
    prefer: [],
    elevenVoiceId: "",
  },
];

export function getPreset(id: string): VoicePreset {
  return VOICE_PRESETS.find((v) => v.id === id) ?? VOICE_PRESETS[0];
}

export function listSystemVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
}

function pickVoice(preset: VoicePreset): SpeechSynthesisVoice | undefined {
  const voices = listSystemVoices();
  if (voices.length === 0) return undefined;
  for (const hint of preset.prefer) {
    const match = voices.find((v) =>
      v.name.toLowerCase().includes(hint.toLowerCase())
    );
    if (match) return match;
  }
  return voices[0];
}

export function speak(text: string, presetId = "marcus"): void {
  if (typeof window === "undefined") return;

  // ELEVENLABS: if a key is configured, stream getPreset(presetId).elevenVoiceId
  // audio here instead of the browser engine. Fallback below keeps demos working.

  if (!("speechSynthesis" in window)) return;
  const preset = getPreset(presetId);
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(preset);
  if (voice) u.voice = voice;
  u.rate = preset.rate;
  u.pitch = preset.pitch;
  u.lang = "en-US";
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function briefingScript(lines: string[]): string {
  return `FixFirst facilities briefing. ${lines.join(" ")}`;
}

export function accessibilityAlertScript(issue: string, where: string): string {
  return `Accessibility alert. A ${issue} is reported near ${where}. Please use caution or an alternate route.`;
}
