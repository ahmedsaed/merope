import { PLEIADES, type PleiadesStar } from './merope';

/**
 * Turning sky coordinates into screen coordinates.
 *
 * Pure functions, no React, no DOM — so the projection can be unit-tested
 * against known geometry rather than eyeballed in a screenshot. Everything here
 * runs at build time.
 */

/** Sexagesimal right ascension to decimal hours. */
export function raToHours(ra: { h: number; m: number; s: number }): number {
  return ra.h + ra.m / 60 + ra.s / 3600;
}

/** Sexagesimal declination to decimal degrees. Northern hemisphere only, which
 *  is all the Pleiades needs — Merope sits at +24°. */
export function decToDegrees(dec: { d: number; m: number; s: number }): number {
  return dec.d + dec.m / 60 + dec.s / 3600;
}

export type Projected = {
  star: PleiadesStar;
  /** 0..1 across the field, left to right as it appears in the sky. */
  x: number;
  /** 0..1 down the field. */
  y: number;
  /** 0..1, where 1 is the brightest star in the set. */
  brightness: number;
};

/**
 * Flat tangent-plane projection.
 *
 * The Pleiades spans about a degree, so the error from ignoring the sphere is
 * far below a pixel and a gnomonic projection would be false precision. The one
 * thing that genuinely matters is the `cos(dec)` term: a degree of right
 * ascension is narrower than a degree of declination at +24°, and dropping it
 * stretches the cluster sideways by about 9% — visible, and wrong.
 *
 * East is left. Sky charts are drawn as seen looking up, not as a map.
 */
export function projectCluster(
  stars: readonly PleiadesStar[] = PLEIADES,
  { padding = 0.12 }: { padding?: number } = {},
): Projected[] {
  if (stars.length === 0) return [];

  const points = stars.map((star) => ({
    star,
    raHours: raToHours(star.ra),
    decDeg: decToDegrees(star.dec),
  }));

  const decCentre = points.reduce((sum, p) => sum + p.decDeg, 0) / points.length;
  const cosDec = Math.cos((decCentre * Math.PI) / 180);
  const raCentreHours = points.reduce((sum, p) => sum + p.raHours, 0) / points.length;

  // Degrees on the sky, relative to the field centre. Negated so east falls left.
  const offsets = points.map((p) => ({
    star: p.star,
    dx: -(p.raHours - raCentreHours) * 15 * cosDec,
    dy: -(p.decDeg - decCentre), // screen y grows downward, declination grows up
  }));

  const xs = offsets.map((o) => o.dx);
  const ys = offsets.map((o) => o.dy);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  // One scale for both axes, or the cluster's real shape is lost.
  const span = Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY) || 1;
  const usable = 1 - padding * 2;

  const magnitudes = stars.map((s) => s.magnitude);
  const brightest = Math.min(...magnitudes);
  const faintest = Math.max(...magnitudes);
  const magRange = faintest - brightest || 1;

  return offsets.map(({ star, dx, dy }) => ({
    star,
    x: padding + ((dx - minX) / span) * usable,
    y: padding + ((dy - minY) / span) * usable,
    // Magnitude is already logarithmic, so a linear ramp across it reads as an
    // even progression. See the note on --mag-* in tokens.css.
    brightness: 1 - (star.magnitude - brightest) / magRange,
  }));
}

/**
 * Dot radius for a star, in the same units as the caller's viewBox.
 *
 * Not physically proportional: true flux would make Alcyone roughly 13x
 * Celaeno's area and the faint members would vanish. This compresses the range
 * so every member stays visible while the ordering stays honest.
 */
export function radiusForMagnitude(magnitude: number, base: number): number {
  const scaled = base * (1.15 - (magnitude - 2.8) * 0.11);
  return Math.max(base * 0.42, scaled);
}
