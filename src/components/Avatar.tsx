"use client";

import { avatarFor } from "@/lib/social";

export function Avatar({
  name,
  size = 40,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const { initials, color } = avatarFor(name);
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${className}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}
