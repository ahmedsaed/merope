---
name: Lithophane Cube Maker
summary: Five photos in, a 3D-printable lithophane lamp out — four sides, a top, and the frame that holds them, built entirely in your browser and free down to the fifth panel.
magnitude: 4
kind: tool
firstLight: 2026-10-27
updated: 2026-11-05
url: https://lithophane-maker.merope.dev
repo: https://github.com/ahmedsaed/lithophane-maker
---

A lithophane is a picture made of thickness. Print a thin plate in white
plastic, thick where the photo is dark and thin where it is light, and it looks
like nothing at all until a light goes on behind it. Lithophane Cube Maker builds
a lamp out of five of them — four sides and a top — with a frame, a lid, and a
hole in the floor for the cable. You choose the photos and the size; it hands
back files ready to slice.

<figure>
  <img
    src="/files/printing-the-first-lithophane-cube/cube-lit.jpg"
    alt="A small cube lamp with an orange frame, lit from inside. A white lily glows on the top panel, the pyramids of Giza on the left side and a solar eclipse on the right."
    width="1440"
    height="1440"
  />
  <figcaption>The first cube, lit: a lily on top, Giza and an eclipse on the sides.</figcaption>
</figure>

The fifth panel is the reason it exists. The best-known lithophane box generator
stopped at four sides when this one was started, and the top it has added since
sits behind a payment. Here every panel is free, and so is everything else.

It was also the hardest part to design. A side panel slides down
grooves in the corner posts and is held on all four edges; a top panel has
nothing to slide into. It ended up the same square as the sides, resting on four
small supports at the inside corners, with the lid trapping it from above — five
identical panels, every face framed alike.

<figure>
  <img
    src="/files/lithophane-maker/parts.png"
    alt="The tool in the browser: five empty image slots and the cube settings on the left, and on the right a 3D preview pulled apart — the frame with its four corner posts, four side panels standing around it, and the lid floating above."
    width="1440"
    height="900"
  />
  <figcaption>The exploded preview: frame, posts, four sides and the lid.</figcaption>
</figure>

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

The first full cube is printed, assembled and lit. It nearly taught the wrong
lesson. The first panel bound in its groove and a lid peg snapped, so the
default fits were loosened and shipped the same day — and then the other four
panels slid in at the _original_ fit. The groove had never been the problem: the
brim leaves a ridge on a panel's bottom edge, and the posts lean slightly once
printed. The next release went back to the fits the test pieces chose, and put
deburring and squaring the posts into the assembly steps instead.
[Printing the first lithophane cube](/notes/printing-the-first-lithophane-cube)
tells the whole story.

The code is MIT-licensed, and a report of how a cube printed on your machine is
the most useful thing anyone can send back — the one thing the tests cannot
check.
