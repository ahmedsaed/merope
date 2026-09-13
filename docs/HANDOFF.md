# Handoff

Written at the end of the second working session, for whoever picks this up
next — human or agent, in a different environment.

**Phases 0, 1 and 2 are done. Nothing is blocked.** The landing page is
complete and launchable, and the visual direction has had a real review pass.
Phase 3 is next — but the immediate intent is to keep refining the UI.

---

## 1. First ten minutes

```bash
pnpm install
pnpm exec playwright install chromium   # only if you want screenshots
pnpm verify                             # typecheck, lint, format, content, build, 74 unit + 6 e2e
pnpm dev                                # then open / and /styleguide
```

`/` is the site. `/styleguide` is the review surface for the design system: the
mark at four sizes, the star field, every colour token, the type scale, the
magnitude ramp, the catalogue, prose, and every lore fact the UI can render.
Flip the `plate / sky` toggle in its header — nothing in the system is allowed
to need a second set of rules to survive that change.

Read in this order:

| File              | What it settles                                        |
| ----------------- | ------------------------------------------------------ |
| `AGENTS.md`       | Non-negotiables, layout, traps already hit             |
| `docs/BRAND.md`   | The name, the direction, the wordmark, the easter eggs |
| `docs/LORE.md`    | Every astronomical claim, with citations               |
| `docs/ROADMAP.md` | Phases, and the decisions already on record            |

---

## 2. What changed this session

### The star data blocker is closed

The previous session shipped six of the nine cluster members because its
network policy blocked SIMBAD. All nine are now in `src/lib/merope.ts`, read
from SIMBAD on 2026-09-13, **and the original six were re-read from the same
query** so the whole table has one provenance instead of six rows from
popular-astronomy pages and three from a catalogue. The drift was small
(≤ 0.03″ of position, ≤ 0.12 mag) and never changed a ranking, but a table
assembled from several sources at several epochs is one nobody can re-derive.

`PLEIADES_MISSING` is now empty and `tests/lore.test.ts` asserts that it stays
that way. The constant is kept rather than deleted: the styleguide renders
whatever is in it as a grease-pencil warning, so the next gap announces itself.

Two `tests/sky.test.ts` assertions changed, which was the test doing its job:
**Pleione** is the easternmost member (leftmost dot), not Alcyone, and
**Asterope** is the northernmost, not Taygeta. Merope is still furthest south.

### Three things the complete cluster broke, and how

Each was invisible until the ninth star landed, and each is now guarded by a
test rather than by a comment:

- **The field was top-anchored.** With all nine members the cluster is ~1.7×
  wider than it is tall, and `projectCluster` scaled both axes by the larger
  span from each axis's minimum — so the shorter axis could not fill the frame
  and the asterism sat in the top two-thirds with a dead band under it. It now
  centres each axis on its own extent.
- **Three labels collided.** Atlas and Pleione are five arcminutes apart and
  Asterope sits directly above Taygeta, so a single fixed offset per label put
  `TAYGETA` on top of Asterope's dot. `placeLabels` in `sky.ts` now tries four
  positions per label, brightest star first, and takes the first that hits
  nothing — labels cannot be hand-placed for the same reason dots cannot.
- **A square frame wasted a third of the hero.** `StarField crop` tightens the
  viewBox to the union of dots, labels, ring and nebula. Cropping changes the
  frame, never a position.

### Phase 2

The home page is `src/app/page.tsx`: header, hero, statement, catalogue, footer.
See `docs/ROADMAP.md` for what each block decided. The catalogue treatment was
settled — **B, the index** — and the styleguide now shows only the chosen one.

### The visual pass that followed

Reviewed against real pixels, in both themes, at both breakpoints. What changed,
and why it is worth not undoing:

- **Star names are gone from the site.** Nine uppercase mono labels are the one
  thing that made the field read as an astronomy diagram rather than a picture of
  the sky, and `docs/BRAND.md` is explicit that the lore is never in the way.
  They survive only on `/styleguide`, which is where the projection gets checked
  and is noindex. `placeLabels` therefore has exactly one caller — that is
  deliberate, not dead code.
- **The site stands on a sky.** `SkyBackdrop`, behind every route: 650 real Gaia
  DR3 stars across 3° around Merope. It scrolls with the page and is masked out
  over its lower half, so nothing sits behind prose. A clearing of `--ground`
  under the hero keeps the background off the asterism.
- **One glyph, one switch** — `STAR_SHAPE` in `src/design/glyph.ts`, currently
  `disc`. Flipping it changes the cluster and the backdrop together, on purpose.

Three rules came out of this pass and are now in `AGENTS.md`: no star is ever
hand-placed (the background is a catalogue query, not a scatter); the glyph is
one constant; and everything that paints a token must carry `exposure` or it
snaps through the theme cross-fade.

---

## 3. Decisions still waiting on a human

### a. The next UI refinement pass

This is the live one. The hero has been through a review; the rest has not. The
catalogue, the statement, the footer and the styleguide are all still at their
first draft, and the vertical rhythm between blocks was set by eye in one sitting.

### b. How far the plate furniture goes

Still open, and still easier to judge against real pixels than in the abstract.
Currently pitched deliberately restrained: hairline rules and margin lettering
only, no registration marks, no plate numbers, no heavy grain. The rule written
into `primitives.tsx` is _default to less_, because this is the axis on which
the whole design tips into costume. Now that there is a real page to look at,
this is worth a decision.

### c. The star glyph

`disc` is live. `star` is one constant away. Discs are the photographically
honest option and read calmer; stars read more decorative and are more legible
at small sizes. Both have been seen rendered; neither is wrong.

### d. Phase 4 will bend the static rule

A static page cannot POST to Buttondown without exposing a key. Either their
hosted embed, or one serverless function as the only non-static piece of the
system. Explicitly deferred, but decide it deliberately rather than discovering
it late.

### e. The catalogue has one row

That is honest and it is also thin. The page is complete; whether it is
_launchable_ depends on whether one project is enough to launch with, which is
a call about the studio, not about the site.

---

## 4. What Phase 3 is

`docs/ROADMAP.md` has the full list. The shape of it:

- `/notes` index and note pages. `/notes/[slug]` already exists and renders.
- `/changelog`, `/projects/[slug]`, `/studio`.
- **Then flip `live: true`** on those entries in `NAV` (`src/lib/site.ts`). The
  header renders `liveNav()`, so an item appears the moment its route does.
  This is the last step of building a route, not a separate task.
- The recent-notes strip on the home page, above the footer.
- RSS/Atom (the "ephemeris"), sitemap, `robots.txt`.
- Per-note OG images, and a build-time image pipeline — static export has no
  runtime optimiser.

---

## 5. Environment

Node 22, pnpm, and a Chromium that Playwright can drive. Everything else is in
`package.json`. `pnpm exec playwright install chromium` if screenshots fail with
a missing executable.

**Network egress.** SIMBAD (`simbad.u-strasbg.fr`) was reachable this session
and is the only host that has ever mattered — it is where every coordinate comes
from. `messier.seds.org`, `nas.nasa.gov` and `en.wikipedia.org` are worth
allowlisting for cross-checking. `fonts.googleapis.com` / `fonts.gstatic.com`
are **not** needed at runtime: `next/font` downloads Newsreader and IBM Plex
Mono at build time and the woff2 files are served from the build output.

**Chromium version drift.** `scripts/static-server.ts` exports `findChromium()`,
which prefers a browser already present under `PLAYWRIGHT_BROWSERS_PATH` over the
build `@playwright/test` pins. On a normal machine it returns `undefined` and
Playwright resolves normally — harmless, and worth keeping for CI images.

---

## 6. Things that will bite you

All of these are real failures already hit here, and each is now guarded. They
are repeated in `AGENTS.md` because they are the kind of thing that looks fine
and is wrong.

- **Tailwind v4 tree-shakes `@theme` variables** no utility references. A token
  read only via `var(--x)` in an inline style vanishes from the bundle — and a
  missing `opacity` falls back to `1`, so the page still renders and nothing
  reports a problem. Six of seven magnitude tokens disappeared this way. Hence
  `@theme static`, guarded by `tests/tokens.test.ts`.
- **`mag-${n}` cannot be written as a class.** Tailwind v4 scans source text and
  never sees an interpolated name, so the magnitude ramp has to arrive as
  `var(--mag-N)` in an inline style. That is why `Annotation` takes a `style`.
- **`max-w-[--foo]` sets a custom property in Tailwind v4; it does not read
  one.** Use `max-w-(--foo)`. Every max-width on the home page was silently
  inert for an afternoon.
- **YAML parses unquoted `date: 2026-09-13` into a `Date`,** not a string, so
  frontmatter schemas must accept both. This rejected every real content file.
- **A favicon cannot read CSS variables.** `src/app/icon.svg` carries literal
  hex and a hand-copied ring path; `tests/design.test.ts` asserts it stays
  identical to `Mark.tsx`. Change the mark, change both.
- **Next 16 removed the `eslint` key from `next.config.ts`.** Lint is its own step.
- **The OG card is generated, not hand-drawn.** It is a real route at
  `/styleguide/og`; `pnpm build && pnpm render:og` screenshots it to
  `src/app/opengraph-image.png`, which is committed because the build cannot
  assume a browser. The tests check it is a valid 1200×630@2x PNG but **cannot
  check that it is current** — re-run it whenever the mark, palette, thesis or
  star field changes. It was regenerated this session because the field did.
- **A fixed `size` on `StarField` used to overflow the page on a phone.** The
  SVG now carries `max-width: 100%; height: auto`, so `size` is an intention
  rather than a floor. Check `scrollWidth === clientWidth` at 390px after
  touching the hero.
- **A CSS gradient cannot be transitioned.** The clearing under the hero field
  was a `radial-gradient` of `--ground` and snapped to the new theme instantly
  while the page took the full 900ms, leaving the cluster in a patch of the old
  theme for the whole fade. It is now a flat `background-color` behind a static
  `mask-image`. The same class of bug hits every SVG `fill`, `stroke` and
  `stop-color` — hence the `exposure` utility in `globals.css`.
- **The Playwright MCP browser writes `.playwright-mcp/` into the repo,** and
  prettier reads its `.yml` snapshots and fails `format:check`, which fails CI
  for no reason at all. Already in `.prettierignore` and `.gitignore`; do not
  remove them.

---

## 7. How to check your work

`pnpm verify` runs exactly what CI runs, in an order that matters: the token
tests assert against the _built_ CSS, so the build has to come first.

**Then look at it.** Two ways:

- `pnpm build && pnpm shoot / /styleguide` writes PNGs of every route in both
  themes at both breakpoints to `.shots/`, and exits non-zero on any console
  error or failed response. Full-page desktop shots run 6–7 MB, which is too
  large for some upload paths — crop or screenshot a single element to share one.
- Or serve the export (`npx tsx scripts/serve.ts 4321`) and drive it with the
  Playwright MCP browser, which is what this session used: it screenshots single
  elements directly and does not need the project's own Chromium download.

Either way it drives the real static export from `out/`, resolved the way a
static host resolves it, not a dev server. A green build says nothing about
whether a page is any good, and this project is mostly a design problem.

---

## 8. State of the world

|         |                                                                          |
| ------- | ------------------------------------------------------------------------ |
| Stack   | Next 16 App Router, React 19, TS strict, Tailwind v4, `output: 'export'` |
| Hosting | Vercel. `vercel.json` carries headers; nothing else is Vercel-specific   |
| Tests   | 74 unit (vitest), 6 e2e (playwright)                                     |
| CI      | `.github/workflows/ci.yml`                                               |
| Content | `content/{notes,changelog,projects}` — Zod-validated at build            |
| Routes  | `/`, `/styleguide`, `/styleguide/og`, `/notes/[slug]`                    |

### Lore corrections already made — do not re-introduce

Errors the sources themselves repeat. `tests/lore.test.ts` guards the first two
with citations:

- Merope is the **fourth-brightest** of the seven sisters (m4.18), **not the
  faintest**. Celaeno (5.46) and Asterope (5.76) are dimmer. "Lost Pleiad" is
  mythological, not photometric.
- The NASA Ames supercomputer Merope was built from **Pleiades** nodes, **not
  Columbia**.
- The 1885 photographic plates did not reveal _Merope's_ nebula — Tempel found
  that visually in 1859. They revealed the extent of the nebulosity and the Maia
  nebula.
- **Atlas and Pleione are not sisters.** They are the parents, they are in the
  cluster and in the asterism, and they do not belong in any count of seven.
  `sister` in `merope.ts` carries the distinction.
