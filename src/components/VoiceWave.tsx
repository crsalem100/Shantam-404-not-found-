"use client";

// Animated waveform shown while a voice briefing / accessibility alert
// is speaking. Pure CSS bars — no audio analysis needed.

export function VoiceWave({ className = "", bars = 9 }: { className?: string; bars?: number }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="ff-wave-bar w-[3px] rounded-full bg-current"
          style={{
            height: `${10 + ((i * 7) % 14)}px`,
            animationDelay: `${(i % 5) * 0.12}s`,
            animationDuration: `${0.7 + ((i % 3) * 0.18)}s`,
          }}
        />
      ))}
    </div>
  );
}
