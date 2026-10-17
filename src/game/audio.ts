let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function context() {
  if (ctx) return ctx;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC({ latencyHint: "interactive" });
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.7;
  master.connect(ctx.destination);
  return ctx;
}

export function unlockAudio() {
  const audio = context();
  if (audio && audio.state === "suspended") void audio.resume();
}

export function resumeAudio() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

export function setMuted(next: boolean) {
  muted = next;
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(next ? 0 : 0.7, ctx.currentTime, 0.03);
}

export function isMuted() {
  return muted;
}

function tone(freq: number, at: number, dur: number, type: OscillatorType, gain: number) {
  if (!ctx || !master || muted) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(amp);
  amp.connect(master);
  osc.start(at);
  osc.stop(at + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    amp.disconnect();
  };
}

export function playBlip() {
  if (!context()) return;
  tone(740, ctx!.currentTime, 0.07, "square", 0.07);
}

export function playMiss() {
  if (!context()) return;
  const t = ctx!.currentTime;
  tone(196, t, 0.12, "sawtooth", 0.05);
  tone(130, t + 0.06, 0.16, "square", 0.04);
}

export function playFound() {
  if (!context()) return;
  const t = ctx!.currentTime;
  [523, 659, 784, 1046].forEach((n, i) => tone(n, t + i * 0.08, 0.16, "square", 0.06));
  tone(1568, t + 0.36, 0.2, "triangle", 0.045);
}
