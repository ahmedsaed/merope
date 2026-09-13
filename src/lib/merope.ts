/**
 * The single source of truth for every piece of Merope lore the site displays.
 *
 * The rule for this file: if a number or claim appears anywhere in the UI, it
 * lives here first. No magic astronomical constants scattered through
 * components — partly for consistency, mostly so the whole set can be
 * fact-checked in one place.
 *
 * VERIFY BEFORE LAUNCH: values marked `@unverified` are from memory and should
 * be checked against SIMBAD / the NASA NAS site before they go in front of
 * anyone. Getting the lore wrong on a site built entirely out of lore is the
 * one unforced error available to us.
 */

/** 23 Tauri — the star itself. */
export const STAR = {
  /** Bayer/Flamsteed designation. The one to use when being terse. */
  designation: '23 Tau',
  catalog: { hd: 'HD 23480', hip: 'HIP 17608' },

  /** J2000 equatorial coordinates. @unverified */
  ra: { h: 3, m: 46, s: 19.57, display: '03h 46m 19.57s' },
  dec: { sign: '+', d: 23, m: 56, s: 54.1, display: '+23° 56′ 54.1″' },

  /** Apparent visual magnitude. Fourth-brightest of the seven sisters. */
  magnitude: 4.14,

  /** Blue-white subgiant, emission lines. This is where the accent colour
   *  comes from — the palette is not decorative, it is the star's spectrum. */
  spectralType: 'B6IVe',

  /** @unverified */
  distanceLightYears: 440,

  cluster: { messier: 'M45', name: 'The Pleiades' },
} as const;

/** The dust Merope is passing through — and the whole thesis of the studio. */
export const NEBULA = {
  ngc: 'NGC 1435',
  names: ["Tempel's Nebula", 'The Merope Nebula'],
  /** A knot of dust ~0.06 ly from the star, being shredded by its radiation
   *  pressure. The closest thing in the sky to a deadline. @unverified */
  knot: { designation: 'IC 349', name: "Barnard's Merope Nebula" },
  /**
   * The point: Merope did not create this nebula and does not own it. It is an
   * unrelated dust cloud the star happens to be drifting through, and the star's
   * light is the only reason anyone can see it.
   *
   * The studio is the star. The projects are what it makes visible.
   */
  thesis: 'The star is not the point. What it lights up is.',
} as const;

/** NASA Ames built a supercomputer named Merope out of a bigger one's leftovers. */
export const SUPERCOMPUTER = {
  operator: 'NASA Advanced Supercomputing (NAS), Ames Research Center',
  /** Assembled from decommissioned nodes of the Columbia system. @unverified */
  builtFrom: 'Columbia',
  thesis: 'Spare parts. Real work.',
} as const;

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
