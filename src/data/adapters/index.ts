// ─────────────────────────────────────────────────────────────
// FixFirst — data-source adapter registry
//
// One adapter per civic dataset. `isReal` marks sources that pull a
// genuine open-data endpoint (SF / NYC / Chicago 311) vs. honestly
// labeled demo data (UO). The /api/city route consults this registry,
// attempts the live fetch, and falls back to a labeled snapshot so the
// demo never breaks — while always telling the truth about provenance.
// ─────────────────────────────────────────────────────────────

import type { NormalizedReport } from "../normalizeReport";
import { fetchNyc311, SOURCE_LABEL as NYC_LABEL } from "./nyc311";
import { fetchChicago311, SOURCE_LABEL as CHI_LABEL } from "./chicago311";
import { fetchSf311, SOURCE_LABEL as SF_LABEL } from "./sf311";
import { fetchMockUO, SOURCE_LABEL as UO_LABEL } from "./mockUO";

export interface CityAdapter {
  key: string; // matches CityDataset.key in lib/cities.ts
  liveLabel: string; // honest label when live rows are returned
  snapshotLabel: string; // honest label when falling back
  isReal: boolean; // pulls a real open-data endpoint
  fetchNormalized: (limit?: number) => Promise<NormalizedReport[]>;
}

export const ADAPTERS: Record<string, CityAdapter> = {
  sf311: {
    key: "sf311",
    liveLabel: SF_LABEL,
    snapshotLabel: "Demo data modeled after SF 311 reports",
    isReal: true,
    fetchNormalized: fetchSf311,
  },
  nyc311: {
    key: "nyc311",
    liveLabel: NYC_LABEL,
    snapshotLabel: "Demo data modeled after NYC 311 reports",
    isReal: true,
    fetchNormalized: fetchNyc311,
  },
  chicago311: {
    key: "chicago311",
    liveLabel: CHI_LABEL,
    snapshotLabel: "Demo data modeled after Chicago 311 reports",
    isReal: true,
    fetchNormalized: fetchChicago311,
  },
  uo: {
    key: "uo",
    liveLabel: UO_LABEL,
    snapshotLabel: UO_LABEL,
    isReal: false,
    fetchNormalized: fetchMockUO,
  },
};

export function getAdapter(key: string): CityAdapter | undefined {
  return ADAPTERS[key];
}
