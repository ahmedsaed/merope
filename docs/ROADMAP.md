# Roadmap

Phases are sized so each one ends with something reviewable. Phases 0, 1 and 2
are done; everything after them is a proposal and should be argued with.

For current state and what is open, see [`HANDOFF.md`](HANDOFF.md).

---

## Phase 0 — Foundation ✅

The environment needed to build the rest of this without supervision.

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict.
- **Fully static** (`output: 'export'`) — every route is an HTML file.
- Tailwind CSS v4, CSS-first, with the token layer in `src/design/`.
- Plate & Sky themes resolving before first paint, with a real
  "follow the system" third state.
- Magnitude scale as both a UI brightness ramp and the project status system.
- Build-time content layer: schema-validated frontmatter, MDX, Shiki.
- `/styleguide` — every token, both themes, one page.
- Verification: typecheck, lint, format, content check, unit tests, e2e, and a
  screenshot harness. All wired into CI.
- Every lore fact checked against published sources and written up with
  citations in `docs/LORE.md`. Three claims in the first draft were wrong.

**Deliberately not done yet:** the actual design. Phase 0's pages are
scaffolding that proves the pipeline works.

---

## The landing page is not a phase

Worth stating before the phases, because it is the thing most likely to be
misread. The home page is seven blocks, and they do not depend on the same
things — so it is the **assembly point three phases contribute to**, not one
phase's deliverable.

| Block                               | Needs           | Lands in |
| ----------------------------------- | --------------- | -------- |
| Header — wordmark, nav, plate/sky   | design system   | 2        |
| Hero — star field, wordmark, thesis | design system   | 2        |
| Studio statement — three sentences  | nothing         | 2        |
| The catalogue — projects            | project content | 2        |
| Recent notes — three, then a link   | content engine  | 3        |
| Newsletter — one field              | Buttondown      | 4        |
| Footer — coordinate line            | nothing         | 2        |

Phase 2 still ships a complete, launchable page. Phase 3 inserts the notes
strip above the footer; Phase 4 inserts the newsletter below it.

**The nav only shows what resolves.** In Phase 2 there is no `/notes` or
`/changelog` to link to, so those items do not appear — the header renders
`liveNav()`, not `NAV`. The nav grows with the site rather than shipping dead
links or empty stubs.

---

## Phase 1 — Identity & design system ✅

The visual language, reviewed in isolation before any page depends on it.

Built: the mark and wordmark, the star field projected from real coordinates,
prose styles with Shiki bound to the theme attribute, the primitives, the
favicon, and a generated Open Graph card. All on `/styleguide`.

**Carried into Phase 2 and now closed:** the three missing Pleiades members were
added from SIMBAD, and the whole table was re-read from the same query so it has
one provenance (`docs/LORE.md`). How far the plate furniture goes is still a
judgement call — currently pitched at the restrained end.

- **The wordmark: option D, the circled star.** A dot ringed in grease pencil —
  the gesture an astronomer made on a plate to say _this one_. It is the only
  candidate that stays legible at 16px and uses both accents for their real
  meanings. Subdomains inherit the ring and change what sits inside it.
- **The asterism is not the mark.** The seven sisters with Merope circled is the
  most meaningful drawing available and the most fragile — it collapses into
  noise at favicon size. It lives in the hero, at a size where it works.
- Prose styles: headings, lists, blockquotes, code blocks wired to the
  plate/sky variables (Shiki emits both themes already; they are not yet bound
  to the theme attribute).
- The plate furniture: hairline grids, registration marks, margin lettering,
  the grain calibrated per theme. **Open:** how far this goes before it becomes
  costume. Default to the restrained end.
- Primitives: `Annotation`, `Rule`, `MagnitudeDot`, `Field`, `StarField`.
- Favicon, OG template, `theme-color` per theme.

**Review surface:** `/styleguide`, extended.

---

## Phase 2 — Home page, first assembly ✅

Shipped: header, hero, statement, catalogue, footer. A complete, launchable
page. The nav is empty because nothing else resolves yet, not because it is
unfinished — `NAV` in `src/lib/site.ts` carries a `live` flag per item and
`liveNav()` is what the header renders, so flipping a flag is the last step of
building a route rather than a separate decision.

- **Hero: a real star field.** All nine members at true relative positions with
  Merope circled. The frame is cropped to what is drawn (`StarField crop`) —
  the cluster is 1.0° across and 0.61° tall, so a square frame is a third empty.
- **The catalogue: treatment B, the index.** Decided by looking, with both
  treatments rendered from the same data. The bordered table was rejected: at
  the handful of projects a one-person studio actually has it reads as a
  spreadsheet with three rows, which is the wrong register for a studio. The
  index takes its tabular quality from alignment instead of borders.
  **One refinement made during the build:** only the mono marginalia dims to the
  row's magnitude, never the name or the summary. Dimming a whole row to
  `--mag-6` makes an experiment genuinely hard to read, and "content stays
  plainly readable" outranks the metaphor (`docs/BRAND.md`).
- A studio statement of three sentences, set as one paragraph — as three blocks
  they read as a list of claims rather than a statement.
- Header and footer, with the coordinate line and the spare-parts sentence.

**The site stands on a sky.** `SkyBackdrop` puts 650 real Gaia DR3 stars behind
every route — 3° of the actual sky around Merope, generated by `pnpm fetch:field`
rather than scattered. Three decisions inside it, all reached by looking:

- **It scrolls and it ends.** Absolute rather than fixed, anchored to the top of
  the document and masked out over its lower half, so the sky is what a page
  opens on and every reading surface below is clean paper. Pure CSS — no scroll
  listener. A sky that followed you down the page would put stars behind every
  paragraph of every note.
- **A clearing under the cluster.** The page's sky and the hero's cluster are the
  same patch at different scales, so where they overlap the background reads as
  debris around the asterism rather than depth behind it. A masked pool of
  `--ground` removes it without the backdrop needing to know where the layout put
  the hero — which it cannot know.
- **Banded by magnitude.** Six discrete classes, one `<path>` each and a bare
  `<use>` per star: 23KB gzipped against 31KB for individually sized stars. Also
  how star charts have always worked.

**One glyph, one switch.** `STAR_SHAPE` in `src/design/glyph.ts` decides how a
star is drawn on every surface at once. Currently `disc`, which is the honest
one — the Henrys' plate was a refractor and a refractor renders stars as round
discs; spikes come from a reflector's vanes. `star` is the legible alternative.
The file matches the two by ink rather than radius, so switching compares shape
and not weight.

**Motion, as decided: almost none.** The theme change gets a long exposure — a
slow cross-fade, because that is what a re-exposure looks like — and the nebula
behind the field drifts very slightly against the pointer (`HeroField`). What
moves is the dust, never the stars: the positions are catalogue positions and
sliding them around would undo the one claim the field makes. It opts out of
coarse pointers and of `prefers-reduced-motion` itself, because it has no
duration for the global reduced-motion rule to zero. No scroll-triggered
reveals, nothing that blocks reading.

Making the cross-fade actually cover the page took an `exposure` utility: SVG
fills, strokes and gradient stops do not inherit the body's transition, and a
CSS gradient cannot be transitioned at all. See `AGENTS.md`.

**Review surface:** `/`, in both themes, at both breakpoints.

---

## Phase 3 — Content engine

- `/notes` index + note pages with real typography.
- **Adds to the home page:** the recent-notes strip, above the footer.
- **Adds to the nav:** `/notes`, `/changelog`, `/studio` — they resolve now.
- `/changelog` — combined feed across projects, plus per-project views.
- `/projects/[slug]` — project pages, with their releases inline.
- MDX component library for writing.
- RSS/Atom (the "ephemeris"), sitemap, `robots.txt`.
- Build-time OG image generation per note and release.
- Build-time image pipeline (static export has no runtime optimiser).

---

## Phase 4 — Newsletter & measurement

**Adds to the home page:** the newsletter block, below the notes strip.

- Buttondown integration. A static site cannot POST to it directly without
  exposing a key, so: either Buttondown's hosted embed, or a tiny serverless
  function as the only non-static piece of the system. **This is the one place
  the "fully static" rule may have to bend** — worth deciding deliberately
  rather than discovering late.
- Buttondown can send from RSS, so notes could become the newsletter with no
  separate writing step.
- Analytics: privacy-preserving, no cookie banner. Vercel Analytics or Plausible.

---

## Phase 5 — The subdomain system

Making `merope.dev` feel like the parent of everything under it.

- A shared header/footer that project sites can adopt.
- Conventions for what a project subdomain owns versus what the studio owns.
- Cross-site sitemap and consistent OG treatment.
- DNS notes, kept in the repo.

---

## Phase 6 — Extract the design system

Once two projects need it, lift `src/design/` into a versioned package and have
the subdomains consume it. Not before — the second consumer is what teaches you
the right API, and extracting on the strength of one is how design systems end
up wrong.

---

## Decisions on record

| Decision        | Choice                    | Why                                                                                              |
| --------------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| Framework       | Next.js 16, App Router    | Asked for. Static export keeps it honest.                                                        |
| Output          | `output: 'export'`        | No server, no runtime, portable between hosts.                                                   |
| Hosting         | Vercel                    | Chosen. `vercel.json` carries headers; nothing else is Vercel-specific.                          |
| Styling         | Tailwind v4               | CSS-first `@theme` fits a token-driven system better than a JS config.                           |
| Content         | Hand-rolled loader + MDX  | ~100 lines, build-time only, no abandoned dependency to migrate off.                             |
| Validation      | Zod at build time         | A broken post should fail the build, not render an empty date.                                   |
| Package manager | pnpm                      | Fast, and ready if Phase 6 turns this into a workspace.                                          |
| Repo shape      | Single app                | `src/design/` kept separable so Phase 6 is a move, not a rewrite.                                |
| Catalogue       | Index, not table          | A bordered table reads as a spreadsheet at three rows. Decided by looking.                       |
| Coordinates     | SIMBAD, all nine rows     | One catalogue, one epoch. A table nobody can re-derive is one nobody checks.                     |
| Nav             | Only live routes          | `live` per item. No dead links, no stub pages; the nav grows with the site.                      |
| Newsletter      | Buttondown                | Markdown-native, can send from RSS.                                                              |
| Background      | Real sky, site-wide       | 650 Gaia stars, not a scatter. A particle field is the cliché this direction exists to avoid.    |
| Star glyph      | One constant, both scales | Cluster and backdrop must agree, or the page has two star systems in it.                         |
| Theme control   | Two chips + a tooltip     | `plate / sky` read as jargon to a first-time visitor. Still not a sun and a moon.                |
| Page rhythm     | One section, one screen   | `screenful`. Sections fill the viewport and centre content; snap on a marker, never the section. |

### Known constraints of static export

No middleware, no server actions, no ISR, no runtime image optimisation, no
redirects or headers from `next.config.ts` (they live in `vercel.json`). All
accepted. Phase 4's newsletter submission is the only foreseeable pressure
against this.
