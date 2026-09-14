/**
 * Dates, formatted one way.
 *
 * ISO, always, and always in UTC. Three reasons, in order of how much they
 * matter:
 *
 *  1. A build machine's timezone must never shift a launch by a day. Every date
 *     in `content/` is parsed to UTC midnight; formatting in local time would
 *     undo that at the last step.
 *  2. It is unambiguous. `03/04/2026` is two different days depending on who is
 *     reading, and this site has readers in both camps.
 *  3. It is tabular. Fixed-width dates in IBM Plex Mono line up in a margin
 *     without a table, which is the whole premise of how the catalogue and the
 *     notes index are set.
 *
 * Extracted here once a third surface needed it — the catalogue, the notes
 * index and the note page. Two would still have been a coincidence.
 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
