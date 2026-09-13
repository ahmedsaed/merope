# Roadmap

Phases are sized so each one ends with something reviewable. Phase 0 is done;
everything after it is a proposal and should be argued with.

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

**Deliberately not done yet:** the actual design. Phase 0's pages are
scaffolding that proves the pipeline works.

---

## Phase 1 — Identity & design system

The visual language, reviewed in isolation before any page depends on it.

- Wordmark. Merope set in Newsreader is already close; the question is whether
  it needs a mark at all, and if so whether it is the plate's registration
  cross, a magnitude dot, or nothing.
- Prose styles: headings, lists, blockquotes, code blocks wired to the
  plate/sky variables (Shiki emits both themes already; they are not yet bound
  to the theme attribute).
- The plate furniture: hairline grids, registration marks, margin lettering,
  the grain calibrated per theme.
- Primitives: `Annotation`, `CatalogTable`, `Rule`, `MagnitudeDot`, `Field`.
- Favicon, OG template, `theme-color` per theme.

**Review surface:** `/styleguide`, extended.

---

## Phase 2 — The landing page

- Hero: the wordmark over a Pleiades field, Merope circled in grease pencil.
  The field is real coordinates, not decoration.
- The catalogue: projects as a star catalogue — designation, magnitude, kind,
  first light. The centrepiece, and the thing nobody else's landing page has.
- A studio statement that is three sentences, not a manifesto.
- Footer with the coordinate line.
- Motion, kept minimal: the theme change as a long exposure, the nebula
  responding very slightly to the pointer. Nothing that blocks reading.

**Open question:** how much the hero should move. My instinct is "almost not at
all" — the restraint is the distinctive part.

---

## Phase 3 — Content engine

- `/notes` index + note pages with real typography.
- `/changelog` — combined feed across projects, plus per-project views.
- `/projects/[slug]` — project pages, with their releases inline.
- MDX component library for writing.
- RSS/Atom (the "ephemeris"), sitemap, `robots.txt`.
- Build-time OG image generation per note and release.
- Build-time image pipeline (static export has no runtime optimiser).

---

## Phase 4 — Newsletter & measurement

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
