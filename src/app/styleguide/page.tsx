import type { Metadata } from 'next';
import { Mark } from '@/design/components/Mark';
import { StarField } from '@/design/components/StarField';
import { ThemeToggle } from '@/design/components/ThemeToggle';
import { Wordmark } from '@/design/components/Wordmark';
import { Annotation, Field, MagnitudeDot, Rule, SectionHead } from '@/design/components/primitives';
import {
  MAGNITUDE_CLASSES,
  NEBULA,
  PLATE,
  PLEIADES,
  PLEIADES_MISSING,
  STAR,
  SUPERCOMPUTER,
  type Magnitude,
} from '@/lib/merope';
import { projectCluster } from '@/lib/sky';

export const metadata: Metadata = {
  title: 'Styleguide',
  description: 'Every token and primitive in the Merope design system, in both themes.',
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
  { cls: 'text-display font-extralight tracking-tight', label: 'display', sample: 'Merope' },
  { cls: 'text-title font-light', label: 'title', sample: 'The Lost Pleiad' },
  { cls: 'text-heading', label: 'heading', sample: 'An interstellar interloper' },
  {
    cls: 'text-subhead italic font-light',
    label: 'subhead',
    sample: 'Passing through unrelated dust',
  },
  { cls: 'text-base', label: 'base', sample: 'Body copy is set in Newsreader, not a sans.' },
  { cls: 'annotation', label: 'annotation', sample: 'Margin lettering · 03h 46m' },
];

/** Sample rows for the two catalogue treatments. Only the first is real. */
const CATALOGUE = [
  {
    name: 'merope.dev',
    magnitude: 3 as Magnitude,
    kind: 'service',
    firstLight: '2026—09—13',
    summary: 'The studio itself — front door, notes, changelogs.',
    real: true,
  },
  {
    name: 'Example tool',
    magnitude: 4 as Magnitude,
    kind: 'tool',
    firstLight: '—',
    summary: 'Rows dim to their own magnitude, so status reads before it is read.',
    real: false,
  },
  {
    name: 'Example experiment',
    magnitude: 6 as Magnitude,
    kind: 'experiment',
    firstLight: '—',
    summary: 'An experiment sits at the naked-eye limit and looks like one.',
    real: false,
  },
];

function Section({
  n,
  title,
  lede,
  children,
}: {
  n: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-rule border-t pt-7">
      <SectionHead reference={n} title={title}>
        {lede}
      </SectionHead>
      {children}
    </section>
  );
}

export default function Styleguide() {
  const projected = projectCluster(PLEIADES);

  return (
    <main className="mx-auto max-w-(--measure-wide) px-6 py-12 sm:px-10">
      <header className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Annotation tone="faint" as="p" className="mb-3">
            Internal · not indexed
          </Annotation>
          <h1 className="text-title font-light">Styleguide</h1>
          <p className="text-ink-muted mt-3 max-w-(--measure-prose)">
            Every token and primitive, both themes, one page. Flip the toggle and check that nothing
            here needs a second set of rules to survive the change. Facts in section 09 are sourced
            in <code className="font-mono text-sm">docs/LORE.md</code>.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="space-y-16">
        <Section
          n="01"
          title="The mark"
          lede="A star circled in grease pencil — the gesture an astronomer made on a plate to say this one. The ring is an open arc rather than a circle, and thickens as it shrinks so it survives a browser tab."
        >
          <div className="border-rule flex flex-wrap items-end gap-10 border p-8">
            {[96, 48, 24, 16].map((size) => (
              <div key={size} className="flex flex-col items-start gap-3">
                <Annotation tone="faint">{size}px</Annotation>
                <Mark size={size} title={size === 96 ? 'The Merope mark' : undefined} />
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="border-rule flex min-h-28 items-center justify-center border p-6">
              <Wordmark size="display" />
            </div>
            <div className="border-rule flex min-h-28 items-center justify-center border p-6">
              <Wordmark size="display" lockup />
            </div>
          </div>
          <Annotation tone="faint" as="p" className="mt-3">
            Left: the signature. Right: with the catalogue lockup, for the hero and footer.
          </Annotation>
        </Section>

        <Section
          n="02"
          title="The star field"
          lede="The Pleiades at their real relative positions. Every dot is projected from published coordinates — nothing is hand-placed, because a star chart that is only approximately the sky is just a pattern of dots."
        >
          <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
            <div className="border-rule flex justify-center border p-6">
              <StarField size={340} nebula labelled />
            </div>
            <div>
              <div className="border-rule border-t">
                {projected.map(({ star, x, y }) => (
                  <div
                    key={star.designation}
                    className="border-rule grid grid-cols-[1.5rem_minmax(4rem,1fr)_auto] items-baseline gap-x-4 border-b py-2"
                  >
                    <MagnitudeDot magnitude={Math.round(star.magnitude) as Magnitude} size={9} />
                    <span className={star.name === 'Merope' ? 'text-accent' : ''}>{star.name}</span>
                    <span className="annotation tabular-nums">
                      {star.designation} · m{star.magnitude} · {(x * 100).toFixed(0)},
                      {(y * 100).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-mark bg-mark-soft mt-5 border-l-2 p-3.5">
                <Annotation tone="mark" as="p">
                  Incomplete — blocks the Phase 2 hero
                </Annotation>
                <p className="mt-1.5 text-sm">
                  {PLEIADES_MISSING.join(', ')} are missing. Their coordinates could not be verified
                  from this environment, and one search returned Asterope with Alcyone&rsquo;s right
                  ascension — a plausible wrong number of exactly the kind this system exists to
                  keep out. Add from SIMBAD before the hero ships.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section n="03" title="Surfaces &amp; ink">
          <ul className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {SURFACES.map((s) => (
              <li key={s.token} className="border-rule flex items-center gap-4 border p-3">
                <span
                  aria-hidden
                  className="border-rule size-11 shrink-0 border"
                  style={{ background: `var(${s.token})` }}
                />
                <span className="min-w-0">
                  <Annotation className="block">{s.label}</Annotation>
                  <span className="text-ink-muted block text-sm">{s.use}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          n="04"
          title="Type"
          lede="Two families, no sans. Newsreader carries everything a person reads; IBM Plex Mono carries everything a person looks up."
        >
          <div className="space-y-6">
            {TYPE.map((t) => (
              <div key={t.label} className="flex flex-col gap-1.5">
                <Annotation tone="faint">{t.label}</Annotation>
                <p className={t.cls}>{t.sample}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          n="05"
          title="Magnitude"
          lede="Lower is brighter, the way the real scale runs. It doubles as the project status system, so a status is never invented — it is a position on a scale that already existed."
        >
          <ul className="border-rule border-t">
            {MAGNITUDE_CLASSES.map((m) => (
              <li
                key={m.mag}
                className="border-rule flex flex-wrap items-center gap-x-5 gap-y-1 border-b py-2.5"
                style={{ opacity: `var(--mag-${m.mag})` }}
              >
                <Annotation tone="accent" className="w-8 shrink-0">
                  m{m.mag}
                </Annotation>
                <MagnitudeDot magnitude={m.mag} />
                <span className="font-mono text-sm">{m.label}</span>
                <span className="text-ink-muted text-sm">{m.meaning}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          n="06"
          title="The catalogue — two treatments"
          lede="Same data, two registers. A dense bordered table risks reading as a spreadsheet at the handful of projects this will actually have; the index gets its tabular quality from alignment instead of borders. Pick by looking."
        >
          <Annotation tone="accent" as="p" className="mb-3">
            A · Catalogue
          </Annotation>
          <div className="border-rule overflow-x-auto border">
            <table className="w-full min-w-[34rem] border-collapse">
              <thead>
                <tr>
                  {['Designation', 'Mag', 'Class', 'First light', 'Summary'].map((h) => (
                    <th
                      key={h}
                      className="annotation border-rule-strong border-b px-3.5 py-2.5 text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATALOGUE.map((row) => (
                  <tr key={row.name} style={{ opacity: `var(--mag-${row.magnitude})` }}>
                    <td className="border-rule border-b px-3.5 py-2.5 font-medium">{row.name}</td>
                    <td className="border-rule annotation border-b px-3.5 py-2.5">
                      {row.magnitude}
                    </td>
                    <td className="border-rule annotation border-b px-3.5 py-2.5">{row.kind}</td>
                    <td className="border-rule annotation border-b px-3.5 py-2.5 whitespace-nowrap">
                      {row.firstLight}
                    </td>
                    <td className="border-rule text-ink-muted border-b px-3.5 py-2.5 text-sm">
                      {row.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Annotation tone="accent" as="p" className="mt-10 mb-3">
            B · Index
          </Annotation>
          <ul className="border-rule border-t">
            {CATALOGUE.map((row) => (
              <li key={row.name} className="border-rule border-b py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                  <div className="flex items-baseline gap-3.5">
                    <MagnitudeDot magnitude={row.magnitude} size={11} />
                    <h3 className="text-heading font-normal">{row.name}</h3>
                  </div>
                  <Annotation tone="faint" className="tabular-nums">
                    m{row.magnitude} · {row.kind} · first light {row.firstLight}
                  </Annotation>
                </div>
                <p className="text-ink-muted mt-2 max-w-(--measure-prose)">{row.summary}</p>
              </li>
            ))}
          </ul>
          <Annotation tone="faint" as="p" className="mt-3">
            Only merope.dev is a real project — the other two are examples
          </Annotation>
        </Section>

        <Section
          n="07"
          title="Prose"
          lede="Scoped to .prose so it never leaks into data. Headings separate by space and weight rather than scale; a 2.5rem heading inside an essay breaks the reading rhythm."
        >
          <div className="prose">
            <h2>An interstellar interloper</h2>
            <p>
              Astronomers call a telescope&rsquo;s first real image <strong>first light</strong>. It
              is rarely a good image &mdash; the point is that the instrument works end to end, and
              that everything after it is <em>refinement</em>.
            </p>
            <h3>What the plate recorded</h3>
            <ul>
              <li>Warm stock, carbon ink, paper tooth.</li>
              <li>
                Margin lettering, set small and wide, in{' '}
                <a href="#">the archive&rsquo;s own hand</a>.
              </li>
              <li>A grease pencil, rationed to one meaning.</li>
            </ul>
            <ol>
              <li>Expose the plate.</li>
              <li>Develop it.</li>
              <li>Argue about what is on it for a century.</li>
            </ol>
            <blockquote>The star is not the point. What it lights up is.</blockquote>
            <p>
              Inline code such as <code>--mag-4</code> is a tinted chip, not a bordered box.
            </p>
            <pre>
              <code>{`const thesis = 'The star is not the point.';\nexport const magnitude = 4.18;`}</code>
            </pre>
          </div>
          <Annotation tone="faint" as="p" className="mt-3">
            Syntax highlighting is applied by Shiki at build time — see a real note for the themed
            version
          </Annotation>
        </Section>

        <Section n="08" title="Primitives">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <Annotation tone="faint" as="p" className="mb-2">
                Annotation
              </Annotation>
              <div className="flex flex-col gap-1.5">
                <Annotation>Default · muted</Annotation>
                <Annotation tone="faint">Faint · at rest</Annotation>
                <Annotation tone="accent">Accent · the star</Annotation>
                <Annotation tone="mark">Mark · needs attention</Annotation>
              </div>
            </div>
            <div>
              <Annotation tone="faint" as="p" className="mb-2">
                Rule
              </Annotation>
              <Rule />
              <p className="text-ink-muted py-2 text-sm">Hairline</p>
              <Rule tone="strong" />
              <p className="text-ink-muted pt-2 text-sm">Strong</p>
            </div>
            <div className="sm:col-span-2">
              <Annotation tone="faint" as="p" className="mb-2">
                Field
              </Annotation>
              <dl className="border-rule space-y-3 border-t pt-3">
                <Field label="Designation">
                  {STAR.designation} · {STAR.catalog.hd}
                </Field>
                <Field label="Coordinates">
                  {STAR.ra.display} {STAR.dec.display}
                </Field>
                <Field label="Spectrum">{STAR.spectralType}</Field>
              </dl>
            </div>
          </div>
        </Section>

        <Section
          n="09"
          title="Lore under test"
          lede="Every fact the UI can display, rendered from src/lib/merope.ts so a wrong value shows up here first."
        >
          <dl className="border-rule space-y-3 border-t pt-3">
            <Field label="Magnitude">
              {STAR.magnitude} — {STAR.rankAmongSisters}th brightest of the seven, not the faintest
            </Field>
            <Field label="Distance">
              {STAR.distanceLightYears} ± {STAR.distanceUncertaintyLightYears} ly
            </Field>
            <Field label="Nebula">
              {NEBULA.ngc} — {NEBULA.names.join(' / ')}
            </Field>
            <Field label="Interloper">
              {NEBULA.knot.designation} — {NEBULA.knot.distanceAu} AU from the star
            </Field>
            <Field label="Plate">
              {PLATE.date} — {PLATE.revealed}
            </Field>
            <Field label="Spare parts">
              Built from {SUPERCOMPUTER.builtFrom} — {SUPERCOMPUTER.thesis}
            </Field>
            <Field label="Thesis">{NEBULA.thesis}</Field>
          </dl>
        </Section>
      </div>
    </main>
  );
}
