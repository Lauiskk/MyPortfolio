/**
 * Tiny synthesised UI blips. No audio files, no autoplay: the AudioContext is
 * only created after the user turns sound on, which is also the gesture that
 * unlocks it in every browser.
 */
const KEY = 'portfolio-sound';
type Voice = 'tick' | 'hover' | 'confirm' | 'error' | 'eat';

const VOICES: Record<Voice, { freq: number; to: number; dur: number; type: OscillatorType; gain: number }> = {
  tick:    { freq: 880,  to: 880,  dur: 0.03, type: 'square',   gain: 0.02 },
  hover:   { freq: 1200, to: 1500, dur: 0.04, type: 'sine',     gain: 0.015 },
  confirm: { freq: 520,  to: 990,  dur: 0.12, type: 'triangle', gain: 0.04 },
  error:   { freq: 220,  to: 110,  dur: 0.18, type: 'sawtooth', gain: 0.035 },
  eat:     { freq: 660,  to: 1320, dur: 0.06, type: 'square',   gain: 0.03 },
};

let ctx: AudioContext | null = null;
let enabled = false;

export function isSoundOn() {
  return enabled;
}

export function initSound() {
  enabled = localStorage.getItem(KEY) === 'on';
  return enabled;
}

export function setSound(on: boolean) {
  enabled = on;
  localStorage.setItem(KEY, on ? 'on' : 'off');
  if (on) play('confirm');
  return enabled;
}

export function play(voice: Voice) {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();

    const { freq, to, dur, type, gain } = VOICES[voice];
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, now + dur);

    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(amp).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  } catch {
    // An unavailable AudioContext must never break the page.
  }
}
