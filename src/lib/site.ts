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

/** Top-level navigation. Order is deliberate: work, then words, then who. */
export const NAV = [
  { href: '/projects', label: 'Projects' },
  { href: '/notes', label: 'Notes' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/studio', label: 'Studio' },
] as const;
