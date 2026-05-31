"use client";

// Client wrapper: loads the real Leaflet map only in the browser
// (Leaflet touches window, so SSR is disabled).

import dynamic from "next/dynamic";
import type { GeoPoint, Report } from "@/lib/types";
import { Firsty } from "./Firsty";

const LiveMapLeaflet = dynamic(() => import("./LiveMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-app-black">
      <div className="flex flex-col items-center gap-2 text-xs text-white/45">
        <Firsty className="h-12 w-12" bob />
        Firsty is checking nearby 311 reports…
      </div>
    </div>
  ),
});

export function LiveMap(props: {
  reports: Report[];
  userPoint: GeoPoint | null;
  selectedId?: string;
  onSelect?: (id: string) => void;
  follow?: boolean;
  cityKey?: string;
  cityCenter?: GeoPoint;
  cityZoom?: number;
  focusReport?: Report | null;
}) {
  return <LiveMapLeaflet {...props} />;
}
