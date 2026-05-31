// Compact inline-SVG glyphs (white stroke) for Leaflet marker HTML.
// Kept minimal and consistent so map pins read cleanly at small sizes.

import type { HazardCategory } from "@/lib/types";

const wrap = (inner: string) =>
  `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const CATEGORY_GLYPH: Record<HazardCategory, string> = {
  Pothole: wrap('<ellipse cx="12" cy="14" rx="6" ry="4" fill="white" stroke="none" opacity="0.9"/>'),
  "Cracked sidewalk": wrap('<path d="M12 4 9 11l5 2-2 7"/>'),
  "Blocked wheelchair ramp": wrap('<circle cx="10" cy="6" r="1.6" fill="white" stroke="none"/><path d="M9 9v4h4l2 4"/><circle cx="11" cy="16" r="3"/>'),
  "Broken curb cut": wrap('<path d="M4 16h6l4-6h6"/><path d="M4 20h16"/>'),
  "Missing tactile paving": wrap('<circle cx="8" cy="9" r="1.2" fill="white" stroke="none"/><circle cx="12" cy="9" r="1.2" fill="white" stroke="none"/><circle cx="16" cy="9" r="1.2" fill="white" stroke="none"/><circle cx="8" cy="14" r="1.2" fill="white" stroke="none"/><circle cx="16" cy="14" r="1.2" fill="white" stroke="none"/>'),
  "Broken light": wrap('<path d="M12 4a5 5 0 0 0-2 9.5V16h4v-2.5A5 5 0 0 0 12 4Z"/><path d="M10 19h4"/>'),
  "Unsafe crossing": wrap('<path d="M7 20V8m5 12V8m5 12V8"/>'),
  "Crosswalk signal issue": wrap('<rect x="8" y="3" width="8" height="13" rx="2"/><circle cx="12" cy="8" r="1.3" fill="white" stroke="none"/><path d="M10 20h4"/>'),
  "Overflowing trash": wrap('<path d="M6 8h12l-1 11H7L6 8Z"/><path d="M4 8h16M9 5h6"/>'),
  "Blocked bike lane": wrap('<circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="m6 16 4-6h5l2 6"/>'),
  "Flooding / standing water": wrap('<path d="M3 14c2-2 4 2 6 0s4-2 6 0 4 2 6 0"/><path d="M3 18c2-2 4 2 6 0s4-2 6 0 4 2 6 0"/>'),
  "Damaged sign": wrap('<path d="M12 3v18"/><path d="M7 6h8l2 3-2 3H7Z"/>'),
  "Fallen tree / branch": wrap('<path d="M12 3v12"/><path d="M12 9 7 6m5 5 5-4"/><path d="M5 20h14"/>'),
  "Scooter / bike obstruction": wrap('<circle cx="6" cy="17" r="2.3"/><circle cx="18" cy="17" r="2.3"/><path d="M6 17 12 7h3m3 10-3-7"/>'),
  Other: wrap('<path d="M12 8v5m0 4h.01"/>'),
};
