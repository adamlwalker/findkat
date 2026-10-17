export const IMG_W = 1792;
export const IMG_H = 1008;

export type Scene = {
  id: string;
  title: string;
  year: string;
  src: string;
  /** Kat's center, as a fraction of the scene. */
  x: number;
  y: number;
  /** Kat's width as a fraction of the scene width. */
  w: number;
  /** Opening camera, away from Kat. */
  lookX: number;
  lookY: number;
  intro: string;
};

export const SCENES: Scene[] = [
  {
    id: "mall",
    title: "Sunnyvale Mall",
    year: "1986",
    src: "/game/mall.jpg",
    x: 0.78,
    y: 0.71,
    w: 0.0402,
    lookX: 0.28,
    lookY: 0.64,
    intro: "Saturday at the mall. She is in the crowd, not on a poster.",
  },
  {
    id: "boardwalk",
    title: "Boardwalk Carnival",
    year: "1984",
    src: "/game/boardwalk.jpg",
    x: 0.6,
    y: 0.78,
    w: 0.0368,
    lookX: 0.22,
    lookY: 0.34,
    intro: "The pier is packed. Neon fanny pack. Orange shades.",
  },
  {
    id: "rink",
    title: "Starlite Roller Disco",
    year: "1985",
    src: "/game/rink.jpg",
    x: 0.09,
    y: 0.52,
    w: 0.0391,
    lookX: 0.74,
    lookY: 0.62,
    intro: "Skate night. She is off the open floor.",
  },
];

export const TELLS = ["Orange shades", "Color-block jacket", "Pink mesh", "Neon fanny pack"] as const;

const BEST_KEY = "wheres-kat-best-v1";

export function formatTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function rankFor(ms: number) {
  if (ms < 90_000) return { name: "TUBULAR", line: "She never stood a chance." };
  if (ms < 160_000) return { name: "RADICAL", line: "The shades did not save her." };
  if (ms < 260_000) return { name: "GNARLY", line: "You got there. The pretzels got cold." };
  return { name: "BOGUS", line: "The crowd almost won. Almost." };
}

export function readBest(): number | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function writeBest(ms: number) {
  try {
    localStorage.setItem(BEST_KEY, String(Math.round(ms)));
  } catch {
    /* private mode */
  }
}
