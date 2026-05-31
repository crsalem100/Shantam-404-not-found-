"use client";

// Native share with clipboard fallback. Used for inviting friends and
// sharing reports / teams / leaderboard rank — supports community growth,
// never required.
export function shareContent(data: { title: string; text: string; url?: string }): void {
  const url =
    data.url ?? (typeof window !== "undefined" ? window.location.href : "https://fixfirst.app");
  const payload = { title: data.title, text: data.text, url };
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share(payload).catch(() => {});
  } else if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(`${data.text} ${url}`);
  }
}

export const INVITE_TEXT =
  "Join my FixFirst civic network and help verify public-space hazards around UO. We earn impact points when reports are confirmed or fixed.";
