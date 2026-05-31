// Compact inline-SVG glyphs (white stroke) for Leaflet marker HTML.
// Kept minimal and consistent so map pins read cleanly at small sizes.

import type { HazardCategory } from "@/lib/types";

const wrap = (inner: string) =>
  `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const CATEGORY_GLYPH: Record<HazardCategory, string> = {
  Pothole: wrap('<ellipse cx="12" cy="14" rx="6" ry="4" fill="white" stroke="none" opacity="0.9"/>'),
  "Cracked sidewalk": wrap('<path d="M12 4 9 11l5 2-2 7"/>'),
  "Blocked wheelchair ramp": wrap('<circle cx="10" cy="6" r="1.6" fill="white" stroke="none"/><path d="M9 9v4h4l2 4"/><circle cx="11" cy="16" r="3"/>'),
  "Broken light": wrap('<path d="M12 4a5 5 0 0 0-2 9.5V16h4v-2.5A5 5 0 0 0 12 4Z"/><path d="M10 19h4"/>'),
  "Unsafe crossing": wrap('<path d="M7 20V8m5 12V8m5 12V8"/>'),
  "Overflowing trash": wrap('<path d="M6 8h12l-1 11H7L6 8Z"/><path d="M4 8h16M9 5h6"/>'),
  "Blocked bike lane": wrap('<circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="m6 16 4-6h5l2 6"/>'),
  Other: wrap('<path d="M12 8v5m0 4h.01"/>'),
};
