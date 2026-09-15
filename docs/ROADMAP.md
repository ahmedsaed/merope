# Roadmap

Phases are sized so each one ends with something reviewable. Phases 0 to 3 are
done. Phase 5 is dropped and Phase 6 is indefinite — see below — so what remains
is polish, measurement, and writing.

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

**Routes are done.** Two items are deliberately deferred; see the end.

- ✅ `/notes` index + note pages with real typography.
- ✅ **Added to the home page:** the recent-notes strip, above the footer.
- ✅ **Added to the nav:** `/notes`. `/changelog`, `/projects` and `/studio`
  stay `live: false` until they resolve.
- ✅ A shared `Page` shell — measure, gutters, header, footer — so three routes
  cannot drift on the thing a visitor notices first. It deliberately does not
  impose the `screenful` rhythm: that belongs to the landing page, and putting a
  fold in the middle of someone's reading is the opposite of what this site is
  for.
- ✅ Frontmatter is typeset (`src/lib/typeset.ts`). Note bodies went through
  smartypants and frontmatter did not, so a standfirst had typewriter
  apostrophes directly above a body that did not.
- ✅ `/changelog` — one combined list across every project. The per-project view
  is the project page: the same `ReleaseList` with the name turned off.
- ✅ `/projects` and `/projects/[slug]` — the catalogue row opened out, with the
  project's releases inline. Catalogue names now link here rather than straight
  out to a live site.
- ✅ `/studio` — and the home for the astronomy. The landing page says almost
  none of it on purpose; this is the one page where someone has actively asked.
  It is also where the `23 Tau · M45 · B6IV(e)` line went after it was cut from
  the hero.
- ✅ Sitemap and `robots.txt`, generated from the content layer so a note that
  exists is a note that is listed, and a draft cannot leak into either.
- **Deferred, deliberately:**
  - _An MDX component library._ There is one component (`Annotation`) and one
    author. A library needs a second consumer to teach it the right API.
  - _Per-note OG images._ The studio card is a screenshot of a real route, which
    needs a browser; per-note means either one committed PNG per note or moving
    to Satori, which cannot render the SVG star field the card is built from.
    That is a design decision, not a chore — see HANDOFF.
  - _A build-time image pipeline._ No note contains an image yet. Building the
    pipeline first is exactly the speculative infrastructure this project keeps
    refusing to write.

---

## Phase 4 — Measurement, and a newsletter that may not happen

Dropping the feed did not kill this phase; it split it in half, and the halves
now have very different prospects.

### Analytics — still worth doing

Entirely independent of the feed. Privacy-preserving, no cookie banner, Vercel
Analytics or Plausible. Small, and the only way to know whether any of this is
read.

### The newsletter — reconsider before building

**The feed was most of what made it cheap.** Buttondown was chosen partly
because it can compose an issue from RSS, so notes would have become issues with
no separate writing step. Without that, every issue is written by hand.

What is left is a feature that:

- **breaks the one architectural non-negotiable** — a static page cannot POST to
  Buttondown without exposing a key, so it needs either a hosted embed or a
  serverless function;
- **costs writing work per issue**, now that nothing composes itself;
- **has nothing to send yet**, on a site with one published note.

A subscribe box that collects addresses nobody emails is worse than no box: it
takes something from a reader and does not honour it. The honest order is to
write for a while first, and add the box if a cadence appears — at which point
the effort is justified and the decision about the static rule is being made for
a real reason rather than a hypothetical one.

---

## Phase 5 — The subdomain system ❌ Dropped

**Decided against.** Each project living under `merope.dev` will have its own
design and its own styles, so a shared header and footer for the subdomains to
adopt would be solving a problem nobody has. The parent does not need to look
like its children to be their parent.

Two fragments of it were worth keeping and have not been thrown away with the
rest:

- **DNS notes belong in the repo** regardless of how the subdomains look. That
  is operational memory, not design.
- **Does a project site link back here?** Worth answering once, when the first
  subdomain exists. It is a link, not a system.

---

## Phase 6 — Extract the design system ⏸ Indefinite

Lifting `src/design/` into a versioned package was always conditional on a
second consumer — "the second consumer is what teaches you the right API, and
extracting on the strength of one is how design systems end up wrong." With the
subdomains going their own way, that consumer may never arrive, and this should
happen only if the same theme is genuinely wanted somewhere else.

Nothing is lost by waiting. `src/design/` is still kept self-contained and still
must not import from `src/app`, because that discipline is what keeps the option
open and is worth having on its own.

---

## Decisions on record

| Decision        | Choice                                             | Why                                                                                                                  |
| --------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 16, App Router                             | Asked for. Static export keeps it honest.                                                                            |
| Output          | `output: 'export'`                                 | No server, no runtime, portable between hosts.                                                                       |
| Hosting         | Vercel                                             | Chosen. `vercel.json` carries headers; nothing else is Vercel-specific.                                              |
| Styling         | Tailwind v4                                        | CSS-first `@theme` fits a token-driven system better than a JS config.                                               |
| Content         | Hand-rolled loader + MDX                           | ~100 lines, build-time only, no abandoned dependency to migrate off.                                                 |
| Validation      | Zod at build time                                  | A broken post should fail the build, not render an empty date.                                                       |
| Package manager | pnpm                                               | Fast, and ready if Phase 6 turns this into a workspace.                                                              |
| Repo shape      | Single app                                         | `src/design/` kept separable so Phase 6 is a move, not a rewrite.                                                    |
| Catalogue       | Index, not table                                   | A bordered table reads as a spreadsheet at three rows. Decided by looking.                                           |
| Coordinates     | SIMBAD, all nine rows                              | One catalogue, one epoch. A table nobody can re-derive is one nobody checks.                                         |
| Nav             | Only live routes                                   | `live` per item. No dead links, no stub pages; the nav grows with the site.                                          |
| Newsletter      | Buttondown                                         | Markdown-native. Note: the send-from-RSS argument lapsed when the feed was dropped.                                  |
| Feeds           | Dropped entirely                                   | No RSS or Atom. Asked for. Do not re-add one because a phase list once mentioned it.                                 |
| Subdomains      | Own design, own styles                             | Phase 5 dropped. A shared header for sites that will not look alike solves nothing.                                  |
| Design package  | Only on a second consumer                          | Phase 6 indefinite. `src/design/` stays self-contained so the option survives.                                       |
| Background      | Real sky, site-wide                                | 650 Gaia stars, not a scatter. A particle field is the cliché this direction exists to avoid.                        |
| Star glyph      | One constant, both scales                          | Cluster and backdrop must agree, or the page has two star systems in it.                                             |
| Theme control   | Two chips + a tooltip                              | `plate / sky` read as jargon to a first-time visitor. Still not a sun and a moon.                                    |
| Page rhythm     | One section, one screen                            | `screenful`. Sections fill the viewport and centre content; snap on a marker, never the section.                     |
| Release anchors | `project-version`, plus a rolling `project-latest` | Frontmatter, not the filename: a shared URL must survive a rename, and "latest" must not need editing every release. |

### Known constraints of static export

No middleware, no server actions, no ISR, no runtime image optimisation, no
redirects or headers from `next.config.ts` (they live in `vercel.json`). All
accepted. Phase 4's newsletter submission is the only foreseeable pressure
against this.
