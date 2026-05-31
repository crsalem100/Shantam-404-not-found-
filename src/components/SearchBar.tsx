"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — global search bar with autocomplete
//
// One field over the whole platform: recenter a city, jump to a case
// ID or report, apply a queue filter (category / department), or run an
// operational command ("near me", "urgent", "accessibility"). Suggestions
// come from lib/search; the parent turns a chosen action into navigation.
// ─────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildSuggestions,
  resolveSuggestion,
  RECENT_PLACEHOLDERS,
  type SearchAction,
  type SearchSuggestion,
} from "@/lib/search";
import type { Report } from "@/lib/types";
import {
  MapPinIcon,
  CategoryIcon,
  ShieldIcon,
  BoltIcon,
  CrosshairIcon,
  AccessibilityIcon,
  CloseIcon,
} from "./Icons";

export function SearchBar({
  reports,
  onAction,
  placeholder = "Search city, case ID, category, or command",
}: {
  reports: Report[];
  onAction: (a: SearchAction) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim();
  const suggestions = useMemo(() => buildSuggestions(query, reports), [query, reports]);
  const showRecent = q.length === 0;
  const list = showRecent ? RECENT_PLACEHOLDERS : suggestions;

  // Close the dropdown when clicking outside the search field.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(s: SearchSuggestion) {
    onAction(resolveSuggestion(s));
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        choose(suggestions[0]);
      } else if (q.length > 0) {
        onAction({ type: "text", query: q });
        setOpen(false);
        inputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  function clear() {
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-app-850 px-3.5 py-2.5 shadow-sm focus-within:border-brand-500/60">
        <MagnifierIcon className="h-4 w-4 shrink-0 text-white/40" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          aria-label="Search FixFirst"
          autoComplete="off"
          spellCheck={false}
        />
        {query.length > 0 && (
          <button
            onClick={clear}
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white/70"
            aria-label="Clear search"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="no-scrollbar absolute left-0 right-0 top-full z-[60] mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-app-900/95 p-1.5 shadow-2xl backdrop-blur">
          {showRecent && (
            <div className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Recent &amp; nearby
            </div>
          )}
          {list.length === 0 ? (
            <div className="px-2.5 py-4 text-center text-[12px] text-white/45">
              No matches. Press Enter to search “{q}”.
            </div>
          ) : (
            list.map((s) => <SuggestionRow key={s.id} s={s} onClick={() => choose(s)} />)
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionRow({ s, onClick }: { s: SearchSuggestion; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-white/[0.06]"
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tint(s.kind)}`}>
        <KindIcon s={s} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-white">{s.label}</div>
        {s.sublabel && <div className="truncate text-[11px] text-white/45">{s.sublabel}</div>}
      </div>
      <span className="shrink-0 text-[9.5px] font-semibold uppercase tracking-wide text-white/30">
        {kindLabel(s.kind)}
      </span>
    </button>
  );
}

function KindIcon({ s }: { s: SearchSuggestion }) {
  const cls = "h-4 w-4";
  switch (s.kind) {
    case "city":
      return <MapPinIcon className={cls} />;
    case "category": {
      const cat = s.payload?.category;
      const Icon = cat && CategoryIcon[cat as keyof typeof CategoryIcon];
      return Icon ? <Icon className={cls} /> : <MapPinIcon className={cls} />;
    }
    case "department":
      return <ShieldIcon className={cls} />;
    case "caseId":
    case "report":
      return <MapPinIcon className={cls} />;
    case "command": {
      const t = (s.payload as SearchAction)?.type;
      if (t === "nearMe") return <CrosshairIcon className={cls} />;
      if (t === "accessibility") return <AccessibilityIcon className={cls} />;
      return <BoltIcon className={cls} />;
    }
    default:
      return <MapPinIcon className={cls} />;
  }
}

function tint(kind: SearchSuggestion["kind"]): string {
  switch (kind) {
    case "city":
      return "bg-brand-500/15 text-brand-300";
    case "category":
      return "bg-emerald-500/15 text-emerald-300";
    case "department":
      return "bg-white/10 text-white/70";
    case "command":
      return "bg-yellow-500/15 text-yellow-300";
    case "caseId":
    case "report":
    default:
      return "bg-white/10 text-white/70";
  }
}

function kindLabel(kind: SearchSuggestion["kind"]): string {
  switch (kind) {
    case "city":
      return "City";
    case "category":
      return "Filter";
    case "department":
      return "Dept";
    case "caseId":
      return "Case";
    case "report":
      return "Report";
    case "command":
      return "Action";
    default:
      return "";
  }
}

// Inline magnifier — the only icon not in Icons.tsx, drawn locally
// per the search-field spec.
function MagnifierIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
