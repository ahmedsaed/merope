# Handoff

Written at the end of the first working session, for whoever picks this up next
— human or agent, in a different environment.

**Branch:** `claude/merope-landing-page-2piou4` → **PR #1**, all checks green.
**Phases 0 and 1 are done.** Phase 2 is next and is partly blocked; see below.

---

## 1. First ten minutes

```bash
pnpm install
pnpm verify           # typecheck, lint, format, content, build, 64 unit + 6 e2e
pnpm dev              # then open /styleguide
```

`/styleguide` is the review surface for the whole design system: the mark at four
sizes, the star field, every colour token, the type scale, the magnitude ramp,
both catalogue treatments, prose, and every lore fact the UI can render. Flip the
`plate / sky` toggle in its header — nothing in the system is allowed to need a
second set of rules to survive that change.

Read in this order:

| File              | What it settles                                        |
| ----------------- | ------------------------------------------------------ |
| `AGENTS.md`       | Non-negotiables, layout, traps already hit             |
| `docs/BRAND.md`   | The name, the direction, the wordmark, the easter eggs |
| `docs/LORE.md`    | Every astronomical claim, with citations               |
| `docs/ROADMAP.md` | Phases, and the decisions already on record            |

---

## 2. The one real blocker

**Three Pleiades members have no coordinates, and the Phase 2 hero cannot ship
without them.**

`src/lib/merope.ts` holds six of the seven sisters, verified and cited. Missing:

- **Asterope** — 21 Tauri
- **Atlas** — 27 Tauri
- **Pleione** — 28 Tauri

This is why a less network-constrained environment is wanted. In the session
that built this, the egress policy blocked SIMBAD, `messier.seds.org`,
`nas.nasa.gov` and Wikipedia fetches, so only what a web _search_ summariser
could extract was available — and the one result that did return a position for
Asterope gave it **Alcyone's right ascension**. Precise, plausible, and wrong.
Rather than ship a star chart that is not the sky, the three were left out.

It is visible: Atlas and Pleione form the cluster's distinctive eastern
"handle", so Alcyone currently sits alone at the edge of the frame and the
asterism does not read as the Pleiades.

### What to do

Pull J2000 / ICRS right ascension, declination and apparent V magnitude from
**SIMBAD** (`https://simbad.u-strasbg.fr/simbad/sim-id?Ident=21+Tau`, and the
same for `27+Tau`, `28+Tau`), then:

1. Add three entries to `PLEIADES` in `src/lib/merope.ts`. Store **sexagesimally,
   exactly as printed** — the whole point is that a value can be checked against
   its source without undoing arithmetic. Set `sister: true` for Asterope,
   `false` for Atlas and Pleione (they are the parents, not sisters).
2. Empty `PLEIADES_MISSING` in the same file. The grease-pencil warning on
   `/styleguide` is driven by it and disappears on its own.
3. Add the rows to the coordinate table in `docs/LORE.md`, delete the
   "Three members are still missing" section, and add the SIMBAD citations.
4. `pnpm test` — `tests/sky.test.ts` asserts cluster geometry (east is left,
   Merope furthest south, Taygeta furthest north). **Two of those will correctly
   fail once the new stars land, and that is the test doing its job — update
   them, do not delete them:**
   - Atlas sits at RA ~03h 49m, east of Alcyone, so _Atlas_ becomes the leftmost
     star and the Alcyone assertion breaks.
   - Asterope is north of Taygeta, so the Taygeta assertion probably breaks too.
   - Merope stays furthest south — Atlas and Pleione are both north of her — so
     that assertion should survive untouched. If it doesn't, something is wrong
     with the new data, not the test.
5. `pnpm build && pnpm render:og` to regenerate the Open Graph card, which
   contains the star field.

Note Asterope is a double (21 Tau / 22 Tau, separated by 2.82′). One entry for
21 Tau is right at this scale; two dots that close would merge anyway.

---

## 3. Environment the next session wants

Node 22, pnpm, and a Chromium that Playwright can drive. Everything else is in
`package.json`.

**Network egress** — the following were blocked last time and are worth
allowlisting:

| Host                  | Needed for                                      |
| --------------------- | ----------------------------------------------- |
| `simbad.u-strasbg.fr` | The blocker above. The one that really matters. |
| `messier.seds.org`    | Cluster tables, IC 349, the Henry brothers      |
| `nas.nasa.gov`        | The supercomputer facts                         |
| `en.wikipedia.org`    | General cross-checking                          |

`fonts.googleapis.com` / `fonts.gstatic.com` were **not** a problem — `next/font`
downloaded Newsreader and IBM Plex Mono successfully at build time, and the
woff2 files land in `.next/static/media`. Fonts are self-hosted from the build
output, so there is no runtime dependency on Google.

**Chromium version drift.** `scripts/static-server.ts` exports `findChromium()`,
which prefers a browser already present under `PLAYWRIGHT_BROWSERS_PATH` over the
build `@playwright/test` pins. Written because the sandbox shipped Chromium 1194
against a pinned 1243 and downloading a second copy was slow and sometimes
blocked. On a normal machine it returns `undefined` and Playwright resolves
normally — harmless, and worth keeping for CI images.

---

## 4. Decisions waiting on the human

None of these block work; all of them change what gets built.

### a. The catalogue — this is the live one

`/styleguide` section 06 has **two treatments with identical data**:

- **A · Catalogue** — dense, bordered, tabular.
- **B · Index** — generous rows, project name large in Newsreader, mono data as
  aligned marginalia. Tabular quality from alignment rather than borders.

Ahmed's instinct was that a table "feels a bit odd" for a handful of projects,
and having seen both rendered, that instinct looks right: **B reads better at
this scale.** A looks like a spreadsheet with three rows. Not yet confirmed, so
Phase 2 should get a decision before building the real one. Fallback if neither
lands: a stacked list with the magnitude dot as the only tabular element.

### b. How far the plate furniture goes

Currently pitched deliberately restrained — hairline rules and margin lettering
only. No registration marks, plate numbers, or heavy grain. The rule written into
`primitives.tsx` is _default to less_, because this is the axis on which the
whole design tips into costume. Easier to judge against real pixels than in the
abstract.

### c. Phase 4 will bend the static rule

A static page cannot POST to Buttondown without exposing a key. Either their
hosted embed, or one serverless function as the only non-static piece of the
system. Explicitly deferred, but decide it deliberately rather than discovering
it late.

---

## 5. What Phase 2 actually is

**The landing page is not a phase** — it is the assembly point three phases
contribute to. `docs/ROADMAP.md` has the full table. Phase 2 builds:

- **Hero** — the star field given room, wordmark, thesis. Blocked on §2.
- **Catalogue** — once §4a is decided.
- **Studio statement** — three sentences, not a manifesto.
- **Header and footer** — with the coordinate line.

The nav shows only routes that resolve, so in Phase 2 there is no `/notes` or
`/changelog` link. It grows with the site. Phase 3 inserts a recent-notes strip
above the footer; Phase 4 inserts the newsletter below it.

**Motion is decided: almost none.** A long-exposure cross-fade on the theme
change, a slight pointer response on the nebula. No scroll-triggered reveals.
On a page this typographic, restraint is the distinctive part.

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
  star field changes.

---

## 7. How to check your work

`pnpm verify` runs exactly what CI runs, in an order that matters: the token
tests assert against the _built_ CSS, so the build has to come first.

**Then look at it.** `pnpm build && pnpm shoot / /styleguide /notes/first-light`
writes PNGs of every route in both themes at both breakpoints to `.shots/`, and
exits non-zero on any console error or failed response. A green build says
nothing about whether a page is any good, and this project is mostly a design
problem.

Two useful facts about `pnpm shoot`: full-page desktop shots run 6–7 MB, which
is too large for some upload paths — crop or screenshot a single element if you
need to share one. And it drives the real static export from `out/`, resolved
the way a static host resolves it, not a dev server.

---

## 8. State of the world

|         |                                                                             |
| ------- | --------------------------------------------------------------------------- |
| Stack   | Next 16 App Router, React 19, TS strict, Tailwind v4, `output: 'export'`    |
| Hosting | Vercel. `vercel.json` carries headers; nothing else is Vercel-specific      |
| Tests   | 64 unit (vitest), 6 e2e (playwright)                                        |
| CI      | `.github/workflows/ci.yml` — green on PR #1, including e2e on a real runner |
| Content | `content/{notes,changelog,projects}` — Zod-validated at build               |
| Routes  | `/`, `/styleguide`, `/styleguide/og`, `/notes/[slug]`                       |

The home page is still a placeholder carrying the mark and the star field.
Phase 2 replaces it.

### Lore corrections already made — do not re-introduce

Two of these are errors the sources themselves repeat, and
`tests/lore.test.ts` guards both with citations:

- Merope is the **fourth-brightest** of the seven sisters (m4.18), **not the
  faintest**. Celaeno and Asterope are dimmer. "Lost Pleiad" is mythological,
  not photometric.
- The NASA Ames supercomputer Merope was built from **Pleiades** nodes, **not
  Columbia**.
- The 1885 photographic plates did not reveal _Merope's_ nebula — Tempel found
  that visually in 1859. They revealed the extent of the nebulosity and the Maia
  nebula.
