# Merope — brand & design direction

## The name

Four unrelated things are true about Merope, and the studio can use all of them.

**1. She is the faint one.**
Merope is one of the seven Pleiades and the hardest of them to see — the "Lost
Pleiad". In the myth, she is the sister who married a mortal while the others
married gods, and dimmed out of shame. The useful reading is not the shame. It
is that she is _the one you have to look for_.

**2. Her nebula is not hers.**
The wisps around Merope (NGC 1435, Tempel's Nebula) are not her leftovers. They
are an unrelated dust cloud the star happens to be drifting through, and her
light is the only reason anyone can see them.

> **The star is not the point. What it lights up is.**

That is the studio thesis. merope.dev is the star; the projects on the
subdomains are the nebula. The front door exists to make them visible, and it
should never compete with them for attention.

**3. NASA built a Merope out of spare parts.**
A supercomputer at NASA Ames, assembled from decommissioned nodes of the larger
Columbia system, and still doing real science afterwards. For a studio of
personal projects: _spare parts, real work_. Nothing here needs to have been
built with a budget to be worth using.

**4. The magnitude scale is already a status system.**
Merope sits at apparent magnitude 4.14 — visible, unremarkable, fourth-brightest
of the seven. The scale it sits on is inverted and logarithmic: lower means
brighter, and magnitude 6 is the naked-eye limit. That is a ready-made, honest
way to say how alive a project is, and it is already in `src/lib/merope.ts`.

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
anyone having to write a disclaimer, and it does not rot the way "beta" does.

## The look: Plate & Sky

Two themes that are not "light and dark". They are two ways of recording the
same sky.

**Plate** — the default. The aesthetic of a photographic glass plate archive:
warm off-white stock, carbon ink, hairline rules, monospace lettering in the
margins, a grease-pencil red for anything circled. Dense with real information,
typographic rather than decorative.

**Sky** — the observation itself. Near-black with a blue-white cast, the same
layout, but the annotations now glow and the reflection nebula blooms behind the
wordmark.

The toggle is labelled `plate / sky`, not a sun and a moon. There is a joke
underneath: early astrophotography worked on **negatives**, so the light theme
is, correctly, the negative. Switching themes switches between the plate and
what it recorded.

### Why this is worth doing

A studio site set in Inter on white, with three feature cards, is invisible. The
plate direction is distinctive for a reason that survives scrutiny: it is a
_reading_ aesthetic for a site whose job is notes, changelogs and a catalogue.
Information density is the point, not an accident of theme.

## Typography

Two families, **no sans**.

- **Newsreader** — all prose, all headings. Literary, optically sized, slightly
  bookish.
- **IBM Plex Mono** — every label, coordinate, magnitude, date and catalogue
  value. Technical without being a code font.

Dropping the sans entirely is most of what makes the site read as a printed
plate rather than a dashboard, before a single colour is applied.

## Colour discipline

Two accents, both earned:

- **accent** — blue-white, taken from Merope's actual spectral class (B6IV).
  The palette is not decorative; it is the star's spectrum.
- **mark** — grease-pencil red. Rationed to one meaning: _this needs your
  attention_. Used for focus rings, breaking changes, and nothing else.

If a third accent ever seems necessary, the layout is probably wrong.

## The easter eggs

The rule: **the lore is in the details and the vocabulary, never in the way.**
A visitor who has never heard of Merope should read a clean, well-set studio
site. A visitor who has should find a dozen rewards.

Planned, cheap, high delight:

- The catalogue of projects laid out as a **star catalogue** — designation,
  magnitude, kind, first light — instead of three cards with icons. More
  information, less template.
- **"First light"** as the field name for a launch date. It is what astronomers
  call a telescope's first real image.
- A console banner on load with the real coordinates and `23 Tau`.
- `/humans.txt` written as an observation log.
- **404**: _"No object at these coordinates."_ with an empty field and a plate
  number.
- `Cmd+K` palette named **finder scope** — the small telescope used to aim the
  big one.
- RSS feed described as an **ephemeris**.
- Changelog entries dated in ISO _and_ Julian date.
- Footer: `M45 · 440 ly · B6IVe`, and one line about Columbia's spare parts.

### The failure mode to avoid

This can tip into costume. Guard rails:

1. Content stays plainly readable. No astronomical vocabulary where a normal
   word would do a better job.
2. No interaction is gated behind understanding the metaphor. The star-map idea
   is a decoration on a catalogue, never a replacement for navigation.
3. Every lore fact on the page must be **true**. `src/lib/merope.ts` is the
   single source, and values marked `@unverified` need checking against SIMBAD
   before launch. A site built entirely out of lore cannot afford wrong lore.
