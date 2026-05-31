"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — map control surface
//
// Compact segmented controls + toggles that filter and shape what
// the map and priority queue render. Severity threshold, source,
// accessibility-only, near-me sort, and list/map are load-bearing;
// heatmap / cluster are visual-only hints.
// ─────────────────────────────────────────────────────────────

import { AccessibilityIcon, CrosshairIcon, MapPinIcon, FeedIcon } from "@/components/Icons";

export type SeverityFilter = "all" | "60" | "80";
export type SourceFilter = "all" | "311" | "user" | "community";
export type MapLayer = "all" | "urgent" | "accessibility" | "verified" | "fixed";
export type ViewMode = "map" | "list";

export interface MapFilters {
  layer: MapLayer;
  severity: SeverityFilter;
  source: SourceFilter;
  nearMe: boolean;
  accessibilityOnly: boolean;
  cluster: boolean;
  heatmap: boolean;
  view: ViewMode;
}

export const DEFAULT_FILTERS: MapFilters = {
  layer: "all",
  severity: "all",
  source: "all",
  nearMe: false,
  accessibilityOnly: false,
  cluster: false,
  heatmap: false,
  view: "map",
};

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex shrink-0 items-center rounded-full border border-white/[0.08] bg-app-850 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
            value === o.value ? "bg-brand-600 text-white" : "text-white/55 hover:text-white/85"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition active:scale-95 ${
        active
          ? "bg-brand-600 text-white"
          : "border border-white/[0.08] bg-app-850 text-white/55 hover:text-white/85"
      }`}
    >
      {children}
    </button>
  );
}

export function MapControls({
  filters,
  setFilters,
}: {
  filters: MapFilters;
  setFilters: (f: MapFilters) => void;
}) {
  const set = <K extends keyof MapFilters>(key: K, value: MapFilters[K]) =>
    setFilters({ ...filters, [key]: value });

  return (
    <div className="border-b border-white/[0.08] bg-app-950/70 px-3 py-2.5">
      {/* Row 0: map layers */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Layer
        </span>
        <Segmented<MapLayer>
          value={filters.layer}
          onChange={(v) => set("layer", v)}
          options={[
            { value: "all", label: "All" },
            { value: "urgent", label: "Urgent" },
            { value: "accessibility", label: "Accessibility" },
            { value: "verified", label: "Verified" },
            { value: "fixed", label: "Fixed" },
          ]}
        />
      </div>

      {/* Row 1: severity + view */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Severity
        </span>
        <Segmented<SeverityFilter>
          value={filters.severity}
          onChange={(v) => set("severity", v)}
          options={[
            { value: "all", label: "All" },
            { value: "60", label: "60+" },
            { value: "80", label: "80+" },
          ]}
        />
        <div className="ml-auto shrink-0">
          <Segmented<ViewMode>
            value={filters.view}
            onChange={(v) => set("view", v)}
            options={[
              { value: "map", label: "Map" },
              { value: "list", label: "List" },
            ]}
          />
        </div>
      </div>

      {/* Row 2: source */}
      <div className="no-scrollbar mt-2 flex items-center gap-2 overflow-x-auto">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Source
        </span>
        <Segmented<SourceFilter>
          value={filters.source}
          onChange={(v) => set("source", v)}
          options={[
            { value: "all", label: "All" },
            { value: "311", label: "311" },
            { value: "user", label: "User" },
            { value: "community", label: "Community" },
          ]}
        />
      </div>

      {/* Row 3: toggles */}
      <div className="no-scrollbar mt-2 flex items-center gap-1.5 overflow-x-auto">
        <Toggle active={filters.nearMe} onClick={() => set("nearMe", !filters.nearMe)}>
          <CrosshairIcon className="h-3.5 w-3.5" /> Near me
        </Toggle>
        <Toggle
          active={filters.accessibilityOnly}
          onClick={() => set("accessibilityOnly", !filters.accessibilityOnly)}
        >
          <AccessibilityIcon className="h-3.5 w-3.5" /> Accessibility hazards
        </Toggle>
        <Toggle active={filters.cluster} onClick={() => set("cluster", !filters.cluster)}>
          <MapPinIcon className="h-3.5 w-3.5" /> Clustered pins
        </Toggle>
        <Toggle active={filters.heatmap} onClick={() => set("heatmap", !filters.heatmap)}>
          <FeedIcon className="h-3.5 w-3.5" /> Heatmap
        </Toggle>
      </div>
    </div>
  );
}
