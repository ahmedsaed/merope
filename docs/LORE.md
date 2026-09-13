# Lore — verified facts and sources

Everything the site asserts about Merope, checked against published sources on
**2026-09-13**.

`src/lib/merope.ts` is the machine-readable copy; this file is why it says what
it says. **Nothing goes on a public page unless it appears here first.** A site
built entirely out of lore cannot afford wrong lore.

---

## Corrections made during this check

Three things in the first draft were wrong. Recording them because two of them
are mistakes the sources themselves keep making.

### 1. The NASA supercomputer was built from Pleiades, not Columbia

The first draft said Merope was assembled from decommissioned **Columbia**
nodes. It was not. It was built from the Intel Xeon 5400 (Harpertown) nodes
retired from **Pleiades** — the larger NAS system named after the cluster.

This is a much better fact than the one it replaced. NASA named a machine after
a star in the Pleiades, then built it out of the Pleiades' own cast-off parts.
The naming became literal. _Spare parts, real work_ survives intact and gains a
second layer.

### 2. Merope is not the faintest of the seven

The first draft called her "the faintest of them, the one you have to look for."
That is false. Apparent magnitudes of the seven sisters:

| Star       | Magnitude | Rank  |
| ---------- | --------- | ----- |
| Alcyone    | 2.87      | 1     |
| Electra    | 3.70      | 2     |
| Maia       | 3.87      | 3     |
| **Merope** | **4.18**  | **4** |
| Taygeta    | 4.30      | 5     |
| Celaeno    | 5.46      | 6     |
| Asterope   | 5.76      | 7     |

_(Atlas at 3.63 and Pleione at 5.09 are the parents, not sisters.)_

All V magnitudes are SIMBAD's, sourced to Ducati (2002). An earlier draft of
this table mixed values from several popular-astronomy pages and drifted by up
to 0.12 mag — enough to be wrong, never enough to change the ranking.

Merope is **fourth-brightest of the seven**, fifth-brightest in the cluster once
Atlas is counted. Celaeno and Asterope are both considerably dimmer.

Popular astronomy writing repeats "Merope is the faintest star in the cluster"
constantly — one of the sources found during this check says exactly that. It is
wrong, and the photometry is not ambiguous.

**What this means for the brand.** The "Lost Pleiad" title is **mythological,
not photometric**. She is not the dimmest sister; she is the one with a _story_
about dimming. That is the more interesting framing anyway: not the faintest, but
the only one with a reason to be modest. See `docs/BRAND.md`.

### 3. The camera did not discover the Merope Nebula

The first draft implied the 1885 photographic plates revealed Merope's nebula.
They did not — Tempel found it visually in 1859. What the plates revealed was
the _extent_ of the Pleiades nebulosity, including an entirely new nebula around
Maia (NGC 1432).

"The camera saw what the eye could not" is still true, and still the basis of the
plate aesthetic. It just is not true about Merope's own nebula specifically.

---

## The star — 23 Tauri

|                          |                                                   |
| ------------------------ | ------------------------------------------------- |
| Designations             | Merope, 23 Tauri, HD 23480                        |
| Coordinates (J2000/ICRS) | RA 03h 46m 19.5859s · Dec +23° 56′ 54.092″        |
| Apparent magnitude       | 4.18 (sources give 4.17–4.18)                     |
| Variability              | Beta Cephei variable, amplitude ~0.01 mag         |
| Spectral type            | B6IV(e) — blue-white subgiant with emission lines |
| Distance                 | 460 ± 20 ly (142 ± 6 pc)                          |
| Cluster                  | M45, the Pleiades                                 |
| Rank                     | 4th brightest of the seven sisters                |

The magnitude spread of 4.17–4.18 is the star, not a disagreement between
sources: it genuinely varies by about a hundredth of a magnitude.

**The spectral type is load-bearing.** B6IV(e) is blue-white, and that is where
`--accent` comes from. The palette is the star's spectrum, not a mood board.

## The cluster, as coordinates

Used by `StarField` to place every dot. Stored sexagesimally in
`src/lib/merope.ts` exactly as printed below, so a value can be checked against
its source without undoing arithmetic.

**Every row is SIMBAD**, ICRS at epoch J2000, read on 2026-09-13 and truncated
to the milliarcsecond. One catalogue for all nine members on purpose: mixing
sources means mixing epochs and reductions, and a table nobody can re-derive
from a single query is a table nobody will check.

| Star     | Designation | RA (J2000)      | Dec (J2000)      | Mag  | Sister |
| -------- | ----------- | --------------- | ---------------- | ---- | ------ |
| Alcyone  | 25 Tau      | 03h 47m 29.077s | +24° 06′ 18.488″ | 2.87 | yes    |
| Atlas    | 27 Tau      | 03h 49m 09.743s | +24° 03′ 12.302″ | 3.63 | no     |
| Electra  | 17 Tau      | 03h 44m 52.537s | +24° 06′ 48.016″ | 3.70 | yes    |
| Maia     | 20 Tau      | 03h 45m 49.608s | +24° 22′ 03.878″ | 3.87 | yes    |
| Merope   | 23 Tau      | 03h 46m 19.586s | +23° 56′ 54.092″ | 4.18 | yes    |
| Taygeta  | 19 Tau      | 03h 45m 12.500s | +24° 28′ 02.186″ | 4.30 | yes    |
| Pleione  | 28 Tau      | 03h 49m 11.217s | +24° 08′ 12.157″ | 5.09 | no     |
| Celaeno  | 16 Tau      | 03h 44m 48.215s | +24° 17′ 22.083″ | 5.46 | yes    |
| Asterope | 21 Tau      | 03h 45m 54.476s | +24° 33′ 16.236″ | 5.76 | yes    |

SIMBAD resolves three of these under a different primary identifier — Alcyone as
η Tau, Taygeta as q Tau, Asterope as 21 Tau with the name _Asterope_ among its
identifiers. Query by Flamsteed number and the record is unambiguous.

**Atlas and Pleione are the parents, not sisters.** They belong in the asterism
and in the data; they do not belong in any count of seven. `sister` in
`merope.ts` carries the distinction so nothing has to re-derive it, and
`tests/lore.test.ts` asserts seven of nine.

### Asterope is a double

21 Tau has a companion, 22 Tau (A0Vn, V 6.42), about 150″ — two and a half
arcminutes — away, computed from the two SIMBAD positions. Only 21 Tau is
stored: at the size the field renders, two dots that close merge into one
anyway, and the brighter component is the one the naked eye records.

### The gap that used to be here, and how it was closed

The first version of this table had six rows. Asterope, Atlas and Pleione were
left out because the session that built it could not reach a catalogue — and the
one search result that did return a position for Asterope gave it **Alcyone's
right ascension**. Precise, plausible, wrong, and it would have rendered a star
chart that simply is not the sky.

It was visible in the drawing: Atlas and Pleione form the cluster's eastern
"handle", so Alcyone sat alone at the edge of the frame and the asterism did not
read as the Pleiades. The three were added from SIMBAD on 2026-09-13, and the
remaining six were re-read from the same query at the same time so the whole
table has one provenance.

Two assertions in `tests/sky.test.ts` changed as a result, which is the test
doing its job rather than failing: **Pleione**, not Alcyone, is now the
easternmost member and therefore the leftmost dot, and **Asterope**, not
Taygeta, is the northernmost. Merope remains furthest south, as she must —
Atlas and Pleione are both north of her.

### The background field

The site is set on 650 more stars: the brightest Gaia DR3 records within 3° of
the cluster down to G 11.2, minus the nine themselves. They live in
`src/lib/field.ts`, which is **generated** — `pnpm fetch:field` runs the query
and rewrites the file, and the query URL is printed at the top of it.

They are drawn by `SkyBackdrop` across the whole page rather than inside the
hero's frame, and at their own scale: the page spans three degrees where the
hero's cluster spans one, so the same stars are about twice the size there. The
two are **not in register**, deliberately — they are the wide plate and the
detail print of one object, which is how an archive actually holds a thing.

They are real for a reason that is a rule rather than a preference. `AGENTS.md`
says star positions are never hand-placed, and `docs/BRAND.md` rejected the
Observatory direction precisely because "every space-themed studio site is
near-black with a particle starfield". A scatter of invented dots would break
the first and be the second. The actual sky around Merope costs one query.

Stored in decimal degrees rather than sexagesimal, because unlike everything
else in this document these are positions to draw, not facts to state — nothing
in the field is ever quoted in the UI. The magnitude limit is set by markup
weight rather than by astronomy: every star is an SVG element, so the cut is "as
deep as looks like sky and no deeper".

### Projection

`src/lib/sky.ts` uses a flat tangent-plane projection. Over a cluster spanning
about a degree the spherical correction is far below a pixel, so a gnomonic
projection would be false precision. Two things do matter, and both are asserted
in `tests/sky.test.ts`:

- **The `cos(dec)` term.** At +24° a degree of right ascension is about 91% the
  width of a degree of declination. Dropping it stretches the cluster sideways
  by ~9% — invisible as a bug, wrong as a star chart.
- **East is left.** Sky charts are drawn as seen looking up, not as maps.
  Pleione has the largest RA in the set, so it must render furthest left.
- **The cluster is centred, not anchored.** It spans about 1.0° east–west and
  0.61° north–south, and one scale serves both axes so the real shape survives.
  That leaves the shorter axis unable to fill a square field, so it is centred
  in it — anchoring both axes at their minimum pins the asterism to the top of
  the frame and leaves a dead band beneath it.

Dot radii are deliberately _not_ proportional to flux: true brightness ratios
would make Alcyone roughly 13× Celaeno's area and the faint members would
disappear. The scale is compressed, with the ordering preserved.

## The myth — the Lost Pleiad

Merope is the most commonly identified "Lost Pleiad". Her sisters consorted with
gods; she married a mortal, **Sisyphus**, and — depending on which version you
read — hid her face in shame either at marrying a mortal at all, or at her
husband being a criminal condemned to roll his stone forever.

**Competing version:** in some tellings the lost sister is **Electra**, who faded
in grief at the sack of Troy. Both attributions are ancient and neither is
settled. If the site ever states this as fact, it must say "most commonly
identified as" rather than asserting it outright.

## The nebula — NGC 1435

|                |                                          |
| -------------- | ---------------------------------------- |
| Names          | Merope Nebula, Tempel's Nebula, NGC 1435 |
| Discovered     | 19 October 1859, by Wilhelm Tempel       |
| Type           | Diffuse reflection nebula                |
| Illuminated by | Merope, entirely                         |

**The studio thesis, and it holds up.** The nebula was long assumed to be the
remains of the cloud the Pleiades formed from. It is not. It is an unrelated
interstellar cloud that the cluster is currently passing through, and the
nebulosity exists only because Merope's light is falling on it.

> The star is not the point. What it lights up is.

The one precision worth keeping: it is the **cluster** moving through the cloud,
and **Merope** that lights this particular part of it. Both are true; do not
collapse them into a claim that Merope alone is passing through.

### IC 349 — Barnard's Merope Nebula

|                      |                                                               |
| -------------------- | ------------------------------------------------------------- |
| Discovered           | November 1890, by E. E. Barnard                               |
| Distance from Merope | 3,500 AU (0.06 ly), ~30″ on the sky                           |
| Brightness           | Nucleus is ~15× the brightest part of the Pleiades nebulosity |

A knot of dust being decelerated and shaped by Merope's radiation pressure, with
smaller grains braking harder than larger ones — which is what produces the
parallel wisps Hubble resolved in 1999 (Herbig & Simon). Thought to be a fragment
of the Taurus–Auriga molecular cloud caught by the cluster's southward motion.

The paper describing it is titled **"An Interstellar Interloper"**, which is an
extremely good phrase and should be used somewhere.

## The plate — 16 November 1885

Paul and Prosper Henry photographed the Pleiades with the 13-inch refractor at
Paris Observatory and recorded nebulosity invisible through an eyepiece,
including a new nebula around Maia (NGC 1432). Between 1885 and 1888 their plates
and Isaac Roberts' revealed the full complexity of the Pleiades nebulae.

This is the origin of the **plate** theme: the archive is the thing people
actually handled, and it recorded more than anyone could see.

## The supercomputer — Merope at NASA Ames

|                  |                                                                |
| ---------------- | -------------------------------------------------------------- |
| Operator         | NASA Advanced Supercomputing (NAS), Ames Research Center       |
| Built from       | Harpertown nodes retired from **Pleiades**                     |
| Processors       | Intel Xeon 5400 (Harpertown); later also Xeon X5670 (Westmere) |
| Cores            | 5,120                                                          |
| Peak performance | 61 teraflops                                                   |
| In service       | 16 September 2013 – 12 May 2021                                |
| Housed           | An auxiliary processing centre ~1 km from the NAS facility     |

The original 2008 Pleiades was 100 SGI Altix ICE 8200EX racks of Harpertown
processors. When those were replaced in the 2013 upgrade cycle, the retired
racks became Merope rather than scrap.

> Spare parts. Real work.

---

## Sources

- [Merope Supercomputer — NASA NAS](https://www.nas.nasa.gov/hecc/resources/merope.html)
- [NASA's Pleiades Supercomputer Upgraded, Harpertown Nodes Repurposed — NASA NAS, 2013](https://www.nas.nasa.gov/pubs/news/2013/09-19-13.html)
- [HECC Legacy Systems — NASA NAS](https://www.nas.nasa.gov/hecc/resources/legacy.html)
- [Gaia DR3 via VizieR (I/355/gaiadr3)](https://vizier.cds.unistra.fr/viz-bin/VizieR-3?-source=I/355/gaiadr3) — the background field
- [Tycho-2 / VizieR](https://vizier.cds.unistra.fr/viz-bin/VizieR-3?-source=I/259/tyc2) — cross-checked against Gaia for the field
- [SIMBAD — 21 Tau (Asterope)](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=21+Tau)
- [SIMBAD — 22 Tau](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=22+Tau)
- [SIMBAD — 27 Tau (Atlas)](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=27+Tau)
- [SIMBAD — 28 Tau (Pleione)](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=28+Tau)
- [SIMBAD — 25 Tau (Alcyone)](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=25+Tau)
- [SIMBAD — 17 Tau (Electra)](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=17+Tau)
- [SIMBAD — 20 Tau (Maia)](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=20+Tau)
- [SIMBAD — 23 Tau (Merope)](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=23+Tau)
- [SIMBAD — 19 Tau (Taygeta)](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=19+Tau)
- [SIMBAD — 16 Tau (Celaeno)](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=16+Tau)
- [Merope (star) — Wikipedia](<https://en.wikipedia.org/wiki/Merope_(star)>)
- [Merope (23 Tauri): Star Facts — Star Facts](https://www.star-facts.com/merope/)
- [Alcyone (Eta Tauri) — Star Facts](https://www.star-facts.com/alcyone/)
- [Electra (17 Tauri) — Star Facts](https://www.star-facts.com/electra/)
- [Maia (20 Tauri) — Star Facts](https://www.star-facts.com/maia/)
- [Taygeta (19 Tauri) — Star Facts](https://www.star-facts.com/taygeta/)
- [Celaeno (16 Tauri) — Wikipedia](<https://en.wikipedia.org/wiki/Celaeno_(star)>)
- [Pleiades — Wikipedia](https://en.wikipedia.org/wiki/Pleiades)
- [Messier 45: Pleiades — Messier Objects](https://www.messier-objects.com/messier-45-pleiades/)
- [Merope (Pleiad) — Wikipedia](<https://en.wikipedia.org/wiki/Merope_(Pleiad)>)
- [MEROPE, Corinthian Pleiad Nymph — Theoi](https://www.theoi.com/Nymphe/NympheMerope.html)
- [NGC 1435 — Wikipedia](https://en.wikipedia.org/wiki/NGC_1435)
- [Merope and NGC 1435/IC 349 — SEDS Messier](http://www.messier.seds.org/more/m045_merope.html)
- [Barnard's Merope Nebula IC 349 in M45 — SEDS Messier](http://www.messier.seds.org/more/m045_i349.html)
- [Barnard's Merope Nebula Revisited: New Observational Results — Herbig & Simon, AJ 121, 3138 (2001)](https://iopscience.iop.org/article/10.1086/321077)
- [Ghostly Reflections in the Pleiades — NASA Science](https://science.nasa.gov/asset/hubble/ghostly-reflections-in-the-pleiades/)
- [Paul Henry and Prosper Henry — SEDS Messier](http://www.messier.seds.org/xtra/Bios/henry.html)
- [Messier Object 45 — SEDS Messier](http://www.messier.seds.org/m/m045.html)
