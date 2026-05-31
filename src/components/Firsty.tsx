"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — "Firsty" the FixFirst Duck (QuackHacks mascot)
//
// A small civic duck in a hard hat + safety vest holding a clipboard.
// Friendly, not childish; tuned for the dark UI. Use Firsty as a
// memorable assistant in small moments (loading, report submitted,
// badge/reward unlocked, briefing, empty states) — never as the whole
// app. <FirstyMessage> pairs Firsty with one line of copy.
// ─────────────────────────────────────────────────────────────

type FirstyProps = { className?: string; bob?: boolean };

export function Firsty({ className = "h-12 w-12", bob = false }: FirstyProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} ${bob ? "ff-firsty-bob" : ""}`}
      aria-hidden
      fill="none"
    >
      {/* body */}
      <ellipse cx="30" cy="42" rx="17" ry="14" fill="#FACC15" />
      <ellipse cx="30" cy="42" rx="17" ry="14" fill="url(#ff-body)" />
      {/* tail */}
      <path d="M14 38c-5-1-8 1-9 3 3 1 6 1 9-.5Z" fill="#F59E0B" />
      {/* wing */}
      <path d="M34 38c5 0 9 3 9 7 0 3-3 5-7 5-3 0-6-2-6-6 0-3 2-6 4-6Z" fill="#F59E0B" />
      {/* safety vest band + reflective stripes */}
      <path d="M18 40c4 4 20 4 24 0l1 9c-7 5-19 5-26 0l1-9Z" fill="#F97316" />
      <path d="M30 40.5v15" stroke="#FCD34D" strokeWidth="2" />
      <path d="M22 45.5c5 2 15 2 16 0" stroke="#E5E7EB" strokeWidth="1.6" opacity="0.85" />
      {/* clipboard */}
      <rect x="38" y="42" width="11" height="14" rx="1.5" fill="#1f2937" stroke="#9CA3AF" strokeWidth="1" />
      <rect x="41" y="40.5" width="5" height="3" rx="1" fill="#9CA3AF" />
      <path d="M40.5 47h6M40.5 50h6M40.5 53h4" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" />
      {/* head */}
      <circle cx="30" cy="22" r="12" fill="#FACC15" />
      <circle cx="30" cy="22" r="12" fill="url(#ff-head)" />
      {/* eye */}
      <circle cx="33" cy="20" r="2.4" fill="#1f2937" />
      <circle cx="33.8" cy="19.2" r="0.7" fill="#fff" />
      {/* bill */}
      <path d="M38 23c5 0 8 2 8 3.5S43 30 38 30c-3 0-4-1.5-4-3.5S35 23 38 23Z" fill="#F97316" />
      <path d="M34 26.5c3 .8 8 .8 11 0" stroke="#C2410C" strokeWidth="1" strokeLinecap="round" />
      {/* hard hat */}
      <path d="M18 16c0-7 5-11 12-11s12 4 12 11H18Z" fill="#1f7aff" />
      <path d="M30 5c2.5 0 2.5 0 2.5 3.5V16" stroke="#1657c4" strokeWidth="1.4" />
      <rect x="15" y="15.5" width="30" height="3.4" rx="1.7" fill="#1657c4" />
      <defs>
        <linearGradient id="ff-body" x1="13" y1="28" x2="47" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="ff-head" x1="18" y1="10" x2="42" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Firsty + one short line — the standard "assistant" moment.
export function FirstyMessage({
  text,
  size = "h-11 w-11",
  className = "",
}: {
  text: React.ReactNode;
  size?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Firsty className={`${size} shrink-0`} bob />
      <p className="text-[13px] leading-snug text-white/80">{text}</p>
    </div>
  );
}
