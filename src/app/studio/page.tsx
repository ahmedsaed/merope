import type { Metadata } from 'next';
import { Page } from '@/design/components/Page';
import { Annotation, Field, SectionHead } from '@/design/components/primitives';
import { MAGNITUDE_CLASSES, NEBULA, PLATE, STAR, SUPERCOMPUTER } from '@/lib/merope';
import { pageMetadata } from '@/lib/seo';
import { SITE, STATEMENT } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Studio',
  description: 'What Merope is, who runs it, and why it is named after a star that lights dust.',
  path: '/studio',
});

/**
 * The studio page, and the home for the astronomy.
 *
 * The landing page deliberately says almost none of this: a visitor who has
 * never heard of Merope should read a clean studio site, and the lore belongs
 * in the details and the vocabulary rather than in the way (`docs/BRAND.md`).
 * This is the one page where someone has actively asked, so it is the one page
 * that answers at length — including the catalogue designation that used to sit
 * under the name in the hero and had no job there.
 *
 * **Every fact on this page comes from `src/lib/merope.ts` and is cited in
 * `docs/LORE.md`.** Nothing is written from memory, including the hedges: the
 * Lost Pleiad attribution is contested, so it says "most commonly identified
 * as" rather than asserting it.
 */
export default function StudioPage() {
  return (
    <Page>
      <div className="py-14">
        <section>
          <SectionHead title="Studio" />
          <div className="max-w-(--measure-prose) space-y-5 text-lg leading-relaxed">
            <p>{STATEMENT.join(' ')}</p>
            <p className="text-ink-muted">
              It is run by {SITE.author.name}. If you want something built, or you want to argue
              with something written here,{' '}
              <a
                href={`mailto:${SITE.author.email}`}
                className="text-ink hover:text-accent underline decoration-[0.5px] underline-offset-4 transition-colors"
              >
                {SITE.author.email}
              </a>{' '}
              reaches a person.
            </p>
          </div>
        </section>

        <section className="border-rule mt-20 border-t pt-12">
          <SectionHead reference="01" title="The name" />
          <div className="prose">
            <p>
              Merope is one of the seven Pleiades, and the sister most commonly identified as the{' '}
              <em>Lost Pleiad</em> — the one who married a mortal while her sisters consorted with
              gods, and hid her face afterwards. Both that attribution and the rival one for Electra
              are ancient, and neither is settled.
            </p>
            <p>
              She is <strong>not</strong> the faintest of the seven, which is a thing popular
              astronomy writing repeats constantly. At magnitude {STAR.magnitude} she is the{' '}
              {STAR.rankAmongSisters}th brightest of them. The title is mythological, not
              photometric: she is not the dimmest sister, she is the one with a story about dimming.
              For a studio of deliberately understated things, that is the more useful half.
            </p>

            <h2>What it lights up</h2>
            <p>
              The wisps around her — {NEBULA.ngc}, found by {NEBULA.discovery.by} in 1859 — were
              long assumed to be what remained of the cloud the Pleiades formed from. They are not.
              It is an unrelated interstellar cloud the cluster happens to be drifting through, and
              the nebulosity exists only because Merope&rsquo;s light is falling on it.
            </p>
            <blockquote>{NEBULA.thesis}</blockquote>
            <p>
              That is the whole idea. This site is the star; the projects are what it makes visible.
              A front door should not compete with the rooms.
            </p>

            <h2>Spare parts, real work</h2>
            <p>
              NASA Ames named a supercomputer Merope and then made the name literal: it was built
              out of the {SUPERCOMPUTER.builtFromDetail}, retired from {SUPERCOMPUTER.builtFrom} —
              the larger system named after the cluster Merope belongs to. {SUPERCOMPUTER.cores}{' '}
              cores, {SUPERCOMPUTER.peakTeraflops} teraflops, doing real science for eight years.
              Nothing has to be built with a budget to be worth using.
            </p>

            <h2>The plate</h2>
            <p>
              On {PLATE.date}, {PLATE.by.join(' and ')} photographed the Pleiades with the{' '}
              {PLATE.instrument} and recorded nebulosity nobody had seen through an eyepiece,
              including {PLATE.revealed}. The camera saw what the eye could not, and a plate is a
              negative — which is why the light theme here is the archive rather than a concession
              to daylight.
            </p>
          </div>
        </section>

        <section className="border-rule mt-20 border-t pt-12">
          <SectionHead reference="02" title="Magnitude">
            The scale the catalogue borrows. It is inverted and logarithmic — lower is brighter —
            and six is the real limit of what an unaided eye can see, which makes it an honest way
            to say how alive a project is.
          </SectionHead>
          <ul className="border-rule border-t">
            {MAGNITUDE_CLASSES.map((m) => (
              <li
                key={m.mag}
                className="border-rule flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b py-3"
                style={{ opacity: `var(--mag-${m.mag})` }}
              >
                <Annotation tone="accent" className="w-8 shrink-0">
                  m{m.mag}
                </Annotation>
                <span className="font-mono text-sm">{m.label}</span>
                <span className="text-ink-muted text-sm">{m.meaning}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-rule mt-20 border-t pt-12">
          <SectionHead reference="03" title="23 Tauri">
            The star itself, as a catalogue prints it. Every value is cited in{' '}
            <code className="font-mono text-sm">docs/LORE.md</code>.
          </SectionHead>
          <dl className="max-w-(--measure-prose) space-y-3">
            <Field label="Designation">
              {STAR.designation} · {STAR.catalog.hd}
            </Field>
            <Field label="Cluster">
              {STAR.cluster.messier} — {STAR.cluster.name}
            </Field>
            <Field label="Right ascension">{STAR.ra.display}</Field>
            <Field label="Declination">{STAR.dec.display}</Field>
            <Field label="Spectral type">{STAR.spectralType}</Field>
            <Field label="Magnitude">{STAR.magnitude}</Field>
            <Field label="Distance">
              {STAR.distanceLightYears} ± {STAR.distanceUncertaintyLightYears} light years
            </Field>
            <Field label="Nebula">
              {NEBULA.ngc} · {NEBULA.names.join(' · ')}
            </Field>
            <Field label="Knot">
              {NEBULA.knot.designation} — {NEBULA.knot.name}, {NEBULA.knot.distanceAu} AU out
            </Field>
          </dl>
        </section>
      </div>
    </Page>
  );
}
