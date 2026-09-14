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
                Page, Margin, Catalogue, NoteList, ReleaseList, SiteHeader,
                MobileNav, SiteFooter, ThemeToggle, primitives
src/lib/        merope.ts (lore), sky.ts (projection), site.ts (config),
                field.ts (GENERATED — pnpm fetch:field), content/ (loader)
content/        notes/, changelog/, projects/ — markdown with validated frontmatter
scripts/        shoot.ts (screenshots), render-og.ts (OG card + app icon),
                fetch-field.ts, check-content.ts, static-server.ts
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

**The OG card and the app icon are generated, not hand-drawn.** Both are real
routes — `/styleguide/og` and `/styleguide/icon` — built from the same
components as everything else; `pnpm build && pnpm render:og` screenshots them
to `src/app/opengraph-image.png` and `src/app/apple-icon.png`, which are
committed because the build cannot assume a browser. Re-run it whenever the
mark, the palette, the thesis or the star field changes — the tests check the
files are valid PNGs at the right sizes, but nothing can check that they are
current.

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
- **The plate/sky chips must not read `--ground` or `--ink`.** They are samples
  of the two themes, so they cannot follow the active one — the plate chip has to
  look like a plate while you are looking at the sky. They read `--plate-*` and
  `--sky-*`, which `tokens.css` names once and the themes themselves resolve
  from. `currentColor` is the obvious choice here and it is wrong: it made both
  chips light in `sky` and collapsed the negative/positive pair into "outline
  icon, filled icon".
- **A tooltip triggered by `:focus-within` stays open after a mouse click,**
  because the button keeps focus. Use `peer-focus-visible` — the keyboard user
  only, who is the one who needs it.
- **Decorative bleed must not widen the document.** The hero's clearing was
  `scale-125` and pushed the page 17px past the viewport at 390px — a horizontal
  scrollbar on every phone. It bleeds only vertically now. Check
  `scrollWidth === clientWidth` at 390px after touching the hero, and check it
  against the **static export**: `next dev` injects an overlay with its own
  overflow and will mislead you in both directions.
- **Never put `scroll-snap-align` on a section that can outgrow the screen.**
  When a snap area is larger than the snapport, the scroller may only rest where
  that area still covers the viewport — so every position past the section's
  bottom edge is dragged back to it. With a catalogue 1.7 screens tall this made
  the footer literally unreachable: the document refused to scroll past 1552 of 1812. **`proximity` does not save you.** The oversized-area rule applies
  whatever the strictness, which is the opposite of what the keyword sounds like
  it promises. `screenful` therefore snaps on a zero-height `::before` marker at
  the section's top edge, which can never be larger than the snapport. The
  marker is absolutely positioned so `justify-content: center` cannot drag it
  into the middle of the section it is meant to mark, and it carries
  `scroll-margin-top: var(--screen-offset)` so the first screen settles at the
  top of the document instead of scrolling the header off it.
- **Frontmatter does not go through the MDX pipeline.** Note bodies get
  `remark-smartypants`; a title, standfirst or catalogue summary does not, so
  they shipped typewriter apostrophes directly above prose that had real ones.
  `content/schema.ts` typesets them on the way in — add new prose fields with
  the `prose()` helper, not a bare `z.string()`.
- **A single-column CSS grid does not clamp its child.** An implicit grid
  column is `auto`, which resolves to max-content — so `.prose`, which carries
  `max-width: var(--measure-prose)`, asked for 608px inside a 375px phone and
  took the page sideways with it. Use `grid-cols-1`
  (`repeat(1, minmax(0, 1fr))`) on the single-column case, not nothing.
- **The contents list and the rendered anchors must use the same slugger.**
  `extractHeadings` imports `github-slugger`, which is what `rehype-slug` uses,
  and it is a direct dependency for exactly that reason. A hand-rolled slugify
  agrees on every simple heading and then disagrees on the first one with an
  ampersand — `Notes & asides` is `notes--asides`, with two hyphens.
- **The nav collapses behind `MobileNav` below `sm`.** The inline list has
  roughly 100px of slack at 640px with four items; a fifth spends most of it and
  a sixth wraps the masthead again. When a route is added, measure the header at
  640px — the fix is to move the breakpoint to `md`, never to shrink the type.
- **Check layout at 1920 as well as 1440.** A reading column left-aligned
  inside the wide shell sat 175px left of centre on a 1920px screen — the header
  and footer spanned the shell, the text used 60% of it, and the page read as
  though it had slid sideways. It was wrong at 1440 too; the wider screen just
  made it obvious. `Page` takes `width="reading"` for single-column pages, which
  centres the measure while leaving the masthead where it is.
- **Next replaces `openGraph`, it does not merge it.** A page that declares
  `openGraph` to add one field silently drops everything the layout set — which
  is how notes lost `og:image` entirely and how every page came to claim
  `og:url` was the home page. Both were invisible in the source and obvious in
  the built HTML. Every route goes through `pageMetadata` in `src/lib/seo.ts`
  and passes its own path; `tests/metadata.test.ts` asserts against `out/`.
- **The theme init script must stay a raw inline `<script>`.** React logs a
  dev-only warning about script tags inside components; it is true, irrelevant
  for a script that must run once before first paint, and absent from a
  production build. `next/script` with `strategy="beforeInteractive"` is the
  documented way to silence it and is **wrong here**: under `output: 'export'`
  it emits no executable tag, only a push into `self.__next_s` for the runtime
  to drain after boot — so the theme lands after the page has painted. The whole
  e2e suite stayed green through that change, because "applies the stored theme
  before first paint" asserts after `goto` resolves, by which point hydration
  has already run it. "Sets the theme with the framework JavaScript blocked"
  is the test that actually holds the line; do not delete it.
- **A `screenful` that sits under the header needs `--screen-offset`.** Without
  it the page is exactly one header taller than the viewport and the snap marker
  at the section's top edge pulls the masthead off-screen the moment the scroll
  settles. The hero and the 404 both carry
  `[--screen-offset:var(--header-block)]` for this reason; a section further
  down the page does not.
- **Seed draft content before trusting any scroll or layout behaviour.** With
  one catalogue row every section fits a screen and the bug above is invisible.
  `draft: true` builds in `pnpm dev` and is excluded from `pnpm build` and
  `check:content`, so seed files can never reach production.
- **The nav renders `liveNav()`, not `NAV`.** Every item carries a `live` flag;
  flipping it is the last step of building a route. The site never ships a dead
  link or a stub page.
