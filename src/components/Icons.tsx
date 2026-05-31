// ─────────────────────────────────────────────────────────────
// FixFirst — inline SVG icons (no icon-library dependency)
// ─────────────────────────────────────────────────────────────

import type { HazardCategory } from "@/lib/types";

type IconProps = { className?: string };

const base = "h-5 w-5";

export function Logo({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2 4 5v6c0 5 3.4 8.3 8 11 4.6-2.7 8-6 8-11V5l-8-3Z"
        className="fill-brand-600"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export const CategoryIcon: Record<HazardCategory, (p: IconProps) => JSX.Element> = {
  Pothole: ({ className = base }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <ellipse cx="12" cy="14" rx="7" ry="4.5" className="fill-current opacity-20" />
      <path d="M5 14c1.5-2 4-3 7-3s5.5 1 7 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 9.5 7.5 5M14 9 16 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  "Cracked sidewalk": ({ className = base }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 5 9 10l4 3-2 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "Blocked wheelchair ramp": ({ className = base }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="9" cy="5" r="1.8" className="fill-current" />
      <path d="M8 8v5h4l2 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10.5" cy="16" r="3.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20 21 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  ),
  "Broken light": ({ className = base }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M9 18h6m-5 3h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 3a6 6 0 0 0-3 11.2V18h6v-3.8A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  "Unsafe crossing": ({ className = base }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M6 21V8m4 13V8m4 13V8m4 13V8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M3 5h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  "Overflowing trash": ({ className = base }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M6 9h12l-1 11H7L6 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 9h16M9 6h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 6 8 3M15 6l1-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  "Blocked bike lane": ({ className = base }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="6" cy="17" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="m6 17 4-7h5l2 7M10 10l-1-3H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Other: ({ className = base }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M12 9v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.3 4 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
};

export function CameraIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function MicIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function SpeakerIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16 9a3 3 0 0 1 0 6m2.5-8.5a6 6 0 0 1 0 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function MapPinIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ChartIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M4 20V4m16 16H4m4 0v-7m4 7V8m4 12v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function SparkIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M12 3v4m0 10v4m9-9h-4M7 12H3m13.5-6.5-2.8 2.8m-3.4 3.4-2.8 2.8m9 0-2.8-2.8m-3.4-3.4L7.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function UsersIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6m1 2.5a6 6 0 0 1 4 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function FeedIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <rect x="3" y="4" width="18" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="12" width="18" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function UserIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function VideoIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m16 10 5-3v10l-5-3v-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="m12 3 2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.9 6.7 19.5l1.1-6L3.4 9.3l6-.8L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M12 3 5 6v6c0 4.4 3 7.4 7 9 4-1.6 7-4.6 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GavelIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="m14 6 4 4M9 11l4 4M3 21h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="11.5" y="3" width="7" height="4" rx="1" transform="rotate(45 15 5)" stroke="currentColor" strokeWidth="1.6" />
      <path d="m12 12-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function CrosshairIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" className="fill-current" />
    </svg>
  );
}

export function BoltIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function ThumbUpIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 4-7a2 2 0 0 1 2 2v3h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function ThumbDownIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Zm0 0-4 7a2 2 0 0 1-2-2v-3H6a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 7.2 4H17" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function PlayIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M7 5v14l11-7L7 5Z" className="fill-current" />
    </svg>
  );
}

export function AccessibilityIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="12" cy="4.5" r="1.6" className="fill-current" />
      <path d="M7 8.5c1.6.7 3.2 1 5 1s3.4-.3 5-1M12 9.5V14m0 0-2.5 5.5M12 14l2.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShareIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.2 10.8 6.6-3.6m0 9.6-6.6-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function NavigateIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
