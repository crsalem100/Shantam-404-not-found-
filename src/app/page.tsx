"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { cityByKey } from "@/lib/cities";
import { useLiveLocation, distanceKm } from "@/lib/geo";
import { SearchBar } from "@/components/SearchBar";
import type { SearchAction } from "@/lib/search";
import { priorityForReport, suggestedTimeframe } from "@/lib/priority";
import { speak } from "@/lib/voice";
import { LiveMap } from "@/components/LiveMap";
import { IncidentCard } from "@/components/IncidentCard";
import { CitySelector } from "@/components/CitySelector";
import { LocationStatus } from "@/components/LocationStatus";
import { MapControls, DEFAULT_FILTERS } from "@/components/MapControls";
import type { MapFilters } from "@/components/MapControls";
import { NetworkActivity } from "@/components/NetworkActivity";
import { VoiceWave } from "@/components/VoiceWave";
import { CivicInsights } from "@/components/CivicInsights";
import {
  Logo,
  CrosshairIcon,
  BoltIcon,
  UserIcon,
  ChartIcon,
  FeedIcon,
  MapPinIcon,
} from "@/components/Icons";
import { PriorityBadge } from "@/components/ui";
import type { HazardCategory, Report, ReportSource } from "@/lib/types";

const THREE_ELEVEN: ReportSource[] = ["sf311", "nyc311", "chicago311", "demo311"];

export default function MapHome() {
  const { reports, voicePresetId, loadIncidents, feedMeta, loadingFeed, ready, selectedCityKey, setCity } =
    useStore();
  const router = useRouter();
  const loc = useLiveLocation(true);
  const [selectedId, setSelectedId] = useState<string>();
  const [focusId, setFocusId] = useState<string>();
  const [follow, setFollow] = useState(true);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [briefing, setBriefing] = useState(false);
  // search-driven filters
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<HazardCategory | null>(null);
  const [deptFilter, setDeptFilter] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const city = cityByKey(selectedCityKey);

  // Route a chosen search suggestion to the right map/queue action.
  function handleSearch(a: SearchAction) {
    // clear any prior search-scoped filters first
    setQuery("");
    setCatFilter(null);
    setDeptFilter(null);
    switch (a.type) {
      case "recenterCity":
        setCity(a.cityKey); // store updates selectedCityKey → map flies there
        break;
      case "openReport":
        router.push(`/reports/${a.reportId}`);
        break;
      case "filterCategory":
        setCatFilter(a.category);
        break;
      case "filterDepartment":
        setDeptFilter(a.department);
        break;
      case "nearMe":
        setFilters({ ...filters, nearMe: true });
        break;
      case "accessibility":
        setFilters({ ...filters, layer: "accessibility" });
        break;
      case "urgentOnly":
        setFilters({ ...filters, layer: "urgent" });
        break;
      case "text":
        setQuery(a.query);
        break;
    }
  }

  useEffect(() => {
    if (ready) loadIncidents(null);
  }, [ready, loadIncidents]);
  useEffect(() => {
    if (loc.point) loadIncidents(loc.point);
  }, [loc.point, loadIncidents]);

  // When the city changes, stop following the user and clear selection so
  // the map is free to fly to the new city (the map's FlyToCity handles it).
  const firstCity = useRef(true);
  useEffect(() => {
    if (firstCity.current) {
      firstCity.current = false;
      return;
    }
    setFollow(false);
    setSelectedId(undefined);
    setFocusId(undefined);
  }, [selectedCityKey]);

  // Tap a pin → select it, fly the map to it, and scroll its queue card
  // into view + highlight. Map and queue act as one system.
  function selectFromMap(id: string) {
    setSelectedId(id);
    setFocusId(id);
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const focusReport = useMemo(
    () => (focusId ? reports.find((r) => r.id === focusId) ?? null : null),
    [focusId, reports]
  );

  // Near Me → center the map on the user and sort the queue by distance.
  useEffect(() => {
    if (filters.nearMe) {
      if (loc.status !== "tracking") loc.start();
      setFollow(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.nearMe]);

  // Priority-ranked (severity-weighted) — independent of distance.
  const ranked = useMemo(
    () => [...reports].sort((a, b) => priorityForReport(b).total - priorityForReport(a).total),
    [reports]
  );
  const top = ranked.find((r) => r.status !== "Fixed");

  // Apply the MapControls filters: severity threshold, source, accessibility-only,
  // then order by near-me (if toggled + GPS) else by priority.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = reports.filter((r) => {
      // search-scoped filters (from the search bar)
      if (catFilter && r.category !== catFilter) return false;
      if (deptFilter && r.department !== deptFilter) return false;
      if (q) {
        const hay = `${r.category} ${r.locationName} ${r.spotDetails} ${r.caseId} ${r.department}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // map layer
      const confirms = r.jury.filter((j) => j.verdict === "Confirm").length;
      const isFixed = r.status === "Fixed" || r.status === "Verified fixed";
      if (filters.layer === "urgent" && priorityForReport(r).label !== "Urgent") return false;
      if (filters.layer === "accessibility" && r.analysis.accessibilityImpact === "None") return false;
      if (filters.layer === "verified" && !(confirms >= 1 || r.source === "community")) return false;
      if (filters.layer === "fixed" && !isFixed) return false;
      // severity threshold
      const sev = r.analysis.severity;
      if (filters.severity === "60" && sev < 60) return false;
      if (filters.severity === "80" && sev < 80) return false;
      // source
      if (filters.source === "311" && !THREE_ELEVEN.includes(r.source)) return false;
      if (filters.source === "user" && r.source !== "user" && r.source !== "uo") return false;
      if (filters.source === "community" && r.source !== "community") return false;
      // accessibility-only
      if (filters.accessibilityOnly && r.analysis.accessibilityImpact === "None") return false;
      return true;
    });

    const nearMeSort = filters.nearMe && loc.point;
    if (nearMeSort) {
      list = [...list].sort((a, b) => {
        const da = a.geo ? distanceKm(loc.point!, a.geo) : 9999;
        const db = b.geo ? distanceKm(loc.point!, b.geo) : 9999;
        return da - db;
      });
    } else {
      list = [...list].sort((a, b) => priorityForReport(b).total - priorityForReport(a).total);
    }
    return list;
  }, [reports, filters, loc.point, query, catFilter, deptFilter]);

  const searchActive = !!(query || catFilter || deptFilter);

  const nearbyReports = useMemo(() => {
    if (!loc.point) return reports.length;
    return reports.filter((r) => r.geo && distanceKm(loc.point!, r.geo) <= 3).length;
  }, [reports, loc.point]);

  const urgent = reports.filter(
    (r) => priorityForReport(r).label === "Urgent" && r.status !== "Fixed"
  ).length;

  const liveLabel =
    loc.status === "tracking" ? "Live" : loc.status === "locating" ? "Locating" : "Off";

  const showMap = filters.view === "map";

  function playBriefing() {
    if (!top) return;
    const p = priorityForReport(top);
    const briefingText =
      `Today's highest-priority issue is a ${top.category} at ${top.locationName}. ` +
      `It has ${top.duplicates} related reports, ${top.analysis.accessibilityImpact} accessibility impact, ` +
      `and severe obstruction risk. Recommended action: ` +
      suggestedTimeframe(p.label) +
      ".";
    setBriefing(true);
    speak(briefingText, voicePresetId);
    setTimeout(() => setBriefing(false), 8000);
  }

  return (
    <div className="flex h-full flex-col">
      {/* top bar */}
      <div className="z-30 border-b border-white/[0.08] bg-app-950/90 backdrop-blur">
        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <span className="text-[17px] font-bold tracking-tight text-white">
              Fix<span className="text-brand-400">First</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/leaderboard"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70"
              aria-label="Leaderboard"
            >
              <ChartIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/profile"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70"
              aria-label="Profile"
            >
              <UserIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* one-line purpose */}
        <p className="px-4 pb-2.5 text-[12px] text-white/50">What to fix first — ranked by urgency and impact.</p>
      </div>

      {/* city / data-source selector */}
      <CitySelector />

      {/* scroll body */}
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {/* global search — city, address, case ID, category, department, command */}
        <div className="px-3 pt-3">
          <SearchBar reports={reports} onAction={handleSearch} />
          {searchActive && (
            <button
              onClick={() => {
                setQuery("");
                setCatFilter(null);
                setDeptFilter(null);
              }}
              className="mt-2 inline-flex items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-200"
            >
              Filtered: {catFilter ?? deptFilter ?? `"${query}"`} · {filtered.length} result{filtered.length === 1 ? "" : "s"} · clear ✕
            </button>
          )}
        </div>

        {/* Today's Fix First — the #1 issue */}
        {top && <TodaysFixFirst report={top} onPlay={playBriefing} briefing={briefing} />}

        {/* civic snapshot — real percentages from the current queue */}
        <div className="px-3 pt-3">
          <CivicInsights reports={reports} cityLabel={city.selectorLabel} />
        </div>

        {/* map controls */}
        <MapControls filters={filters} setFilters={setFilters} />

        {/* map (hidden in List view) */}
        {showMap && (
          <div className="relative h-64 shrink-0">
            <LiveMap
              reports={filtered}
              userPoint={loc.point}
              selectedId={selectedId}
              onSelect={selectFromMap}
              follow={follow}
              cityKey={selectedCityKey}
              cityCenter={city.center}
              cityZoom={city.zoom}
              focusReport={focusReport}
            />

            <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-col items-start gap-1.5">
              <span className="chip border border-brand-500/30 bg-app-950/85 font-semibold text-brand-200 backdrop-blur">
                <MapPinIcon className="h-3 w-3" /> {city.selectorLabel}
              </span>
              <span className="chip border border-white/10 bg-app-950/80 text-white/85 backdrop-blur">
                <span className={`h-1.5 w-1.5 rounded-full ${loc.status === "tracking" ? "bg-live" : "bg-white/40"}`} />
                {liveLabel} location
              </span>
              <span className="chip border border-white/10 bg-app-950/80 text-white/85 backdrop-blur">
                {nearbyReports} nearby {nearbyReports === 1 ? "report" : "reports"}
              </span>
              {filters.heatmap && (
                <span className="chip border border-white/10 bg-app-950/80 text-white/60 backdrop-blur">
                  <FeedIcon className="h-3 w-3" /> Heatmap on
                </span>
              )}
              {filters.cluster && (
                <span className="chip border border-white/10 bg-app-950/80 text-white/60 backdrop-blur">
                  Clustered pins on
                </span>
              )}
            </div>

            {urgent > 0 && (
              <span className="pointer-events-none absolute right-3 top-3 z-[500] chip border border-red-500/30 bg-app-950/80 text-red-300 backdrop-blur">
                <BoltIcon className="h-3.5 w-3.5" /> {urgent} urgent
              </span>
            )}

            <button
              onClick={() => {
                if (loc.status !== "tracking") loc.start();
                setFollow((f) => (loc.status === "tracking" ? !f : true));
              }}
              className={`absolute bottom-3 right-3 z-[500] flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold shadow-lg transition active:scale-95 ${
                follow && loc.status === "tracking"
                  ? "bg-brand-600 text-white"
                  : "border border-white/15 bg-app-950/90 text-white/85 backdrop-blur"
              }`}
            >
              <CrosshairIcon className="h-4 w-4" />
              {loc.status === "denied"
                ? "Enable location"
                : loc.status !== "tracking"
                ? "Use my location"
                : follow
                ? "Following"
                : "Follow me"}
            </button>
          </div>
        )}

        {/* live location status + nearby context */}
        <LocationStatus loc={loc} reports={reports} />

        {/* your civic network */}
        <div className="px-3">
          <NetworkActivity />
        </div>

        {/* feed header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-app-950/95 px-4 py-2.5 backdrop-blur">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">Priority Queue</div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/45">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${feedMeta?.source === "open311-live" ? "bg-emerald-400" : "bg-white/40"}`} />
              <span className="truncate">
                {feedMeta?.source === "open311-live" ? "Live" : "Severity-weighted"} ·{" "}
                {feedMeta?.note ?? feedMeta?.city ?? "University of Oregon · Eugene"}
              </span>
            </div>
          </div>
          {loadingFeed && <span className="text-[11px] text-white/35">syncing…</span>}
        </div>

        <div className="space-y-2.5 p-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              ref={(el) => {
                cardRefs.current[r.id] = el;
              }}
              onMouseEnter={() => setSelectedId(r.id)}
              className={`scroll-mt-24 rounded-2xl transition ${
                selectedId === r.id ? "ring-2 ring-brand-500/70 ring-offset-2 ring-offset-app-black" : ""
              }`}
            >
              <IncidentCard report={r} userPoint={loc.point} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-sm text-white/45">
              {reports.length === 0
                ? "Loading the priority queue…"
                : "No reports match these filters."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TodaysFixFirst({ report, onPlay, briefing }: { report: Report; onPlay: () => void; briefing: boolean }) {
  const p = priorityForReport(report);
  const confirms = report.jury.filter((j) => j.verdict === "Confirm").length;
  return (
    <div className="mx-3 mt-3 overflow-hidden rounded-2xl border border-white/10 bg-app-900">
      <Link href={`/reports/${report.id}`} className="block p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-300">Today&apos;s Fix First</div>
        <div className="mt-1.5 text-lg font-bold leading-tight text-white">{report.category}</div>
        <div className="flex items-center gap-1 text-[12px] text-white/55">
          <MapPinIcon className="h-3.5 w-3.5" /> {report.locationName}
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <PriorityBadge label={p.label} size="sm" />
          <span className="text-[12px] text-white/55">Priority {p.total}</span>
        </div>
        <div className="mt-1 text-[12px] text-white/50">
          {report.duplicates} related{confirms > 0 ? ` · Verified by ${confirms}` : ""}
        </div>
      </Link>

      {briefing && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-brand-300">
          <VoiceWave className="h-4 text-brand-400" />
          <span className="text-[11px] text-white/55">Playing briefing…</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/[0.06] text-[12px] font-semibold">
        <Link href={`/reports/${report.id}`} className="bg-app-900 px-2 py-2.5 text-center text-brand-300">
          Open
        </Link>
        <button onClick={onPlay} className="bg-app-900 px-2 py-2.5 text-center text-white/75 active:bg-app-850">
          Briefing
        </button>
      </div>
    </div>
  );
}

