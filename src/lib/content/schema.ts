import { z } from 'zod';

/**
 * Frontmatter contracts.
 *
 * Every content file is validated at build time. A malformed post should break
 * the build loudly rather than render a page with an empty date — on a static
 * site the build is the only place a mistake can still be caught for free.
 */

/**
 * `YYYY-MM-DD`, always resolved to UTC midnight so a post never shifts a day
 * depending on where the build ran.
 *
 * The preprocess step is not optional: YAML 1.1 treats an unquoted `2026-09-13`
 * as a timestamp, so gray-matter hands us a `Date` for exactly the frontmatter
 * people write naturally, and a `string` only when they quote it. Accepting one
 * and not the other rejects every real content file.
 */
const isoDate = z.preprocess(
  (value) => {
    if (value instanceof Date) return value;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(`${value}T00:00:00Z`);
    }
    // Anything else falls through and is rejected by z.date() below.
    return value;
  },
  z.date({ error: 'expected YYYY-MM-DD' }),
);

const magnitude = z
  .number()
  .int()
  .min(1, 'magnitude 1 is the brightest there is')
  .max(7, 'magnitude 7 is already below the naked-eye limit');

/** A written note. Long-form, dated, occasionally about a project. */
export const noteSchema = z.object({
  title: z.string().min(1),
  /** Used verbatim as the meta description and the index blurb. */
  description: z.string().min(1).max(200),
  date: isoDate,
  updated: isoDate.optional(),
  tags: z.array(z.string()).default([]),
  /** Slug of the project this belongs to, if any. */
  project: z.string().optional(),
  /** Drafts build in dev and are excluded from production output. */
  draft: z.boolean().default(false),
});

/** One release of one project. */
export const releaseSchema = z.object({
  project: z.string().min(1),
  version: z.string().min(1),
  date: isoDate,
  /** One line summarising the release, for the combined changelog feed. */
  headline: z.string().min(1).max(160),
  /** Flags a release that needs a human to do something before upgrading. */
  breaking: z.boolean().default(false),
  draft: z.boolean().default(false),
});

/** A project in the studio's catalogue. */
export const projectSchema = z.object({
  name: z.string().min(1),
  /** Shown in the catalogue row. Must survive being read on its own. */
  summary: z.string().min(1).max(200),
  /** Status, expressed on the scale the whole site already uses. */
  magnitude,
  /** Plain-language category. The lore stays in the column header, not here. */
  kind: z.enum(['app', 'tool', 'library', 'service', 'experiment']),
  /** Launch date. Astronomers call a telescope's first real image "first light". */
  firstLight: isoDate,
  /** Live site, usually a subdomain of merope.dev. */
  url: z.string().url().optional(),
  repo: z.string().url().optional(),
  /** Overrides catalogue ordering; otherwise sorted by magnitude then name. */
  order: z.number().int().optional(),
  draft: z.boolean().default(false),
});

export type Note = z.infer<typeof noteSchema>;
export type Release = z.infer<typeof releaseSchema>;
export type Project = z.infer<typeof projectSchema>;

export type Entry<T> = T & {
  /** Derived from the filename, never from frontmatter. */
  slug: string;
  /** Raw MDX body, not yet rendered. */
  body: string;
  /** Repo-relative source path, for error messages and "edit this page" links. */
  sourcePath: string;
};
