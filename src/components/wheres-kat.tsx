import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from "react";
import { Crosshair, Maximize2, RotateCcw, Volume2, VolumeX, ZoomIn, ZoomOut } from "lucide-react";
import {
  IMG_H,
  IMG_W,
  SCENES,
  TELLS,
  formatTime,
  rankFor,
  readBest,
  writeBest,
  type Scene,
} from "@/game/scenes";
import { isMuted, playBlip, playFound, playMiss, resumeAudio, setMuted, unlockAudio } from "@/game/audio";

type Phase = "title" | "hunt" | "celebrate" | "victory";
type Stamp = { id: number; x: number; y: number };
type Result = { id: string; title: string; ms: number; misses: number };

const MISS_MS = 5000;
const HINT_MS = 12000;

function prefersReduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function WheresKat() {
  const [phase, setPhase] = useState<Phase>("title");
  const [index, setIndex] = useState(0);
  const [found, setFound] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintMsg, setHintMsg] = useState<string | null>(null);
  const [intro, setIntro] = useState<string | null>(null);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [missCount, setMissCount] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [best, setBest] = useState<number | null>(null);
  const [muted, setMutedUi] = useState(false);
  const [ready, setReady] = useState(false);
  const [shake, setShake] = useState(false);
  const [showDance, setShowDance] = useState(false);
  const [clock, setClock] = useState("0:00");
  const [needsTap, setNeedsTap] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const slopRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const view = useRef({ x: 0, y: 0, scale: 1 });
  const elapsedRef = useRef(0);
  const runningRef = useRef(false);
  const foundRef = useRef(false);
  const missRef = useRef(0);
  const stampId = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ x: 0, y: 0, moved: false, pinch: 0 });

  const scene = SCENES[index] ?? SCENES[0];

  useEffect(() => {
    setBest(readBest());
    for (const s of SCENES) {
      const img = new Image();
      img.src = s.src;
    }
    const kat = new Image();
    kat.src = "/game/kat.png";
    const onVis = () => {
      if (document.visibilityState === "visible") resumeAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      if (runningRef.current) {
        elapsedRef.current += dt;
        acc += dt;
        if (acc > 90) {
          acc = 0;
          setClock(formatTime(elapsedRef.current));
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function fitScale() {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect || rect.width < 2 || rect.height < 2) return 0.4;
    return Math.min(rect.width / IMG_W, rect.height / IMG_H);
  }

  function updateSlop() {
    const slop = slopRef.current;
    if (!slop) return;
    const visual = scene.w * IMG_W * view.current.scale;
    const extra = Math.max(0, (48 - visual) / 2 / view.current.scale);
    slop.style.inset = `${-extra}px`;
  }

  function apply(animate: boolean) {
    const world = worldRef.current;
    if (!world) return;
    world.style.transition =
      animate && !prefersReduced() ? "transform 680ms cubic-bezier(.2,.8,.2,1)" : "none";
    const v = view.current;
    world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.scale})`;
    updateSlop();
    if (animate) {
      window.setTimeout(() => {
        if (worldRef.current) worldRef.current.style.transition = "none";
      }, 720);
    }
  }

  function clampScale(next: number) {
    const fit = fitScale();
    return Math.min(Math.max(next, fit * 0.92), Math.max(fit * 7, 2.2));
  }

  function clampPan() {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const v = view.current;
    const w = IMG_W * v.scale;
    const h = IMG_H * v.scale;
    const margin = 36;
    if (w <= rect.width) v.x = (rect.width - w) / 2;
    else v.x = Math.min(margin, Math.max(rect.width - w - margin, v.x));
    if (h <= rect.height) v.y = (rect.height - h) / 2;
    else v.y = Math.min(margin, Math.max(rect.height - h - margin, v.y));
  }

  function zoomAt(sx: number, sy: number, next: number, animate = false) {
    const s = clampScale(next);
    const v = view.current;
    const wx = (sx - v.x) / v.scale;
    const wy = (sy - v.y) / v.scale;
    v.scale = s;
    v.x = sx - wx * s;
    v.y = sy - wy * s;
    clampPan();
    apply(animate);
  }

  function focus(fx: number, fy: number, scale: number, animate: boolean) {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const v = view.current;
    v.scale = clampScale(scale);
    v.x = rect.width / 2 - fx * IMG_W * v.scale;
    v.y = rect.height / 2 - fy * IMG_H * v.scale;
    clampPan();
    apply(animate);
  }

  useEffect(() => {
    if (phase !== "hunt") return;
    setReady(false);
    setFound(false);
    foundRef.current = false;
    setHintUsed(false);
    setHintMsg(null);
    setStamps([]);
    setIntro(scene.intro);
    elapsedRef.current = 0;
    setClock("0:00");
    const hide = window.setTimeout(() => setIntro(null), 3200);
    const id = requestAnimationFrame(() => {
      const fit = fitScale();
      const start = Math.min(Math.max(fit * 1.65, 0.5), 2.2);
      focus(scene.lookX, scene.lookY, start, false);
      runningRef.current = true;
      setReady(true);
    });
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(hide);
      runningRef.current = false;
    };
    // scene fields are keyed by index
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || phase !== "hunt") return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.14 : 1 / 1.14;
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, view.current.scale * factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // zoomAt closes over the current scene via updateSlop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  useEffect(() => {
    if (phase !== "hunt") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") view.current.x += 48;
      else if (e.key === "ArrowRight") view.current.x -= 48;
      else if (e.key === "ArrowUp") view.current.y += 48;
      else if (e.key === "ArrowDown") view.current.y -= 48;
      else if (e.key === "+" || e.key === "=") {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (rect) zoomAt(rect.width / 2, rect.height / 2, view.current.scale * 1.2);
        return;
      } else if (e.key === "-" || e.key === "_") {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (rect) zoomAt(rect.width / 2, rect.height / 2, view.current.scale / 1.2);
        return;
      } else if (e.key === "0") {
        focus(0.5, 0.5, fitScale(), true);
        return;
      } else if (e.key.toLowerCase() === "h") {
        onHint();
        return;
      } else return;
      clampPan();
      apply(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, hintUsed]);

  function bumpClock(extra: number) {
    elapsedRef.current += extra;
    setClock(formatTime(elapsedRef.current));
  }

  function onFound() {
    if (foundRef.current) return;
    foundRef.current = true;
    runningRef.current = false;
    unlockAudio();
    playFound();
    setFound(true);
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
    const fit = fitScale();
    focus(scene.x, scene.y, Math.max(view.current.scale * 1.45, fit * 2.6), true);
    setResults((prev) => [
      ...prev,
      { id: scene.id, title: scene.title, ms: elapsedRef.current, misses: missRef.current },
    ]);
    window.setTimeout(() => setPhase("celebrate"), 700);
  }

  function onMiss(fx: number, fy: number) {
    unlockAudio();
    playMiss();
    missRef.current += 1;
    setMissCount(missRef.current);
    bumpClock(MISS_MS);
    const id = ++stampId.current;
    setStamps((prev) => [...prev.slice(-7), { id, x: fx, y: fy }]);
    window.setTimeout(() => {
      setStamps((prev) => prev.filter((s) => s.id !== id));
    }, 860);
  }

  function handleTap(clientX: number, clientY: number) {
    if (!runningRef.current || foundRef.current) return;
    const hit = document.elementFromPoint(clientX, clientY);
    if (hit instanceof Element && hit.closest("[data-kat]")) {
      onFound();
      return;
    }
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const v = view.current;
    const wx = (sx - v.x) / v.scale;
    const wy = (sy - v.y) / v.scale;
    if (wx < 0 || wy < 0 || wx > IMG_W || wy > IMG_H) return;
    onMiss(wx / IMG_W, wy / IMG_H);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (phase !== "hunt" || foundRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      gesture.current = { x: e.clientX, y: e.clientY, moved: false, pinch: 0 };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      gesture.current.moved = true;
    }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size >= 2 && gesture.current.pinch > 0) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect && dist > 0) {
        const midX = (a.x + b.x) / 2 - rect.left;
        const midY = (a.y + b.y) / 2 - rect.top;
        zoomAt(midX, midY, view.current.scale * (dist / gesture.current.pinch));
        gesture.current.pinch = dist;
      }
      gesture.current.moved = true;
      return;
    }
    if (!gesture.current.moved && Math.hypot(e.clientX - gesture.current.x, e.clientY - gesture.current.y) > 8) {
      gesture.current.moved = true;
    }
    if (gesture.current.moved) {
      view.current.x += dx;
      view.current.y += dy;
      clampPan();
      apply(false);
    }
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const was = pointers.current.size;
    pointers.current.delete(e.pointerId);
    if (was === 1 && !gesture.current.moved) handleTap(e.clientX, e.clientY);
    if (pointers.current.size < 2) gesture.current.pinch = 0;
  }

  function onHint() {
    if (hintUsed || !runningRef.current || foundRef.current) return;
    unlockAudio();
    playBlip();
    setHintUsed(true);
    bumpClock(HINT_MS);
    const ox = scene.x + (scene.x < 0.5 ? 0.12 : -0.12);
    const oy = Math.min(0.86, scene.y + 0.07);
    focus(ox, oy, Math.max(fitScale() * 2.2, 0.72), true);
    setHintMsg("Warmer. She's in this neighborhood. +12s");
    window.setTimeout(() => setHintMsg(null), 2400);
  }

  function startHunt() {
    unlockAudio();
    playBlip();
    setResults([]);
    missRef.current = 0;
    setMissCount(0);
    foundRef.current = false;
    setIndex(0);
    setPhase("hunt");
  }

  function nextScene() {
    unlockAudio();
    playBlip();
    if (index + 1 >= SCENES.length) {
      const total = results.reduce((sum, r) => sum + r.ms, 0);
      setBest((prev) => {
        if (prev == null || total < prev) {
          writeBest(total);
          return total;
        }
        return prev;
      });
      setPhase("victory");
      return;
    }
    missRef.current = 0;
    setMissCount(0);
    foundRef.current = false;
    setIndex((n) => n + 1);
    setPhase("hunt");
  }

  function toggleMute() {
    unlockAudio();
    const next = !muted;
    setMutedUi(next);
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  }

  function zoomButton(dir: 1 | -1) {
    unlockAudio();
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(rect.width / 2, rect.height / 2, view.current.scale * (dir > 0 ? 1.25 : 0.8), true);
  }

  const totalMs = results.reduce((sum, r) => sum + r.ms, 0);
  const totalMisses = results.reduce((sum, r) => sum + r.misses, 0);
  const rank = rankFor(totalMs);
  const danceOpen = phase === "celebrate" || showDance;

  useEffect(() => {
    if (!danceOpen) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted();
    setNeedsTap(false);
    const play = () => {
      const pending = v.play();
      if (pending) pending.catch(() => setNeedsTap(true));
    };
    if (v.readyState >= 2) play();
    else v.addEventListener("canplay", play, { once: true });
    return () => v.removeEventListener("canplay", play);
  }, [danceOpen]);

  if (phase === "title") {
    return (
      <main className="relative min-h-dvh overflow-x-hidden bg-night text-cream">
        <div className="grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />
        <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-8 px-5 py-10 sm:flex-row sm:gap-14">
          <img
            src="/game/kat-photo.jpg"
            alt="Kat smiling in orange sunglasses, a color-block windbreaker, and a neon fanny pack"
            className="photo-frame w-44 sm:w-72"
          />
          <div className="max-w-md text-center sm:text-left">
            <p className="text-sm font-semibold tracking-widest text-cyan">THREE CROWDS · ONE FIANCÉE</p>
            <h1 className="mt-2 font-display text-5xl leading-none text-pink sm:text-7xl">
              WHERE'S
              <br />
              KAT
            </h1>
            <p className="mt-4 text-lg leading-relaxed">
              A full-screen 1980s hunt. Drag to look around, pinch or scroll to zoom, and tap Kat when you
              spot her.
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {TELLS.map((tell) => (
                <li key={tell} className="border border-cream/30 bg-night px-3 py-1 text-sm font-semibold">
                  {tell}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-pop mt-6 h-12 bg-sun px-6 text-lg font-bold text-night"
              onClick={startHunt}
            >
              Start the hunt
            </button>
            {best != null && <p className="mt-3 text-sm text-cream/80">Best time {formatTime(best)}</p>}
          </div>
        </div>
      </main>
    );
  }

  if (phase === "victory") {
    return (
      <main className="relative min-h-dvh overflow-y-auto bg-night text-cream">
        <div className="grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-2/5" />
        <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-5 py-10 text-center">
          <p className="text-sm font-semibold tracking-widest text-cyan">HUNT COMPLETE</p>
          <h1 className="mt-2 font-display text-5xl text-sun sm:text-6xl">{rank.name}</h1>
          <p className="mt-3 text-lg">{rank.line}</p>
          <p className="mt-6 font-display text-4xl text-pink">{formatTime(totalMs)}</p>
          <p className="mt-1 text-sm text-cream/80">
            {totalMisses} wrong {totalMisses === 1 ? "tap" : "taps"}
            {best != null ? ` · best ${formatTime(best)}` : ""}
          </p>
          <ul className="mt-6 w-full text-left">
            {results.map((r, i) => (
              <li key={r.id} className="flex items-baseline justify-between gap-4 border-b border-cream/20 py-2">
                <span>
                  <span className="text-cyan">{i + 1}.</span> {r.title}
                </span>
                <span className="font-semibold">
                  {formatTime(r.ms)}
                  <span className="ml-2 text-sm text-cream/70">{r.misses} miss</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="btn-pop h-12 bg-sun px-5 font-bold text-night"
              onClick={() => {
                setShowDance(false);
                startHunt();
              }}
            >
              Hunt again
            </button>
            <button
              type="button"
              className="btn-pop h-12 border border-cream/40 bg-night px-5 font-bold text-cream"
              onClick={() => {
                unlockAudio();
                setShowDance(true);
              }}
            >
              Replay her dance
            </button>
          </div>
        </div>
        {showDance && (
          <DanceOverlay
            videoRef={videoRef}
            needsTap={needsTap}
            onPlay={() => {
              setNeedsTap(false);
              const v = videoRef.current;
              if (!v) return;
              v.muted = isMuted();
              void v.play().catch(() => setNeedsTap(true));
            }}
            title="Encore"
            actionLabel="Close"
            onAction={() => setShowDance(false)}
          />
        )}
      </main>
    );
  }

  return (
    <main className={`flex h-dvh flex-col bg-night text-cream ${shake && !prefersReduced() ? "world-shake" : ""}`}>
      <header className="z-20 flex flex-col gap-2 border-b border-cream/15 bg-night/95 px-3 py-2">
        <div className="flex items-center gap-3">
          <p className="font-display text-sm text-pink sm:text-base">WHERE'S KAT</p>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">
            {scene.title}
            <span className="ml-2 text-cream/60">{scene.year}</span>
          </p>
          <p className="font-semibold tabular-nums text-sun" aria-live="polite">
            {clock}
          </p>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-cream/30"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1" aria-label="Scenes">
            {SCENES.map((s, i) => (
              <span
                key={s.id}
                className={`h-2 w-6 ${i < index ? "bg-cyan" : i === index ? "bg-pink" : "bg-cream/25"}`}
              />
            ))}
          </div>
          <p className="min-w-0 flex-1 truncate text-xs text-cream/75">{TELLS.join(" · ")}</p>
          <p className="text-sm font-semibold">{missCount === 1 ? "1 miss" : `${missCount} misses`}</p>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={viewportRef}
          className={`absolute inset-0 touch-none overflow-hidden ${ready ? "opacity-100" : "opacity-0"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div ref={worldRef} className="absolute top-0 left-0 origin-top-left" style={{ width: IMG_W, height: IMG_H }}>
            <img
              src={scene.src}
              alt=""
              width={IMG_W}
              height={IMG_H}
              draggable={false}
              className="pointer-events-none h-full w-full select-none"
            />
            <KatSprite scene={scene} found={found} slopRef={slopRef} />
            {stamps.map((stamp) => (
              <span
                key={stamp.id}
                className="nope-stamp text-sm"
                style={{ left: `${stamp.x * 100}%`, top: `${stamp.y * 100}%` }}
              >
                NOPE +5s
              </span>
            ))}
          </div>
        </div>

        {intro && (
          <p className="pointer-events-none absolute inset-x-3 top-3 z-10 bg-night/85 px-3 py-2 text-sm font-semibold">
            {intro}
          </p>
        )}
        {hintMsg && (
          <p className="pointer-events-none absolute inset-x-3 bottom-20 z-10 bg-sun px-3 py-2 text-center text-sm font-bold text-night">
            {hintMsg}
          </p>
        )}

        <div className="absolute right-3 bottom-3 z-10 flex gap-2">
          <IconButton label="Zoom out" onClick={() => zoomButton(-1)}>
            <ZoomOut size={18} />
          </IconButton>
          <IconButton
            label="See the whole scene"
            onClick={() => {
              unlockAudio();
              focus(0.5, 0.5, fitScale(), true);
            }}
          >
            <Maximize2 size={18} />
          </IconButton>
          <IconButton label="Zoom in" onClick={() => zoomButton(1)}>
            <ZoomIn size={18} />
          </IconButton>
          <button
            type="button"
            className="btn-pop flex h-11 items-center gap-2 bg-pink px-3 font-bold text-night disabled:pointer-events-none"
            onClick={onHint}
            disabled={hintUsed || found}
          >
            <Crosshair size={18} />
            Hint
          </button>
        </div>
      </div>

      {phase === "celebrate" && (
        <DanceOverlay
          videoRef={videoRef}
          needsTap={needsTap}
          onPlay={() => {
            setNeedsTap(false);
            const v = videoRef.current;
            if (!v) return;
            v.muted = isMuted();
            void v.play().catch(() => setNeedsTap(true));
          }}
          title={index + 1 === SCENES.length ? "You found Kat" : `Found in ${scene.title}`}
          actionLabel={index + 1 === SCENES.length ? "See the score" : "Next crowd"}
          onAction={nextScene}
        />
      )}
    </main>
  );
}

function KatSprite({
  scene,
  found,
  slopRef,
}: {
  scene: Scene;
  found: boolean;
  slopRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <div
      data-kat
      className={`kat-anchor ${found ? "is-dancing" : ""}`}
      style={{ left: `${scene.x * 100}%`, top: `${scene.y * 100}%`, width: `${scene.w * 100}%` }}
    >
      {found && <span className="found-ring" />}
      <img src="/game/kat.png" alt="" draggable={false} />
      <span ref={slopRef} data-kat className="kat-slop" />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="btn-pop flex h-11 w-11 items-center justify-center bg-cream text-night"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DanceOverlay({
  videoRef,
  needsTap,
  onPlay,
  title,
  actionLabel,
  onAction,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  needsTap: boolean;
  onPlay: () => void;
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-night/80 p-3 sm:items-center">
      {!prefersReduced() &&
        Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            className="confetti-bit"
            style={{
              left: `${(i * 41) % 100}%`,
              animationDelay: `${(i % 7) * 0.09}s`,
              background: i % 3 === 0 ? "var(--color-pink)" : i % 3 === 1 ? "var(--color-cyan)" : "var(--color-sun)",
            }}
          />
        ))}
      <div className="vhs relative w-full max-w-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="font-display text-sm text-pink">PLAY</p>
          <p className="text-xs font-semibold tracking-widest text-cyan">VHS · 1985</p>
        </div>
        <div className="relative mx-3">
          <video
            ref={videoRef}
            className="dance-frame w-full object-cover"
            src="/game/kat-dance.mp4"
            poster="/game/kat-dance-poster.jpg"
            playsInline
            preload="auto"
          />
          <div className="scanlines pointer-events-none absolute inset-0" />
          {needsTap && (
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-night/50 font-bold text-sun"
              onClick={onPlay}
            >
              Play her dance
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 px-3 py-3">
          <h2 className="font-display text-2xl text-sun">{title}</h2>
          <p className="text-sm leading-relaxed">She breaks into an '80s dance. Hip pops, fists up, the whole bit.</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-pop flex h-11 flex-1 items-center justify-center gap-2 border border-cream/40 bg-night font-bold text-cream"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.currentTime = 0;
                v.muted = isMuted();
                void v.play();
              }}
            >
              <RotateCcw size={16} />
              Replay
            </button>
            <button
              type="button"
              className="btn-pop h-11 flex-1 bg-sun font-bold text-night"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
