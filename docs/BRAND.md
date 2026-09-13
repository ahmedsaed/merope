# Merope — brand & design direction

Facts cited here are verified in [`docs/LORE.md`](LORE.md), which is the
authority. This document is about what we do with them.

---

## The name

Four unrelated things are true about Merope, and the studio can use all of them.

### 1. She is the Lost Pleiad — but not the faintest

Merope is one of the seven Pleiades and the sister most commonly identified as
the "Lost Pleiad": hers is the story of marrying a mortal, Sisyphus, while her
sisters consorted with gods, and hiding her face out of shame.

**She is not, however, the dimmest.** At magnitude 4.18 she is the
fourth-brightest of the seven; Celaeno and Asterope are considerably fainter.
Popular astronomy writing claims otherwise constantly and is wrong.

So the title is **mythological, not photometric**, and the honest framing is
better than the false one: she is not the faintest sister, she is the one with a
_story_ about dimming. The one with a reason to be modest.

For a studio of personal projects that is exactly right. Not "we are small and
obscure" — rather, _this is deliberately understated, and there is a reason._

### 2. Her nebula is not hers

The wisps around Merope (NGC 1435, Tempel's Nebula) were long assumed to be the
remains of the cloud the Pleiades formed from. They are not. It is an unrelated
interstellar cloud the cluster is currently drifting through, and the nebulosity
exists only because Merope's light happens to be falling on it.

> **The star is not the point. What it lights up is.**

That is the studio thesis. merope.dev is the star; the projects on the subdomains
are the nebula. The front door exists to make them visible and should never
compete with them for attention. Every design decision that follows can be
checked against this sentence.

### 3. NASA made the name literal

NASA Ames named a supercomputer Merope, then built it out of the Harpertown
nodes retired from **Pleiades** — the larger system named after the cluster
Merope belongs to. A machine named for a star in the Pleiades, assembled from
the Pleiades' own cast-off parts, and doing real science for eight years
afterwards.

> **Spare parts. Real work.**

Nothing here needs to have been built with a budget to be worth using.

### 4. The magnitude scale is already a status system

The scale Merope sits on is inverted and logarithmic: lower means brighter, each
whole step is a factor of 2.512, and magnitude 6 is the naked-eye limit. That is
a ready-made and honest way to say how alive a project is.

| Magnitude | Means                               |
| --------- | ----------------------------------- |
| 1         | Flagship. Actively built and used.  |
| 2         | Established. Stable and maintained. |
| 3         | Live. Released, still moving.       |
| 4         | Working. Usable, rough in places.   |
| 5         | Faint. Early, public, unfinished.   |
| 6         | Naked-eye limit. An experiment.     |
| 7         | Telescopic. Archived or private.    |

The honesty is the feature. "Magnitude 6" says _this is an experiment_ without
anyone writing a disclaimer, and it does not rot the way "beta" does. It is also
already implemented — the same tokens drive UI brightness and project status.

---

## The look: Plate & Sky

### Directions considered

Three were on the table.

**A — Observatory.** Dark throughout, the sky as literal navigation: projects as
stars at real coordinates, magnitude encoding maturity. _Rejected as the primary
direction:_ every space-themed studio site is near-black with a particle
starfield and a purple gradient. Beautiful if executed with total restraint,
indistinguishable from everything else if not.

**B — Plate Archive.** A photographic glass-plate archive: warm stock, carbon
ink, hairline rules, monospace marginalia, grease-pencil annotation.
_Distinctive, and grounded in real lineage_ — the Henry brothers' 1885 plates.

**C — Spare Parts.** The NASA angle: ops console, status boards, telemetry, rack
diagrams. _Rejected:_ most "software studio", least visually distinctive, and it
spends the best metaphor on the least interesting execution.

### The decision

**B as the default, A as the second state** — and the toggle is the idea.

**Plate** (default) — the archive. Warm off-white stock, carbon ink, hairline
rules, monospace lettering in the margins, grease-pencil red for anything
circled. Dense with real information, typographic rather than decorative.

**Sky** — the observation itself. Near-black with a blue-white cast, the same
layout, but the annotations glow and the reflection nebula blooms behind the
wordmark.

These are not light and dark modes. They are **two ways of recording the same
sky**, and the control says so: it is labelled `plate / sky`, not a sun and a
moon. The joke underneath is that early astrophotography worked on **negatives**,
so the light theme is, correctly, the negative. Switching themes switches between
the plate and what it recorded.

### Why this survives scrutiny

A studio site set in Inter on white with three feature cards is invisible. The
plate direction is distinctive for a reason that holds up under pressure: it is
a **reading** aesthetic, and this site's job is notes, changelogs and a
catalogue. Information density is the point, not an accident of theme. The
metaphor and the function agree.

---

## Typography

Two families, **no sans**.

- **Newsreader** — all prose, all headings. Literary, optically sized, slightly
  bookish.
- **IBM Plex Mono** — every label, coordinate, magnitude, date and catalogue
  value. Technical without being a code font.

Dropping the sans entirely is most of what makes the site read as a printed
plate rather than a dashboard, before a single colour is applied. This is a
non-negotiable, not a default.

## Colour discipline

Two accents, both earned:

- **`--accent`** — blue-white, taken from Merope's actual spectral class,
  B6IV(e). The palette is the star's spectrum, not a mood board.
- **`--mark`** — grease-pencil red. Rationed to one meaning: _this needs your
  attention._ Focus rings, breaking changes, nothing else.

If a third accent ever seems necessary, the layout is probably wrong.

---

## The wordmark

**Decided: the circled star.** A dot with a grease-pencil ring around it —
precisely the gesture an astronomer made on a plate to say _this one_. It is the
studio thesis as a drawing: the object, and the act of picking it out.

Why this one, over five alternatives:

- It is the only candidate that is both meaningful and legible at 16px. A mark
  that dies in a browser tab is not a mark, and this one has to serve as the
  favicon for every project subdomain.
- It uses both accents for their actual meanings — the star's colour, and the
  pencil that marks attention — rather than decoratively.
- The open gap in the ring keeps it hand-drawn rather than geometric.
- Subdomains inherit the ring and change what sits inside it.

**The asterism stays out of the mark.** Seven sisters at true relative positions
with Merope circled tells the whole story in one glyph, and is by some distance
the most meaningful option — but it collapses into noise at favicon size. It
belongs in the hero, where it can be large enough to work. Rejected as the mark,
kept as the illustration.

The catalogue designation (`23 Tau · M45`) set under the name is a **lockup, not
an alternative** — it pairs with the mark in a header and is useless as an icon.

## The easter eggs

The rule: **the lore is in the details and the vocabulary, never in the way.**
Someone who has never heard of Merope should read a clean, well-set studio site.
Someone who has should find a dozen rewards.

Planned, cheap, high delight:

- The projects laid out as a **star catalogue** — designation, magnitude, kind,
  first light — instead of three cards with icons. More information, less
  template, and the centrepiece of the landing page.
- **"First light"** as the field name for a launch date. It is what astronomers
  call a telescope's first real image.
- A console banner on load with the real coordinates and `23 Tau`.
- `/humans.txt` written as an observation log.
- **404**: _"No object at these coordinates."_
- `Cmd+K` palette named **finder scope** — the small telescope used to aim the
  big one.
- RSS described as an **ephemeris**.
- Changelog entries dated in ISO _and_ Julian date.
- **"An Interstellar Interloper"** — the actual title of the Herbig & Simon paper
  on IC 349. Too good not to use somewhere.
- Footer: the coordinate line, and one line about the Pleiades' spare parts.

### The failure mode to avoid

This can tip into costume. Guard rails:

1. **Content stays plainly readable.** No astronomical vocabulary where a normal
   word does the job better.
2. **No interaction is gated behind understanding the metaphor.** The star-map
   idea decorates a catalogue; it never replaces navigation.
3. **Every lore fact must be true.** `src/lib/merope.ts` is the single source and
   `docs/LORE.md` carries the citations. Three claims in the first draft were
   wrong — two of them errors the sources themselves repeat. Check before
   shipping, every time.
