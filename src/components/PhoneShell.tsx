"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — phone shell
//
// On desktop: a centered phone frame (Citizen-style) so the product
// reads as a real app. On a real phone: true full-screen.
// ─────────────────────────────────────────────────────────────

import { BottomTabBar } from "./BottomTabBar";
import { AuthGate } from "./AuthGate";
import { AchievementWatcher } from "./AchievementWatcher";

export function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] items-stretch justify-center sm:items-center sm:py-6">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-app-950 sm:h-[860px] sm:max-h-[92vh] sm:w-[var(--phone-w,420px)] sm:max-w-phone sm:rounded-[2.4rem] sm:border sm:border-white/10 sm:shadow-phone">
        {/* notch (desktop frame only) */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-50 hidden h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-app-black sm:block" />

        {/* scrollable content */}
        <div className="no-scrollbar relative flex-1 overflow-y-auto pb-24">
          {children}
        </div>

        <BottomTabBar />
        <AuthGate />
        <AchievementWatcher />
      </div>
    </div>
  );
}
