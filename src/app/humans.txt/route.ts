import { getNotes, getProjects, getReleases } from '@/lib/content/collections';
import { formatDate } from '@/lib/format';
import { NEBULA, STAR } from '@/lib/merope';
import { SITE } from '@/lib/site';

/**
 * /humans.txt, written as an observing log.
 *
 * Generated rather than hand-kept, for the same reason the sitemap is: every
 * fact in it already exists somewhere authoritative, and a copy is a thing that
 * drifts. The coordinates come from `merope.ts`, the counts from the content
 * layer, so the file cannot claim four projects on a site that ships one.
 *
 * `force-static` makes this a file in the export rather than a handler. There
 * is no server to run it on.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  const projects = getProjects();
  const notes = getNotes();
  const releases = getReleases();

  const log = `OBSERVING LOG — ${SITE.domain}

TARGET
  ${STAR.designation} — ${STAR.cluster.name} (${STAR.cluster.messier})
  ${STAR.ra.display}  ${STAR.dec.display}
  ${STAR.spectralType} · m${STAR.magnitude} · ${STAR.distanceLightYears} ± ${STAR.distanceUncertaintyLightYears} ly

  ${NEBULA.thesis}

OBSERVER
  ${SITE.author.name}
  ${SITE.author.email}
  ${SITE.social.github}

INSTRUMENT
  Next.js, exported static. No server, no database, no runtime.
  Newsreader and IBM Plex Mono. No sans-serif anywhere.
  Two themes: plate and sky. The plate is the negative, which is correct.
  Star positions from SIMBAD and Gaia DR3, never placed by hand.

PLATE
  ${projects.length} project${projects.length === 1 ? '' : 's'}
  ${notes.length} note${notes.length === 1 ? '' : 's'}
  ${releases.length} release${releases.length === 1 ? '' : 's'}

NOTES
  Every astronomical claim on this site is cited in docs/LORE.md.
  Merope is the fourth-brightest of the seven sisters, not the faintest.
  The nebula is not hers; she is only what happens to be lighting it.

LOGGED
  ${formatDate(new Date())}
`;

  return new Response(log, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
