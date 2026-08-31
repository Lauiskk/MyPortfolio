import { useId, useState } from 'react';
import { skillGroups, type Skill, type SkillGroup } from '../../data/skills';
import { useTranslations, loc, type Lang } from '../../i18n/ui';

const SIZE = 300;
const CENTER = SIZE / 2;
/** Heavier skills sit closer to the core. */
const RADIUS: Record<Skill['weight'], number> = { 3: 62, 2: 96, 1: 126 };

type Placed = Skill & { x: number; y: number; r: number };

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Lays a group's skills out on rings by weight, starting from a per-group
 * angle offset so neighbouring clusters do not mirror each other.
 */
function place(group: SkillGroup, index: number): Placed[] {
  const byRing = new Map<number, Skill[]>();
  for (const skill of group.skills) {
    const ring = RADIUS[skill.weight];
    byRing.set(ring, [...(byRing.get(ring) ?? []), skill]);
  }

  const out: Placed[] = [];
  for (const [radius, skills] of byRing) {
    const offset = (index * Math.PI) / 5 + (radius / 40);
    skills.forEach((skill, i) => {
      const angle = offset + (i / skills.length) * Math.PI * 2;
      // Rounded: unrounded trig differs in the last bit between the SSR pass
      // and the browser, which React reports as a hydration mismatch.
      out.push({
        ...skill,
        x: round(CENTER + Math.cos(angle) * radius),
        y: round(CENTER + Math.sin(angle) * radius * 0.82), // squashed: an orbit, not a circle
        r: round(5 + skill.weight * 2.2),
      });
    });
  }
  return out;
}

export default function SkillsConstellation({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const [active, setActive] = useState<Placed | null>(null);

  return (
    <div>
      <p className="mb-8 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--ink-3)]">
        {t('skills.hint')}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {skillGroups.map((group, gi) => (
          <Cluster key={group.id} group={group} index={gi} lang={lang} onActive={setActive} active={active} />
        ))}
      </div>

      {/* One shared live region so screen readers hear the same thing the tooltip shows. */}
      <p className="sr-only" role="status">
        {active ? `${active.name}: ${loc(active.where, lang)}` : ''}
      </p>
    </div>
  );
}

function Cluster({
  group, index, lang, active, onActive,
}: {
  group: SkillGroup; index: number; lang: Lang;
  active: Placed | null; onActive: (s: Placed | null) => void;
}) {
  const nodes = place(group, index);
  const gradId = useId();

  return (
    <div data-accent={group.accent} className="panel spotlight clip-corner relative p-5">
      <h3 className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[var(--accent)]">
        {loc(group.label, lang)}
      </h3>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" role="img"
           aria-label={`${loc(group.label, lang)}: ${nodes.map((n) => n.name).join(', ')}`}>
        <defs>
          <radialGradient id={gradId}>
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={132} fill={`url(#${gradId})`} />
        {Object.values(RADIUS).map((r) => (
          <ellipse key={r} cx={CENTER} cy={CENTER} rx={r} ry={round(r * 0.82)}
                   fill="none" stroke="var(--hair)" strokeWidth="1" />
        ))}

        {/* Spokes from the core out to each node. */}
        {nodes.map((n) => (
          <line key={`l-${n.name}`} x1={CENTER} y1={CENTER} x2={n.x} y2={n.y}
                stroke="var(--accent)" strokeWidth="1"
                opacity={active?.name === n.name ? 0.55 : 0.13} />
        ))}

        <circle cx={CENTER} cy={CENTER} r="4" fill="var(--accent)" />

        {nodes.map((n) => {
          const on = active?.name === n.name;
          return (
            <g key={n.name}
               tabIndex={0}
               role="button"
               aria-label={`${n.name} — ${loc(n.where, lang)}`}
               className="cursor-target outline-none"
               onMouseEnter={() => onActive(n)}
               onMouseLeave={() => onActive(null)}
               onFocus={() => onActive(n)}
               onBlur={() => onActive(null)}>
              <circle cx={n.x} cy={n.y} r={n.r + 9} fill="transparent" />
              <circle cx={n.x} cy={n.y} r={n.r} fill="var(--surface-2)"
                      stroke="var(--accent)" strokeWidth={on ? 2 : 1.2}
                      style={{ filter: on ? 'drop-shadow(0 0 8px var(--accent))' : undefined, transition: 'all .2s' }} />
              <text x={n.x} y={n.y + n.r + 13} textAnchor="middle"
                    className="font-mono"
                    fontSize="9.5"
                    fill={on ? 'var(--accent)' : 'var(--ink-3)'}>
                {n.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip pinned to the card so it never clips outside the SVG. */}
      <div
        className={`pointer-events-none absolute inset-x-4 bottom-4 border border-[var(--accent)]/40 bg-[var(--surface-2)]/95 px-3 py-2 backdrop-blur transition-opacity duration-200 ${
          active && nodes.some((n) => n.name === active.name) ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="font-mono text-[0.68rem] text-[var(--accent)]">{active?.name}</p>
        <p className="text-[0.78rem] leading-snug text-[var(--ink-2)]">{active && loc(active.where, lang)}</p>
      </div>
    </div>
  );
}
