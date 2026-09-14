import { Catalogue, type CatalogueEntry } from '@/design/components/Catalogue';
import { HeroField } from '@/design/components/HeroField';
import { SiteFooter } from '@/design/components/SiteFooter';
import { SiteHeader } from '@/design/components/SiteHeader';
import { SectionHead } from '@/design/components/primitives';
import { getProjects } from '@/lib/content/collections';
import { type Magnitude, NEBULA } from '@/lib/merope';
import { SITE, STATEMENT } from '@/lib/site';

/**
 * The home page — first assembly.
 *
 * Not a phase of its own but the point three phases meet (docs/ROADMAP.md).
 * What is here now is everything Phase 2 owns: the header, the hero, the
 * statement, the catalogue and the footer. Phase 3 inserts a recent-notes strip
 * above the footer and Phase 4 a newsletter below it; both slot in without
 * moving anything else, which is why the blocks are ordered the way they are.
 *
 * It is a complete, launchable page as it stands. The nav is empty because
 * nothing else resolves yet, not because it is unfinished.
 */
export default function Home() {
  const entries: CatalogueEntry[] = getProjects().map((project) => ({
    name: project.name,
    summary: project.summary,
    magnitude: project.magnitude as Magnitude,
    kind: project.kind,
    firstLight: project.firstLight,
    url: project.url,
    repo: project.repo,
  }));

  return (
    <div className="mx-auto max-w-(--measure-wide) px-6 py-10 sm:px-10">
      <SiteHeader home={false} />

      <main>
        {/* ------------------------------------------------------------ Hero */}
        {/* Sized to the first screen and centred in it — see --header-block.
            The name and the cluster share a line, and the statement runs
            underneath both: the studio's own sentence reads as a caption to the
            pair rather than as a column competing with the field.

            What used to sit under the name was `23 Tau · M45 · B6IV(e)`. It is
            gone rather than moved — astronomy with no job on a landing page —
            and the footer already carries the fuller coordinate line for anyone
            who wants it. */}
        <section className="screenful py-8 [--screen-offset:var(--header-block)] md:py-10">
          {/* The name and the cluster take the room above the statement and
              centre in it; the statement is pinned to the foot of the screen.
              `flex-1` rather than a margin, so the split follows the viewport
              instead of a guess about how tall it is. */}
          <div className="flex flex-1 items-center">
            <div className="flex w-full flex-col items-start gap-8 md:flex-row md:items-center md:justify-between md:gap-16">
              <div className="max-w-(--measure-prose)">
                <h1 className="text-display leading-[0.9] font-extralight tracking-tight">
                  {SITE.name}
                </h1>
                {/* The thesis, and the reason for the name. Everything else on
                    the page can be checked against it. */}
                <p className="text-subhead text-ink-muted mt-6 leading-snug italic">
                  {NEBULA.thesis}
                </p>
              </div>

              <HeroField size={460} />
            </div>
          </div>

          {/* One paragraph, not three. Set as separate blocks the sentences read
              as a list of claims; run together they read as a statement, which
              is what it is. The array stays split so each sentence can be
              checked on its own. */}
          {/* Centred, column and text both. Centred prose is normally a bad
              default — a ragged left edge costs the eye the start of every line
              — and it is used here for the one paragraph that can carry it: four
              lines, no lists, no links, sitting symmetrically under the name and
              the field as a caption to the pair rather than as a column of
              reading. It does not generalise; prose elsewhere stays flush left.
              Keep the measure tight if the copy ever grows. */}
          <p className="mx-auto mt-10 max-w-(--measure-prose) text-center text-lg leading-relaxed">
            {STATEMENT.join(' ')}
          </p>
        </section>

        {/* ------------------------------------------------------- Catalogue */}
        <section className="screenful py-16">
          <SectionHead reference="01" title="The catalogue">
            Everything the studio has put its name on, brightest first. First light is the date a
            thing became usable by someone other than its author.
          </SectionHead>
          <Catalogue entries={entries} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
