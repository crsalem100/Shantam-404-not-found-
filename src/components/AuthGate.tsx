"use client";

// ─────────────────────────────────────────────────────────────
// FixFirst — account gate (welcome / sign in / create / guest)
//
// Mocked auth for the MVP. Structured so a real provider (email +
// Google OAuth) drops in behind signIn()/createAccount(). Guests can
// browse; reporting/verifying/rewards require an account.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Firsty } from "./Firsty";
import { Logo, ArrowIcon, CheckIcon, CameraIcon, BoltIcon, StarIcon } from "./Icons";

const INTERESTS = ["Accessibility", "Night safety", "Bike lanes", "Sidewalks", "Trash / sanitation", "Campus safety", "Road hazards"];

const SLIDES = [
  {
    icon: CameraIcon,
    title: "Report hazards with photo, voice, and location.",
    body: "Show it, say it, drop a pin. Evidence makes reports trustworthy.",
  },
  {
    icon: BoltIcon,
    title: "FixFirst ranks what should be fixed first.",
    body: "A severity-weighted engine prioritizes real risk — not just the loudest reports.",
  },
  {
    icon: StarIcon,
    title: "Earn points and rewards when reports are verified or fixed.",
    body: "Civic impact points reward verified action, never spam.",
  },
];

export function AuthGate() {
  const { authStatus, signIn, createAccount, continueAsGuest } = useStore();
  const [step, setStep] = useState<"onboarding" | "welcome" | "signin" | "create">("onboarding");
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("University of Oregon · Eugene");
  const [area, setArea] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  // When a signed-in/guest user logs out, the gate reappears — drop them
  // on the welcome screen (not the onboarding slides they've already seen).
  const prevAuth = useRef(authStatus);
  useEffect(() => {
    if (prevAuth.current !== "none" && authStatus === "none") setStep("welcome");
    prevAuth.current = authStatus;
  }, [authStatus]);

  if (authStatus !== "none") return null;

  return (
    <div className="absolute inset-0 z-[60] overflow-y-auto bg-app-950">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-5 py-8">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-extrabold tracking-tight text-white">
            Fix<span className="text-brand-400">First</span>
          </span>
        </div>

        {step === "onboarding" && (
          <OnboardingSlides
            slide={slide}
            setSlide={setSlide}
            onDone={() => setStep("welcome")}
          />
        )}

        {step === "welcome" && (
          <div className="mt-10 flex flex-1 flex-col">
            <h1 className="text-3xl font-extrabold leading-tight text-white">
              A civic repair network for what should be fixed first.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Create an account to track your reports, earn civic impact points, verify hazards with
              friends, and unlock rewards.
            </p>
            <div className="mt-8 space-y-2.5">
              <button onClick={() => setStep("create")} className="btn-primary w-full py-3">
                Create account
              </button>
              <button onClick={() => setStep("signin")} className="btn-ghost w-full py-3">
                Sign in
              </button>
              <button
                onClick={continueAsGuest}
                className="w-full py-3 text-sm font-semibold text-white/55 hover:text-white/80"
              >
                Continue as guest
              </button>
            </div>
            <p className="mt-4 text-center text-[11px] text-white/35">
              Guests can browse the map. Reporting, verifying and rewards need an account.
            </p>
          </div>
        )}

        {step === "signin" && (
          <div className="mt-10">
            <button onClick={() => setStep("welcome")} className="text-sm text-white/50">
              ← Back
            </button>
            <h2 className="mt-4 text-2xl font-bold text-white">Welcome back</h2>
            <div className="mt-6 space-y-3">
              <div>
                <label className="field-label">Email</label>
                <input className="field-input" type="email" placeholder="you@uoregon.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button
                onClick={() => signIn({ name: email ? email.split("@")[0] : "You" })}
                className="btn-primary w-full py-3"
              >
                Sign in <ArrowIcon className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3 py-1 text-[11px] text-white/35">
                <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
              </div>
              {/* AUTH: real Google OAuth goes here */}
              <button onClick={() => signIn({ name: "You" })} className="btn-ghost w-full py-3">
                Continue with Google
              </button>
            </div>
          </div>
        )}

        {step === "create" && (
          <div className="mt-8">
            <button onClick={() => setStep("welcome")} className="text-sm text-white/50">
              ← Back
            </button>
            <h2 className="mt-4 text-2xl font-bold text-white">Set up your profile</h2>
            <div className="mt-5 space-y-3">
              <div>
                <label className="field-label">Name</label>
                <input className="field-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Username</label>
                <input className="field-input" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="field-label">City / campus</label>
                <input className="field-input" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Preferred reporting area <span className="font-normal text-white/35">(optional)</span></label>
                <input className="field-input" placeholder="e.g. 13th Ave, EMU" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Accessibility interests</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((it) => {
                    const on = interests.includes(it);
                    return (
                      <button
                        key={it}
                        type="button"
                        onClick={() => setInterests((arr) => (on ? arr.filter((x) => x !== it) : [...arr, it]))}
                        className={`chip border ${on ? "border-brand-500 bg-brand-500/15 text-brand-200" : "border-white/10 bg-app-850 text-white/60"}`}
                      >
                        {on && <CheckIcon className="h-3 w-3" />} {it}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() =>
                  createAccount({
                    name: name || "You",
                    username: username || undefined,
                    city,
                    preferredArea: area || undefined,
                    accessibilityInterests: interests,
                  })
                }
                className="btn-primary w-full py-3"
              >
                Create account <ArrowIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OnboardingSlides({
  slide,
  setSlide,
  onDone,
}: {
  slide: number;
  setSlide: (n: number) => void;
  onDone: () => void;
}) {
  const s = SLIDES[slide];
  const Icon = s.icon;
  const last = slide === SLIDES.length - 1;
  return (
    <div className="mt-6 flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div key={slide} className="animate-fade-up flex flex-col items-center">
          <Firsty className="h-28 w-28" bob />
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-3 py-1 text-brand-300">
            <Icon className="h-4 w-4" />
          </div>
          <h1 className="mt-4 max-w-xs text-2xl font-extrabold leading-tight text-white">{s.title}</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">{s.body}</p>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-brand-500" : "w-1.5 bg-white/25"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="space-y-2.5 pb-2">
        <button
          onClick={() => (last ? onDone() : setSlide(slide + 1))}
          className="btn-primary w-full py-3"
        >
          {last ? "Get started" : "Next"} <ArrowIcon className="h-4 w-4" />
        </button>
        <button onClick={onDone} className="w-full py-2 text-sm font-semibold text-white/45 hover:text-white/70">
          Skip
        </button>
      </div>
    </div>
  );
}
