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
| Alcyone    | 2.86      | 1     |
| Electra    | 3.70      | 2     |
| Maia       | 3.86      | 3     |
| **Merope** | **4.18**  | **4** |
| Taygeta    | 4.29      | 5     |
| Celaeno    | 5.44      | 6     |
| Asterope   | 5.64      | 7     |

_(Atlas at 3.62 and Pleione at 5.09 are the parents, not sisters.)_

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
- [Merope (star) — Wikipedia](<https://en.wikipedia.org/wiki/Merope_(star)>)
- [Merope (23 Tauri): Star Facts — Star Facts](https://www.star-facts.com/merope/)
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
