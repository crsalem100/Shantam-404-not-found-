"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — automatic badge / reward unlock popups
//
// Watches the user's civic impact points and earned badges. When an
// action (filing a verified report, verifying others) crosses a reward
// threshold or completes a badge, Firsty pops a celebration. Initialized
// silently on load so already-earned achievements don't re-fire.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { badgeProgress, REWARDS } from "@/lib/reputation";
import { CelebrationPopup } from "./CelebrationPopup";

type Pop =
  | { kind: "badge"; title: string; subtitle: string; points: number }
  | { kind: "reward"; title: string; subtitle: string };

export function AchievementWatcher() {
  const { user, reports, isAuthed } = useStore();
  const prevRep = useRef<number | null>(null);
  const prevBadges = useRef<Set<string> | null>(null);
  const [queue, setQueue] = useState<Pop[]>([]);

  useEffect(() => {
    const earned = new Set(badgeProgress(user, reports).filter((b) => b.earned).map((b) => b.label));

    // First run: snapshot silently, fire nothing.
    if (prevRep.current === null || prevBadges.current === null) {
      prevRep.current = user.reputation;
      prevBadges.current = earned;
      return;
    }

    const pops: Pop[] = [];

    // New badges
    for (const b of badgeProgress(user, reports)) {
      if (b.earned && !prevBadges.current.has(b.label)) {
        pops.push({
          kind: "badge",
          title: `Badge unlocked: ${b.label}`,
          subtitle: b.description,
          points: b.rewardPoints,
        });
      }
    }

    // New rewards crossed
    for (const r of REWARDS) {
      if (user.reputation >= r.unlockAt && prevRep.current < r.unlockAt) {
        pops.push({
          kind: "reward",
          title: `Reward unlocked: ${r.label}`,
          subtitle: "Rewards unlock through verified civic impact, not spam.",
        });
      }
    }

    prevRep.current = user.reputation;
    prevBadges.current = earned;

    if (pops.length) setQueue((q) => [...q, ...pops]);
  }, [user, reports]);

  if (!isAuthed || queue.length === 0) return null;
  const current = queue[0];

  return (
    <CelebrationPopup
      kind={current.kind}
      eyebrow={current.kind === "badge" ? "Achievement" : "Reward"}
      title={current.title}
      subtitle={current.subtitle}
      points={current.kind === "badge" ? current.points : undefined}
      ctaLabel="Nice"
      onClose={() => setQueue((q) => q.slice(1))}
    />
  );
}
