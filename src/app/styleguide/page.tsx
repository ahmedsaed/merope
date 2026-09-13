import type { Metadata } from 'next';
import { ThemeToggle } from '@/design/components/ThemeToggle';
import { MAGNITUDE_CLASSES, NEBULA, PLATE, STAR, SUPERCOMPUTER } from '@/lib/merope';

export const metadata: Metadata = {
  title: 'Styleguide',
  description: 'Every token in the Merope design system, in both themes.',
  robots: { index: false, follow: false },
};

const SURFACES = [
  { token: '--ground', label: 'ground', use: 'The page itself' },
  { token: '--surface', label: 'surface', use: 'A card on the page' },
  { token: '--raised', label: 'raised', use: 'A well or inset' },
  { token: '--ink', label: 'ink', use: 'Body text' },
  { token: '--ink-muted', label: 'ink-muted', use: 'Secondary text' },
  { token: '--ink-faint', label: 'ink-faint', use: 'Annotations at rest' },
  { token: '--rule', label: 'rule', use: 'Hairlines' },
  { token: '--rule-strong', label: 'rule-strong', use: 'Emphasised divisions' },
  { token: '--accent', label: 'accent', use: "The star's own colour" },
  { token: '--accent-soft', label: 'accent-soft', use: 'Accent ground' },
  { token: '--mark', label: 'mark', use: 'Grease pencil. Attention only.' },
  { token: '--mark-soft', label: 'mark-soft', use: 'Mark ground' },
];

const TYPE = [
  { cls: 'text-display font-light', label: 'display', sample: 'Merope' },
  { cls: 'text-title font-light', label: 'title', sample: 'The Lost Pleiad' },
  { cls: 'text-heading', label: 'heading', sample: 'Reflection nebula' },
  { cls: 'text-subhead italic', label: 'subhead', sample: 'Passing through unrelated dust' },
  { cls: 'text-base', label: 'base', sample: 'Body copy is set in Newsreader, not a sans.' },
  { cls: 'annotation', label: 'annotation', sample: 'Margin lettering · 03h 46m' },
];

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-rule border-t pt-6">
      <h2 className="mb-6 flex items-baseline gap-3">
        <span className="annotation text-accent">{n}</span>
        <span className="text-heading font-normal">{title}</span>
      </h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  return (
    <main className="mx-auto max-w-(--measure-wide) px-6 py-12 sm:px-10">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="annotation text-ink-faint mb-3">Internal · not indexed</p>
          <h1 className="text-title font-light">Styleguide</h1>
          <p className="text-ink-muted mt-3 max-w-(--measure-prose)">
            Every token, both themes, one page. Flip the toggle and check that nothing here needs a
            second set of rules to survive the change. Facts in section 05 are sourced in
            docs/LORE.md.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="space-y-14">
        <Section n="01" title="Surfaces & ink">
          <ul className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {SURFACES.map((s) => (
              <li key={s.token} className="border-rule flex items-center gap-4 border p-3">
                <span
                  aria-hidden
                  className="border-rule size-11 shrink-0 border"
                  style={{ background: `var(${s.token})` }}
                />
                <span className="min-w-0">
                  <span className="annotation block">{s.label}</span>
                  <span className="text-ink-muted block text-sm">{s.use}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section n="02" title="Type">
          <div className="space-y-6">
            {TYPE.map((t) => (
              <div key={t.label} className="flex flex-col gap-1.5">
                <span className="annotation text-ink-faint">{t.label}</span>
                <p className={t.cls}>{t.sample}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section n="03" title="Magnitude">
          <p className="text-ink-muted mb-6 max-w-(--measure-prose)">
            Lower is brighter, the way the real scale runs. It doubles as the project status system,
            so a status is never invented — it is a position on a scale that already existed.
          </p>
          <ul className="border-rule border-t">
            {MAGNITUDE_CLASSES.map((m) => (
              <li
                key={m.mag}
                className="border-rule flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b py-2.5"
                style={{ opacity: `var(--mag-${m.mag})` }}
              >
                <span className="annotation text-accent w-8 shrink-0">m{m.mag}</span>
                <span className="font-mono text-sm">{m.label}</span>
                <span className="text-ink-muted text-sm">{m.meaning}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section n="04" title="The mark">
          <p className="text-ink-muted mb-5 max-w-(--measure-prose)">
            One accent for the star, one for the grease pencil. The pencil is rationed: it means
            something on this page needs your attention, and nothing else.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="bg-mark-soft text-mark annotation border-mark border px-3 py-1.5">
              Attention
            </span>
            <span className="bg-accent-soft text-accent annotation border-accent border px-3 py-1.5">
              {STAR.spectralType}
            </span>
            <button
              type="button"
              className="annotation border-rule hover:border-ink border px-3 py-1.5"
            >
              Focus me (tab)
            </button>
          </div>
        </Section>

        <Section n="05" title="Lore under test">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
            {[
              ['Designation', `${STAR.designation} · ${STAR.catalog.hd}`],
              ['Coordinates', `${STAR.ra.display} ${STAR.dec.display}`],
              [
                'Magnitude',
                `${STAR.magnitude} — ${STAR.rankAmongSisters}th brightest of the seven, not the faintest`,
              ],
              ['Distance', `${STAR.distanceLightYears} ± ${STAR.distanceUncertaintyLightYears} ly`],
              ['Spectrum', `${STAR.spectralType} — where the accent comes from`],
              ['Nebula', `${NEBULA.ngc} — ${NEBULA.names.join(' / ')}`],
              [
                'Interloper',
                `${NEBULA.knot.designation} — ${NEBULA.knot.distanceAu} AU from the star`,
              ],
              ['Plate', `${PLATE.date} — ${PLATE.revealed}`],
              ['Spare parts', `Built from ${SUPERCOMPUTER.builtFrom} — ${SUPERCOMPUTER.thesis}`],
              ['Thesis', NEBULA.thesis],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="annotation pt-1">{k}</dt>
                <dd className="border-rule border-b pb-3 sm:border-0 sm:pb-0">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </main>
  );
}
