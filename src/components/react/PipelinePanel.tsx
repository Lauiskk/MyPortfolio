import { useEffect, useMemo, useRef, useState } from 'react';
import { loc, type Lang } from '../../i18n/ui';

/**
 * A live view of the vigil pipeline, embedded in its case study.
 *
 * It streams from a deployed gateway when one is configured and reachable, and
 * otherwise replays a recording of a real run at its original pacing — saying
 * plainly which it is doing. A panel that quietly showed fabricated numbers
 * would be worse than no panel; one that shows a real run and labels it as a
 * recording is neither.
 */

type Alert = {
  id: string;
  rule: string;
  stream: string;
  key: string;
  at: string;
  detectedAt: string;
  severity: 'info' | 'warn' | 'critical';
  title: string;
  detail: string;
  absence?: boolean;
};

type Stats = {
  eventsPerSecond?: number;
  events?: number;
  alerts?: number;
  detection?: { p50Ms?: number; p99Ms?: number };
  endToEnd?: { p50Ms?: number; p99Ms?: number };
};

type Frame = { type: 'alert' | 'stats' | 'event' | 'window'; alert?: Alert; stats?: Stats };
type Trace = { durationMs: number; frames: Array<{ offsetMs: number; payload: Frame }> };

type Mode = 'connecting' | 'live' | 'replay' | 'failed';

const MAX_ALERTS = 8;

const copy = {
  live: { en: 'live', pt: 'ao vivo' },
  replay: { en: 'offline — replaying a recorded run', pt: 'offline — reproduzindo uma execução gravada' },
  connecting: { en: 'connecting', pt: 'conectando' },
  failed: { en: 'the recording could not be loaded', pt: 'não foi possível carregar a gravação' },
  eventsPerSecond: { en: 'events / sec', pt: 'eventos / seg' },
  alerts: { en: 'alerts', pt: 'alertas' },
  detect: { en: 'detect p50', pt: 'detecção p50' },
  endToEnd: { en: 'end to end p99', pt: 'ponta a ponta p99' },
  waiting: { en: 'waiting for anomalies — ordinary traffic is quiet by design', pt: 'aguardando anomalias — tráfego normal é silencioso por projeto' },
  idle: { en: 'idle', pt: 'ocioso' },
} as const;

const severityColor: Record<Alert['severity'], string> = {
  critical: 'var(--color-pink)',
  warn: 'var(--color-yellow)',
  info: 'var(--color-blue)',
};

export default function PipelinePanel({ lang, gatewayUrl }: { lang: Lang; gatewayUrl?: string }) {
  const [mode, setMode] = useState<Mode>('connecting');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Stats>({});

  // Timers scheduled by the replay, cleared on unmount. Without this a
  // navigation away leaves ninety-odd pending callbacks setting state on a
  // component that no longer exists.
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    const apply = (frame: Frame) => {
      if (cancelled) return;
      if (frame.type === 'alert' && frame.alert) {
        setAlerts((prev) => [frame.alert!, ...prev].slice(0, MAX_ALERTS));
      } else if (frame.type === 'stats' && frame.stats) {
        setStats(frame.stats);
      }
    };

    const startReplay = async () => {
      try {
        const res = await fetch('/vigil-trace.json');
        if (!res.ok) throw new Error(String(res.status));
        const trace: Trace = await res.json();
        if (cancelled) return;

        setMode('replay');

        const schedule = () => {
          for (const { offsetMs, payload } of trace.frames) {
            timers.current.push(window.setTimeout(() => apply(payload), offsetMs));
          }
          // Loop, so a reader arriving late still sees the run.
          timers.current.push(
            window.setTimeout(() => {
              if (cancelled) return;
              setAlerts([]);
              schedule();
            }, trace.durationMs + 2000),
          );
        };
        schedule();
      } catch {
        if (!cancelled) setMode('failed');
      }
    };

    // No gateway configured: go straight to the recording rather than waiting
    // for a connection that was never going to happen.
    if (!gatewayUrl) {
      void startReplay();
      return () => {
        cancelled = true;
        timers.current.forEach(clearTimeout);
      };
    }

    const source = new EventSource(`${gatewayUrl.replace(/\/$/, '')}/api/stream`);
    source.onopen = () => !cancelled && setMode('live');
    source.onmessage = (e) => {
      try {
        apply(JSON.parse(e.data) as Frame);
      } catch {
        /* a malformed frame is not worth tearing the panel down for */
      }
    };
    source.onerror = () => {
      source.close();
      if (!cancelled && mode !== 'live') void startReplay();
    };

    return () => {
      cancelled = true;
      source.close();
      timers.current.forEach(clearTimeout);
    };
    // `mode` is deliberately not a dependency: re-running this on every state
    // change would tear down the connection it just opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatewayUrl]);

  const metrics = useMemo(
    () => [
      { label: copy.eventsPerSecond, value: fmt(stats.eventsPerSecond), accent: 'var(--color-cyan)' },
      { label: copy.alerts, value: fmt(stats.alerts), accent: 'var(--color-magenta)' },
      { label: copy.detect, value: ms(stats.detection?.p50Ms), accent: 'var(--color-blue)' },
      { label: copy.endToEnd, value: ms(stats.endToEnd?.p99Ms), accent: 'var(--color-purple)' },
    ],
    [stats],
  );

  return (
    <section className="panel clip-corner overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--hair)] px-5 py-3">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[var(--accent)]">vigil</span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--ink-3)]">
          {mode === 'live' && loc(copy.live, lang)}
          {mode === 'replay' && loc(copy.replay, lang)}
          {mode === 'connecting' && loc(copy.connecting, lang)}
          {mode === 'failed' && loc(copy.failed, lang)}
        </span>
        <span
          aria-hidden="true"
          className="ml-auto h-2 w-2 rounded-full"
          style={{
            background: mode === 'live' ? 'var(--color-cyan)' : mode === 'failed' ? 'var(--color-pink)' : 'var(--ink-3)',
            boxShadow: mode === 'live' ? '0 0 10px var(--color-cyan)' : 'none',
          }}
        />
      </header>

      <div className="grid grid-cols-2 gap-px bg-[var(--hair)] sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label.en} className="bg-[var(--surface)] px-4 py-3">
            <div className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[var(--ink-3)]">
              {loc(m.label, lang)}
            </div>
            <div className="mt-1 font-display text-xl font-bold tabular-nums" style={{ color: m.accent }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <ul className="m-0 max-h-[19rem] list-none overflow-y-auto p-2">
        {alerts.length === 0 && (
          <li className="px-3 py-8 text-center font-mono text-[0.7rem] text-[var(--ink-3)]">
            {loc(copy.waiting, lang)}
          </li>
        )}
        {alerts.map((a) => (
          <li
            key={a.id}
            className="mb-1.5 bg-[var(--surface-2)] px-4 py-2.5"
            style={{ borderLeft: `3px solid ${severityColor[a.severity] ?? severityColor.info}` }}
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span
                className="font-display text-[0.68rem] font-bold uppercase tracking-[0.1em]"
                style={{ color: severityColor[a.severity] ?? severityColor.info }}
              >
                {a.title}
              </span>
              <span className="font-mono text-[0.66rem] text-[var(--ink-2)]">{a.key}</span>
              <span className="ml-auto font-mono text-[0.6rem] text-[var(--ink-3)]">{latency(a)}</span>
            </div>
            <p className="mt-1 font-mono text-[0.7rem] leading-snug text-[var(--ink-2)]">{a.detail}</p>
            <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[var(--ink-3)]">
              {a.stream} · {a.rule}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function fmt(v?: number): string {
  if (v === undefined || v === null) return '—';
  return Math.round(v).toLocaleString('en-US');
}

function ms(v?: number): string {
  if (v === undefined || v === null || v === 0) return '—';
  return `${v < 10 ? v.toFixed(1) : Math.round(v)}ms`;
}

/**
 * An absence alert's interval is how long the entity was silent, not how long
 * the pipeline took. Showing it as latency would put four minutes next to a
 * column of milliseconds.
 */
function latency(a: Alert): string {
  if (a.absence) return '—';
  const d = new Date(a.detectedAt).getTime() - new Date(a.at).getTime();
  return Number.isFinite(d) && d >= 0 ? `${d}ms` : '—';
}
