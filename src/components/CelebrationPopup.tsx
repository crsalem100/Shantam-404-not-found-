"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — celebration popup (report submitted / badge / reward /
// verification). A single reusable modal with Firsty + count-up + a
// short, civic message. Demo energy without the cheesiness.
// ─────────────────────────────────────────────────────────────

import { Firsty } from "./Firsty";
import { CountUp } from "./CountUp";
import { CloseIcon, CheckIcon, StarIcon, ShieldIcon, BoltIcon } from "./Icons";

export type CelebrationKind = "report" | "badge" | "reward" | "verify";

export interface CelebrationRow {
  label: string;
  value: React.ReactNode;
}

const KIND_ICON = {
  report: BoltIcon,
  badge: StarIcon,
  reward: CheckIcon,
  verify: ShieldIcon,
};

const KIND_ACCENT = {
  report: "from-brand-500/25",
  badge: "from-yellow-500/25",
  reward: "from-emerald-500/25",
  verify: "from-emerald-500/25",
};

export function CelebrationPopup({
  kind,
  eyebrow,
  title,
  subtitle,
  rows,
  points,
  scoreTo,
  scoreLabel = "Priority score",
  ctaLabel = "Done",
  onCta,
  onClose,
}: {
  kind: CelebrationKind;
  eyebrow: string;
  title: string;
  subtitle?: string;
  rows?: CelebrationRow[];
  points?: number;
  scoreTo?: number;
  scoreLabel?: string;
  ctaLabel?: string;
  onCta?: () => void;
  onClose: () => void;
}) {
  const Icon = KIND_ICON[kind];
  return (
    <div
      className="animate-backdrop absolute inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className={`animate-pop w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b ${KIND_ACCENT[kind]} to-app-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-5 pt-6 text-center">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60"
          >
            <CloseIcon className="h-4 w-4" />
          </button>

          <div className="animate-unlock mx-auto grid h-20 w-20 place-items-center">
            <Firsty className="h-20 w-20" bob />
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80">
            <Icon className="h-3.5 w-3.5" /> {eyebrow}
          </div>
          <h2 className="mt-2 text-xl font-extrabold leading-tight text-white">{title}</h2>
          {subtitle && <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-snug text-white/65">{subtitle}</p>}
        </div>

        {scoreTo != null && (
          <div className="mx-5 mt-4 grid place-items-center rounded-2xl border border-white/10 bg-app-950/60 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/45">{scoreLabel}</div>
            <CountUp to={scoreTo} duration={1100} className="text-4xl font-black text-white" />
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="mx-5 mt-3 space-y-2 rounded-2xl border border-white/10 bg-app-950/40 p-3">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-white/50">{r.label}</span>
                <span className="text-right font-semibold text-white">{r.value}</span>
              </div>
            ))}
          </div>
        )}

        {points != null && (
          <div className="mx-5 mt-3 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-emerald-300">
            <StarIcon className="h-4 w-4" />
            <span className="font-bold">
              +<CountUp to={points} duration={800} /> civic points earned
            </span>
          </div>
        )}

        <div className="p-5 pt-4">
          <button
            onClick={() => {
              onCta?.();
              onClose();
            }}
            className="btn-primary w-full py-3"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
