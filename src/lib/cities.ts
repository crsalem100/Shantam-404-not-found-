// ─────────────────────────────────────────────────────────────
// FixFirst — multi-city civic data layer
//
// FixFirst is designed to ingest 311-style open data from any city
// and re-rank it with the same severity-weighted engine. SF / NYC /
// Chicago pull REAL open data (see src/data/adapters); the rest are
// demo snapshots modeled after 311 reports and labeled honestly.
//
// SNOWFLAKE: in production these snapshots are materialized views in
// the warehouse, powering the national / city-level dashboards.
// ─────────────────────────────────────────────────────────────

import type { GeoPoint, HazardCategory, ReportSource } from "./types";

export interface CitySnapshot {
  openReports: number;
  urgent: number;
  fixedThisWeek: number;
  reopened: number;
  avgUnresolvedDays: number;
  accessibilityDebt: number; // 0–100 unresolved-accessibility burden
  verificationRate: number; // % of reports community-verified
  topCategory: string;
}

export interface CityDataset {
  key: string; // selector value
  name: string; // display name
  selectorLabel: string; // short label in the dropdown
  source: ReportSource; // source label applied to its reports
  center: GeoPoint;
  zoom: number; // map zoom the viewport flies to when this city is selected
  isReal?: boolean; // pulls a real open-data endpoint (SF/NYC/Chicago)
  // Categories this city's feed leans toward (for the mock sample).
  emphasis: HazardCategory[];
  snapshot: CitySnapshot;
  // 311 endpoint this dataset maps to (documentation only for the mock).
  open311Endpoint?: string;
}

// Helper to keep the 20-city table compact + readable.
function snap(
  openReports: number,
  urgent: number,
  fixedThisWeek: number,
  reopened: number,
  avgUnresolvedDays: number,
  accessibilityDebt: number,
  verificationRate: number,
  topCategory: string
): CitySnapshot {
  return { openReports, urgent, fixedThisWeek, reopened, avgUnresolvedDays, accessibilityDebt, verificationRate, topCategory };
}

export const CITY_DATASETS: CityDataset[] = [
  // ── Headline demo: University of Oregon / Eugene ──────────────
  {
    key: "uo",
    name: "University of Oregon · Eugene",
    selectorLabel: "UO Demo",
    source: "uo",
    center: { lat: 44.0448, lng: -123.0726 },
    zoom: 14,
    emphasis: ["Blocked wheelchair ramp", "Cracked sidewalk", "Unsafe crossing", "Broken curb cut"],
    snapshot: snap(28, 7, 5, 2, 6.2, 84, 76, "Accessibility hazards"),
  },
  // ── Real open-data cities ─────────────────────────────────────
  {
    key: "sf311",
    name: "San Francisco",
    selectorLabel: "San Francisco 311",
    source: "sf311",
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 12,
    isReal: true,
    emphasis: ["Cracked sidewalk", "Overflowing trash", "Broken light"],
    snapshot: snap(3204, 214, 486, 38, 6, 67, 42, "Blocked sidewalks"),
    open311Endpoint: "https://mobile311.sfgov.org/open311/v2/requests.json",
  },
  {
    key: "nyc311",
    name: "New York City",
    selectorLabel: "NYC 311",
    source: "nyc311",
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 12,
    isReal: true,
    emphasis: ["Pothole", "Cracked sidewalk", "Broken light"],
    snapshot: snap(12420, 608, 1890, 142, 4, 72, 39, "Street defects"),
    open311Endpoint: "https://data.cityofnewyork.us/resource/erm2-nwe9.json",
  },
  {
    key: "chicago311",
    name: "Chicago",
    selectorLabel: "Chicago 311",
    source: "chicago311",
    center: { lat: 41.8781, lng: -87.6298 },
    zoom: 12,
    isReal: true,
    emphasis: ["Pothole", "Broken light", "Unsafe crossing"],
    snapshot: snap(4188, 179, 602, 51, 7, 64, 35, "Potholes"),
    open311Endpoint: "https://311api.cityofchicago.org/open311/v2/requests.json",
  },
  // ── Major metros — demo data modeled after 311 reports ────────
  { key: "la", name: "Los Angeles", selectorLabel: "Los Angeles", source: "demo311", center: { lat: 34.0522, lng: -118.2437 }, zoom: 11, emphasis: ["Cracked sidewalk", "Pothole", "Broken light"], snapshot: snap(9120, 421, 712, 96, 8, 69, 31, "Sidewalk hazards") },
  { key: "seattle", name: "Seattle", selectorLabel: "Seattle", source: "demo311", center: { lat: 47.6062, lng: -122.3321 }, zoom: 11, emphasis: ["Cracked sidewalk", "Broken curb cut", "Unsafe crossing"], snapshot: snap(2140, 118, 244, 19, 6, 61, 44, "Accessibility hazards") },
  { key: "portland", name: "Portland", selectorLabel: "Portland", source: "demo311", center: { lat: 45.5152, lng: -122.6784 }, zoom: 11, emphasis: ["Pothole", "Blocked bike lane", "Cracked sidewalk"], snapshot: snap(1980, 96, 210, 14, 6, 58, 47, "Bike-lane obstructions") },
  { key: "boston", name: "Boston", selectorLabel: "Boston", source: "demo311", center: { lat: 42.3601, lng: -71.0589 }, zoom: 12, emphasis: ["Pothole", "Cracked sidewalk", "Damaged sign"], snapshot: snap(2620, 131, 318, 22, 5, 63, 41, "Street defects") },
  { key: "dc", name: "Washington, DC", selectorLabel: "Washington, DC", source: "demo311", center: { lat: 38.9072, lng: -77.0369 }, zoom: 12, emphasis: ["Cracked sidewalk", "Broken light", "Unsafe crossing"], snapshot: snap(2880, 144, 360, 27, 5, 66, 40, "Sidewalk hazards") },
  { key: "philadelphia", name: "Philadelphia", selectorLabel: "Philadelphia", source: "demo311", center: { lat: 39.9526, lng: -75.1652 }, zoom: 12, emphasis: ["Pothole", "Overflowing trash", "Cracked sidewalk"], snapshot: snap(3360, 162, 408, 33, 7, 60, 33, "Potholes") },
  { key: "houston", name: "Houston", selectorLabel: "Houston", source: "demo311", center: { lat: 29.7604, lng: -95.3698 }, zoom: 11, emphasis: ["Pothole", "Flooding / standing water", "Broken light"], snapshot: snap(5210, 233, 470, 41, 8, 55, 28, "Drainage / flooding") },
  { key: "dallas", name: "Dallas", selectorLabel: "Dallas", source: "demo311", center: { lat: 32.7767, lng: -96.797 }, zoom: 11, emphasis: ["Pothole", "Broken light", "Cracked sidewalk"], snapshot: snap(3980, 176, 392, 30, 7, 57, 30, "Potholes") },
  { key: "austin", name: "Austin", selectorLabel: "Austin", source: "demo311", center: { lat: 30.2672, lng: -97.7431 }, zoom: 12, emphasis: ["Blocked bike lane", "Pothole", "Cracked sidewalk"], snapshot: snap(2240, 109, 268, 18, 6, 59, 43, "Mobility hazards") },
  { key: "miami", name: "Miami", selectorLabel: "Miami", source: "demo311", center: { lat: 25.7617, lng: -80.1918 }, zoom: 12, emphasis: ["Flooding / standing water", "Cracked sidewalk", "Broken light"], snapshot: snap(2760, 138, 300, 24, 7, 62, 34, "Flooding / drainage") },
  { key: "atlanta", name: "Atlanta", selectorLabel: "Atlanta", source: "demo311", center: { lat: 33.749, lng: -84.388 }, zoom: 12, emphasis: ["Pothole", "Cracked sidewalk", "Broken light"], snapshot: snap(3010, 151, 336, 28, 7, 61, 32, "Sidewalk hazards") },
  { key: "denver", name: "Denver", selectorLabel: "Denver", source: "demo311", center: { lat: 39.7392, lng: -104.9903 }, zoom: 12, emphasis: ["Pothole", "Cracked sidewalk", "Broken light"], snapshot: snap(2090, 101, 240, 16, 6, 56, 38, "Potholes") },
  { key: "phoenix", name: "Phoenix", selectorLabel: "Phoenix", source: "demo311", center: { lat: 33.4484, lng: -112.074 }, zoom: 11, emphasis: ["Cracked sidewalk", "Broken light", "Pothole"], snapshot: snap(3540, 159, 372, 26, 8, 58, 29, "Sidewalk hazards") },
  { key: "sandiego", name: "San Diego", selectorLabel: "San Diego", source: "demo311", center: { lat: 32.7157, lng: -117.1611 }, zoom: 12, emphasis: ["Cracked sidewalk", "Pothole", "Broken light"], snapshot: snap(2480, 121, 290, 20, 6, 60, 37, "Sidewalk hazards") },
  { key: "minneapolis", name: "Minneapolis", selectorLabel: "Minneapolis", source: "demo311", center: { lat: 44.9778, lng: -93.265 }, zoom: 12, emphasis: ["Pothole", "Cracked sidewalk", "Broken curb cut"], snapshot: snap(1860, 92, 224, 15, 6, 57, 45, "Potholes") },
  { key: "lasvegas", name: "Las Vegas", selectorLabel: "Las Vegas", source: "demo311", center: { lat: 36.1699, lng: -115.1398 }, zoom: 12, emphasis: ["Cracked sidewalk", "Broken light", "Pothole"], snapshot: snap(2300, 112, 262, 19, 7, 54, 30, "Sidewalk hazards") },
  { key: "detroit", name: "Detroit", selectorLabel: "Detroit", source: "demo311", center: { lat: 42.3314, lng: -83.0458 }, zoom: 12, emphasis: ["Broken light", "Pothole", "Overflowing trash"], snapshot: snap(2960, 147, 312, 31, 8, 59, 36, "Street lighting") },
  { key: "baltimore", name: "Baltimore", selectorLabel: "Baltimore", source: "demo311", center: { lat: 39.2904, lng: -76.6122 }, zoom: 12, emphasis: ["Pothole", "Overflowing trash", "Broken light"], snapshot: snap(2740, 134, 298, 25, 7, 62, 35, "Potholes") },
  { key: "sanjose", name: "San Jose", selectorLabel: "San Jose", source: "demo311", center: { lat: 37.3382, lng: -121.8863 }, zoom: 12, emphasis: ["Cracked sidewalk", "Pothole", "Blocked bike lane"], snapshot: snap(1920, 94, 232, 16, 6, 58, 42, "Sidewalk hazards") },
  { key: "nashville", name: "Nashville", selectorLabel: "Nashville", source: "demo311", center: { lat: 36.1627, lng: -86.7816 }, zoom: 12, emphasis: ["Pothole", "Cracked sidewalk", "Broken light"], snapshot: snap(2180, 106, 254, 18, 7, 56, 33, "Potholes") },
  { key: "neworleans", name: "New Orleans", selectorLabel: "New Orleans", source: "demo311", center: { lat: 29.9511, lng: -90.0715 }, zoom: 12, emphasis: ["Flooding / standing water", "Pothole", "Broken light"], snapshot: snap(2520, 128, 280, 27, 8, 61, 31, "Flooding / drainage") },
  // ── National rollup ───────────────────────────────────────────
  {
    key: "us",
    name: "United States Snapshot",
    selectorLabel: "United States Snapshot",
    source: "demo311",
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4,
    emphasis: ["Pothole", "Cracked sidewalk", "Broken light", "Unsafe crossing"],
    snapshot: snap(96840, 4870, 11200, 980, 6, 63, 38, "Potholes"),
  },
];

export function cityByKey(key: string): CityDataset {
  return CITY_DATASETS.find((c) => c.key === key) ?? CITY_DATASETS[0];
}

// The headline cards on the civic snapshot section.
export const SNAPSHOT_CITIES = ["uo", "sf311", "nyc311", "chicago311"];

// Cities shown in the city-comparison table on the dashboard.
export const COMPARISON_CITIES = ["uo", "sf311", "nyc311", "chicago311", "la", "seattle"];
