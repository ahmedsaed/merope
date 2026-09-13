# Roadmap

Phases are sized so each one ends with something reviewable. Phases 0 and 1 are
done; everything after them is a proposal and should be argued with.

For current state and what is blocking Phase 2, see [`HANDOFF.md`](HANDOFF.md).

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
`/changelog` to link to, so those items do not appear. The nav grows with the
site rather than shipping dead links or empty stubs.

---

## Phase 1 — Identity & design system ✅

The visual language, reviewed in isolation before any page depends on it.

Built: the mark and wordmark, the star field projected from real coordinates,
prose styles with Shiki bound to the theme attribute, the primitives, the
favicon, and a generated Open Graph card. All on `/styleguide`.

**Carried into Phase 2:** three Pleiades members still need coordinates from
SIMBAD before the hero can ship (`docs/LORE.md`), and how far the plate furniture
goes is still a judgement call — currently pitched at the restrained end.

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

## Phase 2 — Home page, first assembly

- **Hero: a real star field.** The Pleiades at true relative positions with
  Merope circled — the asterism given room to work. Decided: the hero carries
  the field, not type alone.
- **The catalogue.** Two treatments built and put side by side on `/styleguide`
  with the same real data, because a dense bordered table risks reading as a
  spreadsheet, which is the wrong register for a studio:
  1. _Catalogue_ — tabular, dense, aligned columns.
  2. _Index_ — generous rows, project name large in Newsreader, mono data as
     aligned marginalia. Tabular quality from alignment, not borders.
     Pick by looking. Fallback is a stacked list with the magnitude dot as the
     only tabular element.
- A studio statement that is three sentences, not a manifesto.
- Header and footer, with the coordinate line.

**Motion, decided: almost none.** The theme change gets a long exposure — a slow
cross-fade, because that is what a re-exposure looks like — and the nebula
behind the wordmark responds very slightly to the pointer. No scroll-triggered
reveals, nothing that blocks reading. On a page this typographic, restraint is
the distinctive part; movement would make it look like every other launch page.

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

| Decision        | Choice                   | Why                                                                     |
| --------------- | ------------------------ | ----------------------------------------------------------------------- |
| Framework       | Next.js 16, App Router   | Asked for. Static export keeps it honest.                               |
| Output          | `output: 'export'`       | No server, no runtime, portable between hosts.                          |
| Hosting         | Vercel                   | Chosen. `vercel.json` carries headers; nothing else is Vercel-specific. |
| Styling         | Tailwind v4              | CSS-first `@theme` fits a token-driven system better than a JS config.  |
| Content         | Hand-rolled loader + MDX | ~100 lines, build-time only, no abandoned dependency to migrate off.    |
| Validation      | Zod at build time        | A broken post should fail the build, not render an empty date.          |
| Package manager | pnpm                     | Fast, and ready if Phase 6 turns this into a workspace.                 |
| Repo shape      | Single app               | `src/design/` kept separable so Phase 6 is a move, not a rewrite.       |
| Newsletter      | Buttondown               | Markdown-native, can send from RSS.                                     |

### Known constraints of static export

No middleware, no server actions, no ISR, no runtime image optimisation, no
redirects or headers from `next.config.ts` (they live in `vercel.json`). All
accepted. Phase 4's newsletter submission is the only foreseeable pressure
against this.
