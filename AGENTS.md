<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Merope

The landing page and content home for the Merope software studio (merope.dev).
Individual projects live on subdomains; this repo is the front door.

**New here? Start with `docs/HANDOFF.md`** — current state, the one open
blocker, the decisions waiting on a human, and the failures already hit.

Then read `docs/BRAND.md` before touching design, `docs/LORE.md` before writing
any astronomical claim, and `docs/ROADMAP.md` before deciding something is in or
out of scope.

## Non-negotiables

- **The site is fully static** (`output: 'export'`). No middleware, server
  actions, ISR, or runtime image optimisation. Headers live in `vercel.json`.
- **Two themes, always both.** Every change must survive the `plate`/`sky`
  toggle. Never define a colour only inside one theme block.
- **No sans-serif.** Prose is Newsreader, labels and data are IBM Plex Mono.
  See `src/design/fonts.ts` for why.
- **Two accents only.** `--accent` is the star's own colour; `--mark` is the
  grease pencil and means _this needs attention_ — focus rings, breaking
  changes, nothing else.
- **Lore must be true.** Every astronomical fact comes from `src/lib/merope.ts`,
  and every value in it is cited in `docs/LORE.md`. Do not add a fact to either
  without a source. Two claims that popular astronomy writing repeats are false
  and have already been caught here: Merope is **not** the faintest Pleiad (she
  is fourth-brightest of the seven), and the NASA supercomputer was built from
  **Pleiades** nodes, not Columbia.

## Layout

```
src/design/     The design system. Kept self-contained so Phase 6 can lift it
                into a package — nothing here may import from src/app.
                tokens.css, fonts.ts, theme.ts, prose.css, and glyph.ts —
                the one switch for how a star is drawn anywhere on the site.
src/design/components/  Mark, Wordmark, StarField, HeroField, SkyBackdrop,
                Catalogue, SiteHeader, SiteFooter, ThemeToggle, primitives
src/lib/        merope.ts (lore), sky.ts (projection), site.ts (config),
                field.ts (GENERATED — pnpm fetch:field), content/ (loader)
content/        notes/, changelog/, projects/ — markdown with validated frontmatter
scripts/        shoot.ts (screenshots), render-og.ts, fetch-field.ts,
                check-content.ts, static-server.ts
docs/           HANDOFF.md (start here), BRAND.md (direction),
                LORE.md (verified facts + sources),
                ROADMAP.md (phases and decisions)
```

## Verifying work

`pnpm verify` runs everything CI runs. Order matters: the token tests assert
against the built CSS, so the build has to come first.

**Look at your changes.** `pnpm build && pnpm shoot / /styleguide` writes
screenshots of every route in both themes at both breakpoints to `.shots/`, and
fails on any console error. A green build says nothing about whether a page is
any good.

**The OG card is generated, not hand-drawn.** It is a real route at
`/styleguide/og` built from the same components as everything else;
`pnpm build && pnpm render:og` screenshots it to `src/app/opengraph-image.png`,
which is committed because the build cannot assume a browser. Re-run it whenever
the mark, the palette, the thesis or the star field changes — the tests check
the file is a valid 1200x630@2x PNG, but nothing can check that it is current.

## Traps already hit here

- **Tailwind v4 tree-shakes `@theme` variables** that no generated utility
  references. A token read only through `var(--x)` in an inline style will
  silently vanish from the bundle, and a missing `opacity` falls back to `1` —
  so the page still renders and nothing reports a problem. Magnitude tokens are
  `@theme static` for this reason. `tests/tokens.test.ts` guards it.
- **`class="max-w-[--foo]"` does not reference a variable in Tailwind v4** —
  that syntax sets a custom property. Use `max-w-(--foo)`.
- **YAML parses an unquoted `date: 2026-09-13` into a `Date`**, not a string, so
  frontmatter schemas must accept both.
- Next 16 removed the `eslint` key from `next.config.ts`; lint is its own step.
- **A favicon cannot read CSS variables.** `src/app/icon.svg` renders outside the
  document, so it carries literal hex and a hand-copied ring path.
  `tests/design.test.ts` asserts it stays identical to `Mark.tsx`; if you change
  the mark, change both.
- **No star anywhere on this site is hand-placed** — not the nine, not the
  labels, and not the 650 in the background. The cluster comes from published
  coordinates in `merope.ts` via `sky.ts`; labels are solved around them by
  `placeLabels`, because Atlas and Pleione are five arcminutes apart and a fixed
  offset puts one label on another's star; the background is a real Gaia DR3
  query (`pnpm fetch:field`). A scatter of invented dots would break this rule
  _and_ be the particle starfield `docs/BRAND.md` rejected the Observatory
  direction for. `tests/lore.test.ts` asserts the cluster is complete.
- **How a star is drawn is one constant**, `STAR_SHAPE` in `src/design/glyph.ts`.
  The hero cluster and the page backdrop are the same kind of object at two
  scales; if they disagree about what a star looks like, the page has two star
  systems in it. The file also carries a per-shape scale so the two glyphs are
  matched by ink rather than by radius.
- **A theme change is a 900ms cross-fade, and everything has to join it.**
  `body` transitions its own colours; anything painting a token another way — an
  SVG `fill` or `stroke`, a gradient `stop-color`, a background behind a cut-out
  — snaps instantly unless it carries the `exposure` utility, and one element
  snapping while the rest fades reads as a glitch. **A CSS gradient cannot be
  transitioned at all**, which is why the clearing under the hero field is a flat
  `background-color` behind a static `mask-image`, not a `radial-gradient` of
  `--ground`. That bug shipped once and was visible as a patch of the old theme
  around the cluster for the whole fade.
- **`mag-${n}` cannot be written as a Tailwind class.** v4 scans source text and
  never sees an interpolated name. The magnitude ramp has to arrive as
  `var(--mag-N)` in an inline style — which is why `Annotation` takes a `style`.
- **The nav renders `liveNav()`, not `NAV`.** Every item carries a `live` flag;
  flipping it is the last step of building a route. The site never ships a dead
  link or a stub page.
