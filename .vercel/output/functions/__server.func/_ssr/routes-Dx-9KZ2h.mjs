import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Crosshair, i as Volume2, n as ZoomOut, o as RotateCcw, r as VolumeX, s as Maximize2, t as ZoomIn } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dx-9KZ2h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var IMG_W = 1792;
var IMG_H = 1008;
var SCENES = [
	{
		id: "mall",
		title: "Sunnyvale Mall",
		year: "1986",
		src: "/game/mall.jpg",
		x: .78,
		y: .71,
		w: .0402,
		lookX: .28,
		lookY: .64,
		intro: "Saturday at the mall. She is in the crowd, not on a poster."
	},
	{
		id: "boardwalk",
		title: "Boardwalk Carnival",
		year: "1984",
		src: "/game/boardwalk.jpg",
		x: .6,
		y: .78,
		w: .0368,
		lookX: .22,
		lookY: .34,
		intro: "The pier is packed. Neon fanny pack. Orange shades."
	},
	{
		id: "rink",
		title: "Starlite Roller Disco",
		year: "1985",
		src: "/game/rink.jpg",
		x: .09,
		y: .52,
		w: .0391,
		lookX: .74,
		lookY: .62,
		intro: "Skate night. She is off the open floor."
	}
];
var TELLS = [
	"Orange shades",
	"Color-block jacket",
	"Pink mesh",
	"Neon fanny pack"
];
var BEST_KEY = "wheres-kat-best-v1";
function formatTime(ms) {
	const s = Math.max(0, Math.floor(ms / 1e3));
	return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}
function rankFor(ms) {
	if (ms < 9e4) return {
		name: "TUBULAR",
		line: "She never stood a chance."
	};
	if (ms < 16e4) return {
		name: "RADICAL",
		line: "The shades did not save her."
	};
	if (ms < 26e4) return {
		name: "GNARLY",
		line: "You got there. The pretzels got cold."
	};
	return {
		name: "BOGUS",
		line: "The crowd almost won. Almost."
	};
}
function readBest() {
	try {
		const raw = localStorage.getItem(BEST_KEY);
		if (!raw) return null;
		const n = Number(raw);
		return Number.isFinite(n) && n > 0 ? n : null;
	} catch {
		return null;
	}
}
function writeBest(ms) {
	try {
		localStorage.setItem(BEST_KEY, String(Math.round(ms)));
	} catch {}
}
var ctx = null;
var master = null;
var muted = false;
function context() {
	if (ctx) return ctx;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return null;
	ctx = new AC({ latencyHint: "interactive" });
	master = ctx.createGain();
	master.gain.value = muted ? 0 : .7;
	master.connect(ctx.destination);
	return ctx;
}
function unlockAudio() {
	const audio = context();
	if (audio && audio.state === "suspended") audio.resume();
}
function resumeAudio() {
	if (ctx && ctx.state === "suspended") ctx.resume();
}
function setMuted(next) {
	muted = next;
	if (!ctx || !master) return;
	master.gain.setTargetAtTime(next ? 0 : .7, ctx.currentTime, .03);
}
function isMuted() {
	return muted;
}
function tone(freq, at, dur, type, gain) {
	if (!ctx || !master || muted) return;
	const osc = ctx.createOscillator();
	const amp = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, at);
	amp.gain.setValueAtTime(1e-4, at);
	amp.gain.exponentialRampToValueAtTime(Math.max(2e-4, gain), at + .015);
	amp.gain.exponentialRampToValueAtTime(1e-4, at + dur);
	osc.connect(amp);
	amp.connect(master);
	osc.start(at);
	osc.stop(at + dur + .02);
	osc.onended = () => {
		osc.disconnect();
		amp.disconnect();
	};
}
function playBlip() {
	if (!context()) return;
	tone(740, ctx.currentTime, .07, "square", .07);
}
function playMiss() {
	if (!context()) return;
	const t = ctx.currentTime;
	tone(196, t, .12, "sawtooth", .05);
	tone(130, t + .06, .16, "square", .04);
}
function playFound() {
	if (!context()) return;
	const t = ctx.currentTime;
	[
		523,
		659,
		784,
		1046
	].forEach((n, i) => tone(n, t + i * .08, .16, "square", .06));
	tone(1568, t + .36, .2, "triangle", .045);
}
var MISS_MS = 5e3;
var HINT_MS = 12e3;
function prefersReduced() {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function WheresKat() {
	const [phase, setPhase] = (0, import_react.useState)("title");
	const [index, setIndex] = (0, import_react.useState)(0);
	const [found, setFound] = (0, import_react.useState)(false);
	const [hintUsed, setHintUsed] = (0, import_react.useState)(false);
	const [hintMsg, setHintMsg] = (0, import_react.useState)(null);
	const [intro, setIntro] = (0, import_react.useState)(null);
	const [stamps, setStamps] = (0, import_react.useState)([]);
	const [missCount, setMissCount] = (0, import_react.useState)(0);
	const [results, setResults] = (0, import_react.useState)([]);
	const [best, setBest] = (0, import_react.useState)(null);
	const [muted, setMutedUi] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [shake, setShake] = (0, import_react.useState)(false);
	const [showDance, setShowDance] = (0, import_react.useState)(false);
	const [clock, setClock] = (0, import_react.useState)("0:00");
	const [needsTap, setNeedsTap] = (0, import_react.useState)(false);
	const viewportRef = (0, import_react.useRef)(null);
	const worldRef = (0, import_react.useRef)(null);
	const slopRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const view = (0, import_react.useRef)({
		x: 0,
		y: 0,
		scale: 1
	});
	const elapsedRef = (0, import_react.useRef)(0);
	const runningRef = (0, import_react.useRef)(false);
	const foundRef = (0, import_react.useRef)(false);
	const missRef = (0, import_react.useRef)(0);
	const stampId = (0, import_react.useRef)(0);
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const gesture = (0, import_react.useRef)({
		x: 0,
		y: 0,
		moved: false,
		pinch: 0
	});
	const scene = SCENES[index] ?? SCENES[0];
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		let raf = 0;
		let last = performance.now();
		let acc = 0;
		const loop = (now) => {
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
		if (!rect || rect.width < 2 || rect.height < 2) return .4;
		return Math.min(rect.width / IMG_W, rect.height / IMG_H);
	}
	function updateSlop() {
		const slop = slopRef.current;
		if (!slop) return;
		const visual = scene.w * IMG_W * view.current.scale;
		const extra = Math.max(0, (48 - visual) / 2 / view.current.scale);
		slop.style.inset = `${-extra}px`;
	}
	function apply(animate) {
		const world = worldRef.current;
		if (!world) return;
		world.style.transition = animate && !prefersReduced() ? "transform 680ms cubic-bezier(.2,.8,.2,1)" : "none";
		const v = view.current;
		world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.scale})`;
		updateSlop();
		if (animate) window.setTimeout(() => {
			if (worldRef.current) worldRef.current.style.transition = "none";
		}, 720);
	}
	function clampScale(next) {
		const fit = fitScale();
		return Math.min(Math.max(next, fit * .92), Math.max(fit * 7, 2.2));
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
	function zoomAt(sx, sy, next, animate = false) {
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
	function focus(fx, fy, scale, animate) {
		const rect = viewportRef.current?.getBoundingClientRect();
		if (!rect) return;
		const v = view.current;
		v.scale = clampScale(scale);
		v.x = rect.width / 2 - fx * IMG_W * v.scale;
		v.y = rect.height / 2 - fy * IMG_H * v.scale;
		clampPan();
		apply(animate);
	}
	(0, import_react.useEffect)(() => {
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
			const start = Math.min(Math.max(fit * 1.65, .5), 2.2);
			focus(scene.lookX, scene.lookY, start, false);
			runningRef.current = true;
			setReady(true);
		});
		return () => {
			cancelAnimationFrame(id);
			window.clearTimeout(hide);
			runningRef.current = false;
		};
	}, [phase, index]);
	(0, import_react.useEffect)(() => {
		const el = viewportRef.current;
		if (!el || phase !== "hunt") return;
		const onWheel = (e) => {
			e.preventDefault();
			const rect = el.getBoundingClientRect();
			const factor = e.deltaY < 0 ? 1.14 : 1 / 1.14;
			zoomAt(e.clientX - rect.left, e.clientY - rect.top, view.current.scale * factor);
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [phase, index]);
	(0, import_react.useEffect)(() => {
		if (phase !== "hunt") return;
		const onKey = (e) => {
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
				focus(.5, .5, fitScale(), true);
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
	}, [
		phase,
		index,
		hintUsed
	]);
	function bumpClock(extra) {
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
		setResults((prev) => [...prev, {
			id: scene.id,
			title: scene.title,
			ms: elapsedRef.current,
			misses: missRef.current
		}]);
		window.setTimeout(() => setPhase("celebrate"), 700);
	}
	function onMiss(fx, fy) {
		unlockAudio();
		playMiss();
		missRef.current += 1;
		setMissCount(missRef.current);
		bumpClock(MISS_MS);
		const id = ++stampId.current;
		setStamps((prev) => [...prev.slice(-7), {
			id,
			x: fx,
			y: fy
		}]);
		window.setTimeout(() => {
			setStamps((prev) => prev.filter((s) => s.id !== id));
		}, 860);
	}
	function handleTap(clientX, clientY) {
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
		if (wx < 0 || wy < 0 || wx > 1792 || wy > 1008) return;
		onMiss(wx / IMG_W, wy / IMG_H);
	}
	function onPointerDown(e) {
		if (phase !== "hunt" || foundRef.current) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		pointers.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (pointers.current.size === 1) gesture.current = {
			x: e.clientX,
			y: e.clientY,
			moved: false,
			pinch: 0
		};
		else if (pointers.current.size === 2) {
			const [a, b] = [...pointers.current.values()];
			gesture.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
			gesture.current.moved = true;
		}
	}
	function onPointerMove(e) {
		const prev = pointers.current.get(e.pointerId);
		if (!prev) return;
		const dx = e.clientX - prev.x;
		const dy = e.clientY - prev.y;
		pointers.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (pointers.current.size >= 2 && gesture.current.pinch > 0) {
			const [a, b] = [...pointers.current.values()];
			const dist = Math.hypot(a.x - b.x, a.y - b.y);
			const rect = viewportRef.current?.getBoundingClientRect();
			if (rect && dist > 0) {
				zoomAt((a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top, view.current.scale * (dist / gesture.current.pinch));
				gesture.current.pinch = dist;
			}
			gesture.current.moved = true;
			return;
		}
		if (!gesture.current.moved && Math.hypot(e.clientX - gesture.current.x, e.clientY - gesture.current.y) > 8) gesture.current.moved = true;
		if (gesture.current.moved) {
			view.current.x += dx;
			view.current.y += dy;
			clampPan();
			apply(false);
		}
	}
	function onPointerUp(e) {
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
		focus(scene.x + (scene.x < .5 ? .12 : -.12), Math.min(.86, scene.y + .07), Math.max(fitScale() * 2.2, .72), true);
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
	function zoomButton(dir) {
		unlockAudio();
		const rect = viewportRef.current?.getBoundingClientRect();
		if (!rect) return;
		zoomAt(rect.width / 2, rect.height / 2, view.current.scale * (dir > 0 ? 1.25 : .8), true);
	}
	const totalMs = results.reduce((sum, r) => sum + r.ms, 0);
	const totalMisses = results.reduce((sum, r) => sum + r.misses, 0);
	const rank = rankFor(totalMs);
	const danceOpen = phase === "celebrate" || showDance;
	(0, import_react.useEffect)(() => {
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
	if (phase === "title") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-dvh overflow-x-hidden bg-night text-cream",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-8 px-5 py-10 sm:flex-row sm:gap-14",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/game/kat-photo.jpg",
				alt: "Kat smiling in orange sunglasses, a color-block windbreaker, and a neon fanny pack",
				className: "photo-frame w-44 sm:w-72"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-md text-center sm:text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tracking-widest text-cyan",
						children: "THREE CROWDS · ONE FIANCÉE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-2 font-display text-5xl leading-none text-pink sm:text-7xl",
						children: [
							"WHERE'S",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"KAT"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-lg leading-relaxed",
						children: "A full-screen 1980s hunt. Drag to look around, pinch or scroll to zoom, and tap Kat when you spot her."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-wrap justify-center gap-2 sm:justify-start",
						children: TELLS.map((tell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border border-cream/30 bg-night px-3 py-1 text-sm font-semibold",
							children: tell
						}, tell))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-pop mt-6 h-12 bg-sun px-6 text-lg font-bold text-night",
						onClick: startHunt,
						children: "Start the hunt"
					}),
					best != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-cream/80",
						children: ["Best time ", formatTime(best)]
					})
				]
			})]
		})]
	});
	if (phase === "victory") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-dvh overflow-y-auto bg-night text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-2/5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-5 py-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tracking-widest text-cyan",
						children: "HUNT COMPLETE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-5xl text-sun sm:text-6xl",
						children: rank.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-lg",
						children: rank.line
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 font-display text-4xl text-pink",
						children: formatTime(totalMs)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-cream/80",
						children: [
							totalMisses,
							" wrong ",
							totalMisses === 1 ? "tap" : "taps",
							best != null ? ` · best ${formatTime(best)}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-6 w-full text-left",
						children: results.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-baseline justify-between gap-4 border-b border-cream/20 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-cyan",
									children: [i + 1, "."]
								}),
								" ",
								r.title
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold",
								children: [formatTime(r.ms), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-sm text-cream/70",
									children: [r.misses, " miss"]
								})]
							})]
						}, r.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap items-center justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-pop h-12 bg-sun px-5 font-bold text-night",
							onClick: () => {
								setShowDance(false);
								startHunt();
							},
							children: "Hunt again"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-pop h-12 border border-cream/40 bg-night px-5 font-bold text-cream",
							onClick: () => {
								unlockAudio();
								setShowDance(true);
							},
							children: "Replay her dance"
						})]
					})
				]
			}),
			showDance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DanceOverlay, {
				videoRef,
				needsTap,
				onPlay: () => {
					setNeedsTap(false);
					const v = videoRef.current;
					if (!v) return;
					v.muted = isMuted();
					v.play().catch(() => setNeedsTap(true));
				},
				title: "Encore",
				actionLabel: "Close",
				onAction: () => setShowDance(false)
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: `flex h-dvh flex-col bg-night text-cream ${shake && !prefersReduced() ? "world-shake" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "z-20 flex flex-col gap-2 border-b border-cream/15 bg-night/95 px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-sm text-pink sm:text-base",
							children: "WHERE'S KAT"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "min-w-0 flex-1 truncate text-sm font-semibold",
							children: [scene.title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-cream/60",
								children: scene.year
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold tabular-nums text-sun",
							"aria-live": "polite",
							children: clock
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex h-11 w-11 items-center justify-center border border-cream/30",
							onClick: toggleMute,
							"aria-label": muted ? "Unmute" : "Mute",
							children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { size: 18 })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1",
							"aria-label": "Scenes",
							children: SCENES.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-6 ${i < index ? "bg-cyan" : i === index ? "bg-pink" : "bg-cream/25"}` }, s.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 flex-1 truncate text-xs text-cream/75",
							children: TELLS.join(" · ")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: missCount === 1 ? "1 miss" : `${missCount} misses`
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: viewportRef,
						className: `absolute inset-0 touch-none overflow-hidden ${ready ? "opacity-100" : "opacity-0"}`,
						onPointerDown,
						onPointerMove,
						onPointerUp,
						onPointerCancel: onPointerUp,
						onContextMenu: (e) => e.preventDefault(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							ref: worldRef,
							className: "absolute top-0 left-0 origin-top-left",
							style: {
								width: IMG_W,
								height: IMG_H
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: scene.src,
									alt: "",
									width: IMG_W,
									height: IMG_H,
									draggable: false,
									className: "pointer-events-none h-full w-full select-none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KatSprite, {
									scene,
									found,
									slopRef
								}),
								stamps.map((stamp) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "nope-stamp text-sm",
									style: {
										left: `${stamp.x * 100}%`,
										top: `${stamp.y * 100}%`
									},
									children: "NOPE +5s"
								}, stamp.id))
							]
						})
					}),
					intro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pointer-events-none absolute inset-x-3 top-3 z-10 bg-night/85 px-3 py-2 text-sm font-semibold",
						children: intro
					}),
					hintMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pointer-events-none absolute inset-x-3 bottom-20 z-10 bg-sun px-3 py-2 text-center text-sm font-bold text-night",
						children: hintMsg
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute right-3 bottom-3 z-10 flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								label: "Zoom out",
								onClick: () => zoomButton(-1),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { size: 18 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								label: "See the whole scene",
								onClick: () => {
									unlockAudio();
									focus(.5, .5, fitScale(), true);
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { size: 18 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								label: "Zoom in",
								onClick: () => zoomButton(1),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { size: 18 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "btn-pop flex h-11 items-center gap-2 bg-pink px-3 font-bold text-night disabled:pointer-events-none",
								onClick: onHint,
								disabled: hintUsed || found,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { size: 18 }), "Hint"]
							})
						]
					})
				]
			}),
			phase === "celebrate" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DanceOverlay, {
				videoRef,
				needsTap,
				onPlay: () => {
					setNeedsTap(false);
					const v = videoRef.current;
					if (!v) return;
					v.muted = isMuted();
					v.play().catch(() => setNeedsTap(true));
				},
				title: index + 1 === SCENES.length ? "You found Kat" : `Found in ${scene.title}`,
				actionLabel: index + 1 === SCENES.length ? "See the score" : "Next crowd",
				onAction: nextScene
			})
		]
	});
}
function KatSprite({ scene, found, slopRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-kat": true,
		className: `kat-anchor ${found ? "is-dancing" : ""}`,
		style: {
			left: `${scene.x * 100}%`,
			top: `${scene.y * 100}%`,
			width: `${scene.w * 100}%`
		},
		children: [
			found && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "found-ring" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/game/kat.png",
				alt: "",
				draggable: false
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				ref: slopRef,
				"data-kat": true,
				className: "kat-slop"
			})
		]
	});
}
function IconButton({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		className: "btn-pop flex h-11 w-11 items-center justify-center bg-cream text-night",
		onClick,
		children
	});
}
function DanceOverlay({ videoRef, needsTap, onPlay, title, actionLabel, onAction }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-30 flex items-end justify-center bg-night/80 p-3 sm:items-center",
		children: [!prefersReduced() && Array.from({ length: 24 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "confetti-bit",
			style: {
				left: `${i * 41 % 100}%`,
				animationDelay: `${i % 7 * .09}s`,
				background: i % 3 === 0 ? "var(--color-pink)" : i % 3 === 1 ? "var(--color-cyan)" : "var(--color-sun)"
			}
		}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "vhs relative w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-sm text-pink",
						children: "PLAY"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-cyan",
						children: "VHS · 1985"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: videoRef,
							className: "dance-frame w-full object-cover",
							src: "/game/kat-dance.mp4",
							poster: "/game/kat-dance-poster.jpg",
							playsInline: true,
							preload: "auto"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "scanlines pointer-events-none absolute inset-0" }),
						needsTap && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "absolute inset-0 flex items-center justify-center bg-night/50 font-bold text-sun",
							onClick: onPlay,
							children: "Play her dance"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 px-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-sun",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed",
							children: "She breaks into an '80s dance. Hip pops, fists up, the whole bit."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "btn-pop flex h-11 flex-1 items-center justify-center gap-2 border border-cream/40 bg-night font-bold text-cream",
								onClick: () => {
									const v = videoRef.current;
									if (!v) return;
									v.currentTime = 0;
									v.muted = isMuted();
									v.play();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 16 }), "Replay"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn-pop h-11 flex-1 bg-sun font-bold text-night",
								onClick: onAction,
								children: actionLabel
							})]
						})
					]
				})
			]
		})]
	});
}
var SplitComponent = WheresKat;
//#endregion
export { SplitComponent as component };
