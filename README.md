# merope.dev

The landing page and content home for the **Merope** software studio. Individual
projects live on subdomains; this repo is the front door.

Merope is the faint one in the Pleiades — and the star whose only claim on the
nebula around it is that it happens to be lighting dust it did not make.

> The star is not the point. What it lights up is.

## Stack

|           |                                           |
| --------- | ----------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)        |
| Output    | Fully static — `output: 'export'`         |
| Styling   | Tailwind CSS v4, CSS-first tokens         |
| Content   | Markdown/MDX, Zod-validated at build time |
| Type      | Newsreader + IBM Plex Mono. No sans.      |
| Hosting   | Vercel                                    |

## Getting started

```bash
pnpm install
pnpm dev
```

| Command                    |                                               |
| -------------------------- | --------------------------------------------- |
| `pnpm dev`                 | Dev server                                    |
| `pnpm build`               | Static export to `out/`                       |
| `pnpm verify`              | Everything CI runs                            |
| `pnpm shoot / /styleguide` | Screenshot routes in both themes to `.shots/` |
| `pnpm check:content`       | Validate frontmatter and cross-references     |

`/styleguide` renders every design token in both themes on one page.

## Writing

Content lives in `content/`, one file per item:

```
content/notes/<slug>.md          A written note
content/changelog/<slug>.md      One release of one project
content/projects/<slug>.md       A project in the catalogue
```

Frontmatter is schema-validated — a malformed file fails the build rather than
rendering a page with an empty date. Set `draft: true` to keep something visible
in `pnpm dev` and out of the built site.

## Documentation

- [`docs/HANDOFF.md`](docs/HANDOFF.md) — **start here.** Current state, the one
  open blocker, decisions waiting on a human, and the traps already hit.
- [`docs/BRAND.md`](docs/BRAND.md) — the name, the direction, the easter eggs,
  and the failure mode to avoid.
- [`docs/LORE.md`](docs/LORE.md) — every astronomical claim the site makes, with
  sources, and the ones that turned out to be false.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phases and decisions on record.
- [`AGENTS.md`](AGENTS.md) — conventions and traps already hit.
