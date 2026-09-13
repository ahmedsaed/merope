import { StarField } from '@/design/components/StarField';
import { ThemeToggle } from '@/design/components/ThemeToggle';
import { Wordmark } from '@/design/components/Wordmark';
import { Annotation } from '@/design/components/primitives';
import { COORDINATE_LINE, NEBULA } from '@/lib/merope';
import { SITE } from '@/lib/site';

/**
 * Still a placeholder — Phase 2 builds the real home page, with the statement,
 * the catalogue and a hero that does more than centre a star field. This exists
 * so the mark and the field are visible somewhere other than the styleguide.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-(--measure-wide) flex-col justify-between px-6 py-10 sm:px-10">
      <header className="flex items-center justify-between gap-4">
        <Wordmark size="nav" />
        <ThemeToggle />
      </header>

      <div className="flex flex-col items-start gap-12 py-16 md:flex-row md:items-center md:gap-16">
        <div>
          <Annotation tone="accent" as="p" className="mb-6">
            Phase 1 · identity
          </Annotation>
          <h1 className="text-display leading-[0.92] font-extralight tracking-tight">
            {SITE.name}
          </h1>
          <p className="text-subhead text-ink-muted mt-6 max-w-(--measure-prose) italic">
            {NEBULA.thesis}
          </p>
        </div>
        <StarField size={300} nebula className="shrink-0" />
      </div>

      <footer className="rule-hair flex flex-wrap items-center justify-between gap-3 pt-4">
        <Annotation>{COORDINATE_LINE}</Annotation>
        <Annotation className="mag-5">{SITE.domain}</Annotation>
      </footer>
    </main>
  );
}
