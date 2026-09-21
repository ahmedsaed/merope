# merope.dev

The landing page and content home for the **Merope** software studio. Individual
projects live on subdomains; this repo is the front door.

Merope is the Pleiad with a story about dimming — not the faintest of the seven,
which is a thing popular astronomy writing gets wrong constantly, but the one who
married a mortal and hid her face. Her only claim on the nebula around her is
that she happens to be lighting dust she did not make.

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

| Command                    |                                                |
| -------------------------- | ---------------------------------------------- |
| `pnpm dev`                 | Dev server                                     |
| `pnpm build`               | Static export to `out/`                        |
| `pnpm verify`              | Everything CI runs                             |
| `pnpm shoot / /styleguide` | Screenshot routes in both themes to `.shots/`  |
| `pnpm check:content`       | Validate frontmatter and cross-references      |
| `pnpm fetch:field`         | Re-query Gaia for the background star field    |
| `pnpm sync:releases`       | Draft changelog entries from GitHub releases   |
| `pnpm render:og`           | Regenerate the Open Graph card (needs a build) |

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

### Changelog entries from GitHub

`pnpm sync:releases` reads the GitHub releases of every catalogued project that
has a `repo` and writes the ones it has not seen into `content/changelog/`. It
converts GitHub's notes into a release body — headings demoted to `###`, the
compare link and the `by @someone in #12` attributions dropped — and files each
one under the anchor the site addresses it by, so re-running it is free and
cannot overwrite anything.

Everything it writes is `draft: true`. The two fields a release payload has no
answer for are the two that matter most on the page: `headline`, the sentence
the row is read as, and `breaking`, which is the one thing the grease pencil is
for. Read the file, write the headline, decide `breaking`, drop the flag. A
headline it had to invent is marked `!` in the output.

```bash
pnpm sync:releases                 # every project with a repo
pnpm sync:releases peace --dry-run # one of them, printed rather than written
```

## Documentation

- [`docs/HANDOFF.md`](docs/HANDOFF.md) — **start here.** Current state, what is
  open, decisions waiting on a human, and the traps already hit.
- [`docs/BRAND.md`](docs/BRAND.md) — the name, the direction, the easter eggs,
  and the failure mode to avoid.
- [`docs/LORE.md`](docs/LORE.md) — every astronomical claim the site makes, with
  sources, and the ones that turned out to be false.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phases and decisions on record.
- [`AGENTS.md`](AGENTS.md) — conventions and traps already hit.
