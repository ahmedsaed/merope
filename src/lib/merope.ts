/**
 * The single source of truth for every piece of Merope lore the site displays.
 *
 * The rule for this file: if a number or claim appears anywhere in the UI, it
 * lives here first. No magic astronomical constants scattered through
 * components — partly for consistency, mostly so the whole set can be
 * fact-checked in one place.
 *
 * Every value below was verified against published sources on 2026-09-13.
 * See docs/LORE.md for the citations and for the popular claims that turned out
 * to be false. Anything added later must be checked before it ships: a site
 * built entirely out of lore cannot afford wrong lore.
 */

/** 23 Tauri — the star itself. */
export const STAR = {
  /** Bayer/Flamsteed designation. The one to use when being terse. */
  designation: '23 Tau',
  catalog: { hd: 'HD 23480' },

  /** J2000 / ICRS equatorial coordinates. */
  ra: { h: 3, m: 46, s: 19.5859, display: '03h 46m 19.59s' },
  dec: { sign: '+', d: 23, m: 56, s: 54.092, display: '+23° 56′ 54.09″' },

  /**
   * Apparent visual magnitude. Sources give 4.17–4.18; the star is a Beta
   * Cephei variable with an amplitude of roughly 0.01 mag, so the spread is the
   * star, not a disagreement.
   */
  magnitude: 4.18,

  /**
   * Merope is the FOURTH-BRIGHTEST of the seven sisters, and fifth-brightest
   * object in the cluster once Atlas is counted. She is emphatically not the
   * faintest — Celaeno (5.44) and Asterope (5.64) are both dimmer, and popular
   * astronomy writing gets this wrong constantly. The "Lost Pleiad" title is
   * mythological, not photometric.
   */
  rankAmongSisters: 4,

  /** Blue-white subgiant with emission lines. This is where the accent colour
   *  comes from — the palette is not decorative, it is the star's spectrum. */
  spectralType: 'B6IV(e)',

  /** 460 ± 20 ly (142 ± 6 pc). */
  distanceLightYears: 460,
  distanceUncertaintyLightYears: 20,

  cluster: { messier: 'M45', name: 'The Pleiades' },
} as const;

/** The dust Merope is passing through — and the whole thesis of the studio. */
export const NEBULA = {
  ngc: 'NGC 1435',
  names: ["Tempel's Nebula", 'The Merope Nebula'],
  discovery: { by: 'Wilhelm Tempel', date: '1859-10-19' },

  /**
   * The fact the studio is named for.
   *
   * The nebula was long assumed to be what remained of the cloud the Pleiades
   * formed from. It is not. It is an unrelated interstellar cloud the cluster
   * happens to be drifting through right now, and it is lit entirely by Merope.
   *
   * The studio is the star. The projects are what it makes visible.
   */
  thesis: 'The star is not the point. What it lights up is.',

  /**
   * A knot of dust 3,500 AU (0.06 ly) from the star and about 30″ from it on
   * the sky, being decelerated and shaped by Merope's radiation pressure —
   * smaller grains braking harder than larger ones. Thought to be a fragment of
   * the Taurus–Auriga molecular cloud. The paper describing it is titled
   * "An Interstellar Interloper", which is a very good name for a deadline.
   */
  knot: {
    designation: 'IC 349',
    name: "Barnard's Merope Nebula",
    discovery: { by: 'E. E. Barnard', date: '1890-11' },
    distanceAu: 3500,
  },
} as const;

/**
 * The plate.
 *
 * On 16 November 1885 the brothers Paul and Prosper Henry photographed the
 * Pleiades with the 13-inch refractor at Paris Observatory and found nebulosity
 * nobody had seen through an eyepiece — including a whole new nebula around
 * Maia (NGC 1432). The camera saw what the eye could not.
 *
 * Note the precision: this is NOT true of the Merope Nebula itself, which
 * Tempel had already found visually in 1859. The plate revealed the *extent* of
 * the nebulosity, not Merope's own.
 */
export const PLATE = {
  date: '1885-11-16',
  by: ['Paul Henry', 'Prosper Henry'],
  instrument: '13-inch refractor, Paris Observatory',
  revealed: 'NGC 1432, the Maia Nebula',
} as const;

/**
 * NASA Ames named a supercomputer Merope and then made the name literal: it was
 * built out of the Harpertown nodes retired from Pleiades, the larger system
 * named after the cluster Merope belongs to.
 *
 * A machine named after a star in the Pleiades, assembled from the Pleiades'
 * own cast-off parts, and still doing real science for eight years afterwards.
 */
export const SUPERCOMPUTER = {
  operator: 'NASA Advanced Supercomputing (NAS), Ames Research Center',
  builtFrom: 'Pleiades',
  builtFromDetail: 'Intel Xeon 5400 (Harpertown) nodes from the original 2008 Pleiades',
  cores: 5120,
  peakTeraflops: 61,
  inService: { from: '2013-09-16', to: '2021-05-12' },
  thesis: 'Spare parts. Real work.',
} as const;

/**
 * The cluster, as coordinates.
 *
 * Stored sexagesimally exactly as the sources print them, so every value can be
 * checked against the citation without undoing arithmetic. `src/lib/sky.ts`
 * converts and projects.
 *
 * INCOMPLETE, DELIBERATELY. Three members are missing because their coordinates
 * could not be verified from here — the network policy blocks the catalogue
 * pages, and one search result returned Asterope with Alcyone's right ascension,
 * which is exactly the kind of plausible-looking wrong number this file exists
 * to keep out. Asterope (21 Tau), Atlas (27 Tau) and Pleione (28 Tau) must be
 * added from SIMBAD before the hero ships in Phase 2. See docs/LORE.md.
 */
export const PLEIADES = [
  {
    name: 'Alcyone',
    designation: '25 Tau',
    ra: { h: 3, m: 47, s: 29.077 },
    dec: { d: 24, m: 6, s: 18.49 },
    magnitude: 2.87,
    sister: true,
  },
  {
    name: 'Electra',
    designation: '17 Tau',
    ra: { h: 3, m: 44, s: 52.537 },
    dec: { d: 24, m: 6, s: 48.011 },
    magnitude: 3.7,
    sister: true,
  },
  {
    name: 'Maia',
    designation: '20 Tau',
    ra: { h: 3, m: 45, s: 49.607 },
    dec: { d: 24, m: 22, s: 3.886 },
    magnitude: 3.87,
    sister: true,
  },
  {
    name: 'Merope',
    designation: '23 Tau',
    ra: { h: 3, m: 46, s: 19.586 },
    dec: { d: 23, m: 56, s: 54.092 },
    magnitude: 4.18,
    sister: true,
  },
  {
    name: 'Taygeta',
    designation: '19 Tau',
    ra: { h: 3, m: 45, s: 12.496 },
    dec: { d: 24, m: 28, s: 2.21 },
    magnitude: 4.3,
    sister: true,
  },
  {
    name: 'Celaeno',
    designation: '16 Tau',
    ra: { h: 3, m: 44, s: 48.215 },
    dec: { d: 24, m: 17, s: 22.083 },
    magnitude: 5.45,
    sister: true,
  },
] as const;

export type PleiadesStar = (typeof PLEIADES)[number];

/** Members whose coordinates are still outstanding. Named so the gap is visible. */
export const PLEIADES_MISSING = [
  'Asterope (21 Tau)',
  'Atlas (27 Tau)',
  'Pleione (28 Tau)',
] as const;

/**
 * Magnitude as a project status system.
 *
 * Honest, because it is inverted the way the real scale is: a lower number
 * means brighter, and the naked-eye limit is a real boundary at 6. Anything
 * past that needs a telescope — which is a nicer way of saying "archived" than
 * "archived" is.
 */
export const MAGNITUDE_CLASSES = [
  { mag: 1, label: 'First magnitude', meaning: 'Flagship. Actively built, actively used.' },
  { mag: 2, label: 'Second magnitude', meaning: 'Established. Stable and maintained.' },
  { mag: 3, label: 'Third magnitude', meaning: 'Live. Released, still moving.' },
  { mag: 4, label: 'Fourth magnitude', meaning: 'Working. Usable, rough in places.' },
  { mag: 5, label: 'Fifth magnitude', meaning: 'Faint. Early, public, unfinished.' },
  { mag: 6, label: 'Sixth magnitude', meaning: 'Naked-eye limit. An experiment.' },
  { mag: 7, label: 'Telescopic', meaning: 'Below the limit. Archived or private.' },
] as const;

export type Magnitude = (typeof MAGNITUDE_CLASSES)[number]['mag'];

/** Shown in the footer and the console banner. Terse on purpose. */
export const COORDINATE_LINE = `${STAR.designation} · ${STAR.ra.display} ${STAR.dec.display} · ${STAR.spectralType} · m${STAR.magnitude}`;
