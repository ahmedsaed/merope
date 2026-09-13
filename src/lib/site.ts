/** Site-wide configuration. Anything that would change if the domain changed. */
export const SITE = {
  name: 'Merope',
  domain: 'merope.dev',
  url: 'https://merope.dev',
  /** One line. It has to work as a page title, an OG description, and a bio. */
  tagline: 'A studio for things worth looking twice at.',
  description:
    'Merope is a software studio. It builds, maintains, and writes about a small number of projects.',
  author: { name: 'Ahmed Saed', email: 'hello@merope.dev' },
  locale: 'en',
  /** Filled in as projects get their own subdomains. */
  social: { github: 'https://github.com/ahmedsaed' },
} as const;

/**
 * Top-level navigation. Order is deliberate: work, then words, then who.
 *
 * `live` is the whole point. The nav shows only routes that actually resolve,
 * so the site never ships a dead link or a stub page apologising for itself —
 * it grows an item at a time as the phases land. Flipping a flag here is the
 * last step of building the route, not a separate decision.
 */
export const NAV = [
  { href: '/projects', label: 'Projects', live: false },
  { href: '/notes', label: 'Notes', live: false },
  { href: '/changelog', label: 'Changelog', live: false },
  { href: '/studio', label: 'Studio', live: false },
] as const;

export const liveNav = () => NAV.filter((item) => item.live);

/**
 * The studio, in three sentences.
 *
 * Kept here rather than in the page because it is the one piece of copy that
 * has to agree with the catalogue underneath it — the third sentence explains
 * the scale the rows are measured on, and both come from the same file.
 */
export const STATEMENT = [
  'Merope is a software studio of one.',
  'It builds a small number of things, keeps them running afterwards, and writes down what that takes.',
  'The catalogue says how alive each one is, on the scale a star’s brightness is measured on: lower is brighter, and six is the limit of what the eye can see unaided.',
] as const;
