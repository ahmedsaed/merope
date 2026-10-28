---
name: Lithophane Cube Maker
summary: Five photos in, a 3D-printable lithophane lamp out — four sides, a top, and the frame that holds them, built entirely in your browser and free down to the fifth panel.
magnitude: 4
kind: tool
firstLight: 2026-10-27
url: https://lithophane-maker.merope.dev
repo: https://github.com/ahmedsaed/lithophane-maker
---

A lithophane is a picture made of thickness. Print a thin plate in white
plastic, thick where the photo is dark and thin where it is light, and it looks
like nothing at all until a light goes on behind it. Lithophane Cube Maker builds
a lamp out of five of them — four sides and a top — with a frame, a lid, and a
hole in the floor for the cable. You choose the photos and the size; it hands
back files ready to slice.

The fifth panel is the reason it exists. The best-known lithophane box generator
stopped at four sides when this one was started, and the top it has added since
sits behind a payment. Here every panel is free, and so is everything else.

## Most of the work went into not wasting a print

A cube takes most of a day to print, and a second attempt costs another day and
another spool. That cost shaped the tool more than any feature did.

- **Test pieces before the cube.** The fits that depend on your printer — how a
  panel slides into its groove, how firmly the lid grips the posts — are cut
  out of the real parts as small pieces, five sizes side by side on one plate.
  An hour of printing answers what a failed cube would have.
- **Nothing that cannot be printed.** An earlier lid clicked shut on ridges a
  tenth of a millimetre tall. Slicers dropped them or drew them as a single
  line. The lid now holds on with printed pegs, or with magnets if you would
  rather glue them in.
- **A setting that breaks the cube says so.** A wall too thin to print, or two
  parts asked to occupy the same space, is flagged before you export. Behind
  that, the tests build the whole cube for random combinations of every
  setting — thousands of them before a release — and fail on any part that
  comes out leaking, overlapping, or impossible to assemble.
- **Panels print standing up.** Lying flat, thickness can only change a whole
  layer at a time and gradients come out banded; standing, it comes from the
  nozzle's much finer sideways steps. The files are exported upright, so this
  happens without anyone having to know it.

## Your photos stay with you

Reading the image, building the geometry and writing the files all happen in
the browser. There is no server to send a photo to — which matters for an
object people mostly make out of family pictures.

## Where it is

The geometry is tested, and the fits that depend on the printer — how a panel
slides into its groove, how firmly the lid grips — were dialled in with test
prints. The first full cube has been printed and assembled at those fits. What
it took was not looser numbers but care at the bench: deburring the edge a brim
leaves behind, and pressing the lid on straight. The code is MIT-licensed, and a
report of how a cube printed on your machine is the most useful thing anyone can
send back.
