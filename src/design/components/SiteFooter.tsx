import { COORDINATE_LINE, STAR, SUPERCOMPUTER } from '@/lib/merope';
import { SITE } from '@/lib/site';
import { Annotation } from './primitives';

/**
 * The colophon, set the way a plate is captioned at its edge.
 *
 * Two facts and two links. The coordinate line is the plate's own label — the
 * object, where to point, what it is, how bright — and the sentence under it is
 * the studio's second thesis, which is worth a footer precisely because it is
 * true rather than aspirational: NASA Ames really did assemble a machine called
 * Merope out of nodes retired from Pleiades.
 */
export function SiteFooter() {
  const years = `${new Date(SUPERCOMPUTER.inService.from).getUTCFullYear()}–${new Date(
    SUPERCOMPUTER.inService.to,
  ).getUTCFullYear()}`;

  return (
    <footer className="border-rule mt-20 border-t pt-6">
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
        <div className="max-w-(--measure-prose)">
          <Annotation as="p" className="tabular-nums">
            {COORDINATE_LINE}
          </Annotation>
          <p className="text-ink-muted mt-3 text-sm">
            NASA Ames named a supercomputer after this star, then built it out of the nodes retired
            from {SUPERCOMPUTER.builtFrom} — the cluster she belongs to. It ran real science for
            eight years, {years}. <em className="text-ink not-italic">{SUPERCOMPUTER.thesis}</em>
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <li>
            <a
              href={SITE.social.github}
              className="annotation hover:text-accent transition-colors"
              rel="me noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href={`mailto:${SITE.author.email}`}
              className="annotation hover:text-accent transition-colors"
            >
              {SITE.author.email}
            </a>
          </li>
        </ul>
      </div>

      <p className="annotation mt-8 flex flex-wrap justify-between gap-x-6 gap-y-1">
        <span>
          {SITE.domain} · {SITE.author.name}
        </span>
        <span className="text-ink-faint">
          {STAR.distanceLightYears} light years, give or take {STAR.distanceUncertaintyLightYears}
        </span>
      </p>
    </footer>
  );
}
