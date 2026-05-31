"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPinIcon, FeedIcon, ChartIcon, UserIcon, PlusIcon } from "./Icons";

const TABS = [
  { href: "/", label: "Map", icon: MapPinIcon, match: (p: string) => p === "/" },
  { href: "/feed", label: "Queue", icon: FeedIcon, match: (p: string) => p.startsWith("/feed") },
  { href: "/dashboard", label: "Facilities", icon: ChartIcon, match: (p: string) => p.startsWith("/dashboard") },
  { href: "/profile", label: "Profile", icon: UserIcon, match: (p: string) => p.startsWith("/profile") },
];

export function BottomTabBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-white/10 bg-app-900/95 backdrop-blur">
      <div className="relative grid grid-cols-5 items-center px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {TABS.slice(0, 2).map((t) => (
          <TabLink key={t.href} {...t} active={t.match(pathname)} />
        ))}

        {/* center report FAB */}
        <div className="flex justify-center">
          <Link
            href="/report"
            aria-label="Report a hazard"
            className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/40 ring-4 ring-app-900 transition active:scale-95 hover:bg-brand-500"
          >
            <PlusIcon className="h-7 w-7" />
          </Link>
        </div>

        {TABS.slice(2).map((t) => (
          <TabLink key={t.href} {...t} active={t.match(pathname)} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: (p: { className?: string }) => JSX.Element;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium transition ${
        active ? "text-brand-400" : "text-white/45 hover:text-white/70"
      }`}
    >
      <Icon className="h-[22px] w-[22px]" />
      {label}
    </Link>
  );
}
