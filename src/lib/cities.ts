// ─────────────────────────────────────────────────────────────
// FixFirst — multi-city civic data layer
//
// FixFirst is designed to ingest 311-style open data from any city
// and re-rank it with the same severity-weighted engine. These
// datasets are mocked today; each `key` maps cleanly to a real
// open-data endpoint later (see lib/open311.ts).
//
// SNOWFLAKE: in production these snapshots are materialized views in
// the warehouse, powering the national / city-level dashboards.
// ─────────────────────────────────────────────────────────────

import type { GeoPoint, HazardCategory, ReportSource } from "./types";

export interface CitySnapshot {
  openReports: number;
  urgent: number;
  avgUnresolvedDays: number;
  topCategory: string;
}

export interface CityDataset {
  key: string; // selector value
  name: string; // display name
  selectorLabel: string; // short label in the dropdown
  source: ReportSource; // source label applied to its reports
  center: GeoPoint;
  zoom: number; // map zoom the viewport flies to when this city is selected
  // Categories this city's feed leans toward (for the mock sample).
  emphasis: HazardCategory[];
  snapshot: CitySnapshot;
  // 311 endpoint this dataset maps to (documentation only for the mock).
  open311Endpoint?: string;
}

export const CITY_DATASETS: CityDataset[] = [
  {
    key: "uo",
    name: "University of Oregon · Eugene",
    selectorLabel: "UO Demo",
    source: "uo",
    center: { lat: 44.0448, lng: -123.0726 },
    zoom: 14,
    emphasis: ["Blocked wheelchair ramp", "Cracked sidewalk", "Unsafe crossing"],
    snapshot: { openReports: 8, urgent: 7, avgUnresolvedDays: 6, topCategory: "Accessibility hazards" },
  },
  {
    key: "sf311",
    name: "San Francisco",
    selectorLabel: "San Francisco 311",
    source: "sf311",
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 12,
    emphasis: ["Cracked sidewalk", "Overflowing trash", "Broken light"],
    snapshot: { openReports: 3204, urgent: 214, avgUnresolvedDays: 6, topCategory: "Blocked sidewalks" },
    open311Endpoint: "https://mobile311.sfgov.org/open311/v2/requests.json",
  },
  {
    key: "nyc311",
    name: "New York City",
    selectorLabel: "NYC 311",
    source: "nyc311",
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 12,
    emphasis: ["Pothole", "Cracked sidewalk", "Broken light"],
    snapshot: { openReports: 12420, urgent: 608, avgUnresolvedDays: 4, topCategory: "Street defects" },
    open311Endpoint: "https://data.cityofnewyork.us/resource/erm2-nwe9.json",
  },
  {
    key: "chicago311",
    name: "Chicago",
    selectorLabel: "Chicago 311",
    source: "chicago311",
    center: { lat: 41.8781, lng: -87.6298 },
    zoom: 12,
    emphasis: ["Pothole", "Broken light", "Unsafe crossing"],
    snapshot: { openReports: 4188, urgent: 179, avgUnresolvedDays: 7, topCategory: "Potholes" },
    open311Endpoint: "https://311api.cityofchicago.org/open311/v2/requests.json",
  },
  {
    key: "us",
    name: "United States Snapshot",
    selectorLabel: "United States Snapshot",
    source: "community",
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4,
    emphasis: ["Pothole", "Cracked sidewalk", "Broken light", "Unsafe crossing"],
    snapshot: { openReports: 19820, urgent: 1001, avgUnresolvedDays: 6, topCategory: "Potholes" },
  },
];

export function cityByKey(key: string): CityDataset {
  return CITY_DATASETS.find((c) => c.key === key) ?? CITY_DATASETS[0];
}

// The four headline cards on the civic snapshot section.
export const SNAPSHOT_CITIES = ["sf311", "nyc311", "chicago311", "uo"];
