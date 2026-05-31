"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { MOCK_USERS, userById } from "@/lib/social";
import { shareContent, INVITE_TEXT } from "@/lib/share";
import { Avatar } from "@/components/Avatar";
import { AppHeader } from "@/components/ui";
import { ShieldIcon, CheckIcon, CloseIcon, ArrowIcon, BoltIcon } from "@/components/Icons";
import type { PublicUser } from "@/lib/social";

export default function FriendsPage() {
  const {
    friends, friendRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest,
  } = useStore();
  const [query, setQuery] = useState("");

  const friendUsers = useMemo(() => friends.map(userById).filter(Boolean) as PublicUser[], [friends]);
  const requestUsers = useMemo(() => friendRequests.map(userById).filter(Boolean) as PublicUser[], [friendRequests]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_USERS.filter(
      (u) => !friends.includes(u.id) && (u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
    );
  }, [query, friends]);

  return (
    <div className="pb-4">
      <AppHeader
        title="Civic network"
        subtitle={`${friendUsers.length} friends`}
        right={
          <button
            onClick={() => shareContent({ title: "Join me on FixFirst", text: INVITE_TEXT })}
            className="btn-ghost text-xs"
          >
            Invite
          </button>
        }
      />

      <div className="space-y-4 p-4">
        {/* search */}
        <input
          className="field-input"
          placeholder="Search people by name or username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {results.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Results</div>
            {results.map((u) => (
              <div key={u.id} className="card flex items-center gap-3 p-3">
                <Avatar name={u.name} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{u.name}</div>
                  <div className="text-[11px] text-white/45">@{u.username} · {u.reputation} pts</div>
                </div>
                <button onClick={() => sendFriendRequest(u.id)} className="btn-primary px-3 py-1.5 text-xs">
                  Add friend
                </button>
              </div>
            ))}
          </div>
        )}

        {/* incoming requests */}
        {requestUsers.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Friend requests</div>
            {requestUsers.map((u) => (
              <div key={u.id} className="card flex items-center gap-3 p-3">
                <Avatar name={u.name} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{u.name}</div>
                  <div className="text-[11px] text-white/45">wants to connect</div>
                </div>
                <button onClick={() => acceptFriendRequest(u.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white">
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button onClick={() => declineFriendRequest(u.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/70">
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* friends list */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Your friends</div>
          {friendUsers.length === 0 && (
            <div className="card p-6 text-center text-sm text-white/50">
              Search above to add your first friend.
            </div>
          )}
          {friendUsers.map((u) => (
            <FriendCard key={u.id} user={u} />
          ))}
        </div>

        <Link href="/teams" className="card flex items-center gap-3 p-3.5 hover:border-white/20">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
            <ShieldIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">Civic teams</div>
            <div className="text-[11px] text-white/50">Join a team and amplify your impact</div>
          </div>
          <ArrowIcon className="h-4 w-4 text-white/40" />
        </Link>

        <p className="text-[11px] leading-relaxed text-white/40">
          Exact location is never shared with friends by default. Friends can verify your reports but cannot track you live.
        </p>
      </div>
    </div>
  );
}

function FriendCard({ user }: { user: PublicUser }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-3 text-left">
        <Avatar name={user.name} size={42} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{user.name}</div>
          <div className="text-[11px] text-white/45">{user.city} · {user.reputation} pts</div>
        </div>
        <span className="chip border border-white/[0.08] bg-white/[0.04] text-white/60">
          <ShieldIcon className="h-3 w-3 text-emerald-300" /> {user.reportsLedToFix} fixes
        </span>
      </button>
      {open && (
        <div className="border-t border-white/[0.06] px-3 py-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Mini label="Reports" value={user.reportsFiled} />
            <Mini label="Verifications" value={user.verifications} />
            <Mini label="Led to fixes" value={user.reportsLedToFix} />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {user.badges.map((b) => (
              <span key={b} className="chip border border-white/[0.08] bg-white/[0.04] text-white/60">
                <BoltIcon className="h-3 w-3 text-brand-300" /> {b}
              </span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button className="btn-ghost py-2 text-xs">Message</button>
            <Link href="/teams" className="btn-ghost py-2 text-xs">Invite to team</Link>
            <button
              onClick={() => shareContent({ title: `${user.name} on FixFirst`, text: `${user.name} is verifying public-space hazards on FixFirst.` })}
              className="btn-ghost py-2 text-xs"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-app-850 p-2">
      <div className="text-base font-bold tabular-nums text-white">{value}</div>
      <div className="text-[10px] text-white/45">{label}</div>
    </div>
  );
}
