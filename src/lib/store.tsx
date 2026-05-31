"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — client store (React context + localStorage)
//
// Holds: the user's own reports, the LIVE Open311 feed, the user's
// reputation profile, juror votes, and the chosen voice persona.
//
// SNOWFLAKE: every mutation here maps to a warehouse write; the live
// feed maps to an upsert + dedup. BACKBOARD: the profile + voice
// preference map to remembered user state.
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Analysis,
  AuthStatus,
  CommunityUpdate,
  GeoPoint,
  JurorVerdict,
  Report,
  ReportStatus,
  UserProfile,
} from "./types";
import { getSeedReports } from "./mockData";
import { buildReport, buildCityReports } from "./reportFactory";
import { cityByKey } from "./cities";
import { userById, teamById } from "./social";
import { pointsForSubmission, POINTS } from "./reputation";

const KEY_REPORTS = "fixfirst.userReports.v2";
const KEY_USER = "fixfirst.user.v2";
const KEY_VOICE = "fixfirst.voice.v2";
const KEY_SOCIAL = "fixfirst.social.v1";

export interface FeedMeta {
  city: string;
  source: string;
  distanceKm: number;
  nearbyCoverage: boolean;
  note?: string;
}

interface StoreValue {
  userReports: Report[];
  liveIncidents: Report[];
  reports: Report[]; // combined
  ready: boolean;
  user: UserProfile;
  voicePresetId: string;
  feedMeta: FeedMeta | null;
  loadingFeed: boolean;
  selectedCityKey: string;
  // auth + civic network
  authStatus: AuthStatus;
  isAuthed: boolean;
  friends: string[];
  friendRequests: string[];
  joinedTeams: string[];
  getReport: (id: string) => Report | undefined;
  addReport: (r: Report) => void;
  updateStatus: (id: string, status: ReportStatus) => void;
  addCommunityUpdate: (id: string, update: CommunityUpdate) => void;
  castJurorVote: (id: string, verdict: JurorVerdict) => void;
  setVoicePreset: (id: string) => void;
  loadIncidents: (point: GeoPoint | null) => Promise<void>;
  setCity: (key: string) => void;
  resetDemo: () => void;
  // account actions
  continueAsGuest: () => void;
  signIn: (profile: Partial<UserProfile>) => void;
  createAccount: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  // friends + teams
  sendFriendRequest: (id: string) => void;
  acceptFriendRequest: (id: string) => void;
  declineFriendRequest: (id: string) => void;
  joinTeam: (id: string) => void;
  leaveTeam: (id: string) => void;
  askFriendsToVerify: (reportId: string, friendIds: string[]) => void;
}

const DEFAULT_USER: UserProfile = {
  name: "You",
  reputation: 240,
  reportsFiled: 4,
  jurorVotesCast: 7,
  confirmedReports: 3,
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [liveIncidents, setLiveIncidents] = useState<Report[]>([]);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [voicePresetId, setVoicePresetId] = useState("marcus");
  const [feedMeta, setFeedMeta] = useState<FeedMeta | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [selectedCityKey, setSelectedCityKey] = useState("uo");
  const [authStatus, setAuthStatus] = useState<AuthStatus>("none");
  const [friends, setFriends] = useState<string[]>(["maya", "devon"]);
  const [friendRequests, setFriendRequests] = useState<string[]>(["priya"]);
  const [joinedTeams, setJoinedTeams] = useState<string[]>(["uo-accessibility-watch"]);
  const [ready, setReady] = useState(false);

  // hydrate
  useEffect(() => {
    try {
      const r = localStorage.getItem(KEY_REPORTS);
      setUserReports(r ? (JSON.parse(r) as Report[]) : getSeedReports());
      const u = localStorage.getItem(KEY_USER);
      if (u) setUser(JSON.parse(u) as UserProfile);
      const v = localStorage.getItem(KEY_VOICE);
      if (v) setVoicePresetId(v);
      const s = localStorage.getItem(KEY_SOCIAL);
      if (s) {
        const social = JSON.parse(s);
        if (social.authStatus) setAuthStatus(social.authStatus);
        if (social.friends) setFriends(social.friends);
        if (social.friendRequests) setFriendRequests(social.friendRequests);
        if (social.joinedTeams) setJoinedTeams(social.joinedTeams);
      }
    } catch {
      setUserReports(getSeedReports());
    }
    setReady(true);
  }, []);

  // persist
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY_REPORTS, JSON.stringify(userReports));
      localStorage.setItem(KEY_USER, JSON.stringify(user));
      localStorage.setItem(KEY_VOICE, voicePresetId);
      localStorage.setItem(
        KEY_SOCIAL,
        JSON.stringify({ authStatus, friends, friendRequests, joinedTeams })
      );
    } catch {
      /* ignore quota */
    }
  }, [userReports, user, voicePresetId, authStatus, friends, friendRequests, joinedTeams, ready]);

  const reports = useMemo(() => {
    const seen = new Set<string>();
    const out: Report[] = [];
    for (const r of [...userReports, ...liveIncidents]) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
    }
    return out;
  }, [userReports, liveIncidents]);

  const getReport = useCallback(
    (id: string) => reports.find((r) => r.id === id),
    [reports]
  );

  const mutate = useCallback(
    (id: string, fn: (r: Report) => Report) => {
      setUserReports((prev) => prev.map((r) => (r.id === id ? fn(r) : r)));
      setLiveIncidents((prev) => prev.map((r) => (r.id === id ? fn(r) : r)));
    },
    []
  );

  const addReport = useCallback((r: Report) => {
    setUserReports((prev) => [r, ...prev]);
    const pts = pointsForSubmission(r);
    setUser((u) => ({
      ...u,
      reputation: u.reputation + pts,
      reportsFiled: u.reportsFiled + 1,
    }));
  }, []);

  const updateStatus = useCallback(
    (id: string, status: ReportStatus) => {
      mutate(id, (r) => ({
        ...r,
        status,
        daysUnresolved: status === "Fixed" ? 0 : r.daysUnresolved,
        updatedAt: new Date().toISOString(),
      }));
      if (status === "Fixed")
        setUser((u) => ({ ...u, reputation: u.reputation + POINTS.markFixed }));
    },
    [mutate]
  );

  const addCommunityUpdate = useCallback(
    (id: string, update: CommunityUpdate) => {
      mutate(id, (r) => {
        const status: ReportStatus =
          update.type === "Fixed" || update.type === "Verified fixed" ? "Fixed" : r.status;
        // "I saw this", "Still broken", "Worse" are corroborating signals —
        // they grow the duplicate cluster and nudge the priority score.
        const duplicates =
          update.type === "Still broken" || update.type === "Worse" || update.type === "I saw this"
            ? r.duplicates + 1
            : r.duplicates;
        return {
          ...r,
          status,
          duplicates,
          daysUnresolved: status === "Fixed" ? 0 : r.daysUnresolved,
          community: [update, ...r.community],
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [mutate]
  );

  const castJurorVote = useCallback(
    (id: string, verdict: JurorVerdict) => {
      mutate(id, (r) => {
        const without = r.jury.filter((j) => j.juror !== "You");
        return {
          ...r,
          jury: [{ juror: "You", verdict, at: new Date().toISOString() }, ...without],
        };
      });
      setUser((u) => ({
        ...u,
        reputation: u.reputation + POINTS.verifyOther,
        jurorVotesCast: u.jurorVotesCast + 1,
      }));
    },
    [mutate]
  );

  const setVoicePreset = useCallback((id: string) => setVoicePresetId(id), []);

  const loadIncidents = useCallback(async (point: GeoPoint | null) => {
    setLoadingFeed(true);
    try {
      const qs = point ? `?lat=${point.lat}&lng=${point.lng}` : "";
      const res = await fetch(`/api/incidents${qs}`);
      const data = await res.json();
      setLiveIncidents((data.incidents ?? []) as Report[]);
      setFeedMeta({
        city: data.city,
        source: data.source,
        distanceKm: data.distanceKm,
        nearbyCoverage: data.nearbyCoverage,
        note: data.note,
      });
    } catch {
      setFeedMeta(null);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  // City/data-source selector. UO goes through the live/GPS path; other
  // cities load through their adapter (/api/city) which attempts REAL
  // open data (SF/NYC/Chicago 311) and falls back to a labeled snapshot.
  const setCity = useCallback(
    (key: string) => {
      setSelectedCityKey(key);
      if (key === "uo") {
        loadIncidents(null);
        return;
      }
      const c = cityByKey(key);
      // Optimistic: show the scored snapshot immediately so the map/queue
      // never go blank while the live fetch resolves.
      setLoadingFeed(true);
      setLiveIncidents(buildCityReports(key));
      setFeedMeta({
        city: c.name,
        source: "snapshot",
        distanceKm: 0,
        nearbyCoverage: false,
        note: `${c.selectorLabel} · loading…`,
      });
      (async () => {
        try {
          const res = await fetch(`/api/city?key=${encodeURIComponent(key)}`);
          const data = await res.json();
          if ((data.incidents ?? []).length > 0) setLiveIncidents(data.incidents as Report[]);
          setFeedMeta({
            city: data.city ?? c.name,
            source: data.live ? "open311-live" : "snapshot",
            distanceKm: 0,
            nearbyCoverage: false,
            note: data.sourceLabel,
          });
        } catch {
          setFeedMeta({
            city: c.name,
            source: "snapshot",
            distanceKm: 0,
            nearbyCoverage: false,
            note: "Demo data modeled after 311 reports",
          });
        } finally {
          setLoadingFeed(false);
        }
      })();
    },
    [loadIncidents]
  );

  // ── auth ─────────────────────────────────────────────────
  const continueAsGuest = useCallback(() => setAuthStatus("guest"), []);
  const signIn = useCallback((profile: Partial<UserProfile>) => {
    setAuthStatus("authed");
    setUser((u) => ({ ...u, ...profile }));
  }, []);
  const createAccount = useCallback((profile: Partial<UserProfile>) => {
    setAuthStatus("authed");
    setUser((u) => ({ ...u, ...profile }));
  }, []);
  const logout = useCallback(() => setAuthStatus("none"), []);
  const updateProfile = useCallback(
    (profile: Partial<UserProfile>) => setUser((u) => ({ ...u, ...profile })),
    []
  );

  // ── friends + teams ──────────────────────────────────────
  const sendFriendRequest = useCallback(
    (id: string) => setFriends((f) => (f.includes(id) ? f : [...f, id])),
    []
  );
  const acceptFriendRequest = useCallback((id: string) => {
    setFriends((f) => (f.includes(id) ? f : [...f, id]));
    setFriendRequests((q) => q.filter((x) => x !== id));
  }, []);
  const declineFriendRequest = useCallback(
    (id: string) => setFriendRequests((q) => q.filter((x) => x !== id)),
    []
  );
  const joinTeam = useCallback(
    (id: string) => setJoinedTeams((t) => (t.includes(id) ? t : [...t, id])),
    []
  );
  const leaveTeam = useCallback(
    (id: string) => setJoinedTeams((t) => t.filter((x) => x !== id)),
    []
  );

  // Friend-based verification: invited friends corroborate the report,
  // raising its confidence (report score) and growing the cluster.
  const askFriendsToVerify = useCallback(
    (reportId: string, friendIds: string[]) => {
      const names = friendIds
        .map((id) => userById(id)?.name ?? teamById(id)?.name)
        .filter(Boolean) as string[];
      if (names.length === 0) return;
      mutate(reportId, (r) => {
        const at = new Date().toISOString();
        const newVotes = names.map((n) => ({
          juror: n,
          verdict: "Confirm" as JurorVerdict,
          at,
        }));
        const newUpdates: CommunityUpdate[] = names.map((n) => ({
          type: "I saw this",
          at,
          by: n,
        }));
        return {
          ...r,
          duplicates: r.duplicates + names.length,
          jury: [...newVotes, ...r.jury.filter((j) => !names.includes(j.juror))],
          community: [...newUpdates, ...r.community],
          updatedAt: at,
        };
      });
    },
    [mutate]
  );

  const resetDemo = useCallback(() => {
    setUserReports(getSeedReports());
    setUser(DEFAULT_USER);
    setAuthStatus("none");
    setFriends(["maya", "devon"]);
    setFriendRequests(["priya"]);
    setJoinedTeams(["uo-accessibility-watch"]);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      userReports,
      liveIncidents,
      reports,
      ready,
      user,
      voicePresetId,
      feedMeta,
      loadingFeed,
      selectedCityKey,
      authStatus,
      isAuthed: authStatus === "authed",
      friends,
      friendRequests,
      joinedTeams,
      getReport,
      addReport,
      updateStatus,
      addCommunityUpdate,
      castJurorVote,
      setVoicePreset,
      loadIncidents,
      setCity,
      resetDemo,
      continueAsGuest,
      signIn,
      createAccount,
      logout,
      updateProfile,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      joinTeam,
      leaveTeam,
      askFriendsToVerify,
    }),
    [
      userReports,
      liveIncidents,
      reports,
      ready,
      user,
      voicePresetId,
      feedMeta,
      loadingFeed,
      selectedCityKey,
      authStatus,
      friends,
      friendRequests,
      joinedTeams,
      getReport,
      addReport,
      updateStatus,
      addCommunityUpdate,
      castJurorVote,
      setVoicePreset,
      loadIncidents,
      setCity,
      resetDemo,
      continueAsGuest,
      signIn,
      createAccount,
      logout,
      updateProfile,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      joinTeam,
      leaveTeam,
      askFriendsToVerify,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

// Build a fresh user-submitted Report from the form + analysis.
export function makeReport(args: {
  category: Report["category"];
  locationName: string;
  spotDetails: string;
  description: string;
  photoDataUrl?: string;
  videoDataUrl?: string;
  audioDataUrl?: string;
  hasVoiceNote: boolean;
  analysis: Analysis;
  geo?: GeoPoint;
}): Report {
  const id = `me-${Math.abs(hashStr(args.locationName + args.spotDetails + args.description)).toString(36)}`;
  return buildReport({
    id,
    source: "user",
    category: args.category,
    locationName: args.locationName,
    spotDetails: args.spotDetails,
    description: args.description,
    createdAt: new Date().toISOString(),
    duplicates: 0,
    photoDataUrl: args.photoDataUrl,
    videoDataUrl: args.videoDataUrl,
    audioDataUrl: args.audioDataUrl,
    hasVoiceNote: args.hasVoiceNote,
    geo: args.geo,
    analysisOverride: args.analysis,
  });
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
