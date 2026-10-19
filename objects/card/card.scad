// The Merope business card — the sky theme, printed.
//
// One body, printed face up in three colours with two manual filament swaps:
// the card is the sky, everything raised off it is starlight, and the ring is
// the grease pencil. Heights are whole 0.2mm layers so each swap lands exactly
// on a layer boundary. See README.md for the slicer settings.
//
// Layout is here; data is in data.scad, which `pnpm card:data` generates.

include <data.scad>
use <fonts/Newsreader6pt-SemiBold.ttf>
use <fonts/IBMPlexMono-SemiBold.ttf>

/* [Card] */
W = 85;
H = 55;
CORNER = 3;
BASE = 1.6;    // sky — swap to the pale filament at this height
INK = 0.4;     // starlight — two layers; every one past the first adds wobble,
               // and one alone lets the dark card grey the white through it
PENCIL = 0.4;  // grease pencil — swap to red at BASE + INK

/* [Content] */
NAME = "Ahmed El-Baz";
TITLE = "SOFTWARE ENGINEER";
EMAIL = "CONTACT@MEROPE.DEV";

/* [Preview] */
// "all" for the preview; "sky", "ink" or "pencil" to export one colour.
PART = "all";

SERIF = "Newsreader 6pt:style=SemiBold";
MONO = "IBM Plex Mono:style=SemiBold";

MARGIN = 5;

// QR: 0.9mm modules — two nozzle widths and change, so every module, dark or
// light, prints as at least two lines. It is the largest size at which the
// patch, growing down and left from the corner, still clears MEROPE's label. Quiet zone is two modules rather than
// the spec's four; the dark card around it is not part of the code, but the
// patch's own pale border is, and two modules is what scanners actually need.
MODULE = 0.9;
QUIET = 2;
QR_N = len(QR);
QR_SIDE = (QR_N + 2 * QUIET) * MODULE;
QR_ORIGIN = [W - MARGIN - QR_SIDE, H - MARGIN - QR_SIDE];

RULE_Y = 15.5;
RULE = 0.6;

// The mark's ring is ~12 units across its 30-unit square; this puts it ~3.3mm
// out from Merope, clear of her disc and of Alcyone's.
RING_SCALE = 0.275;
RING_STROKE = 0.8;

$fn = 48;

// ---------------------------------------------------------------------------

module rounded(size, r) {
  offset(r) offset(-r) square(size);
}

module stroke(points, w) {
  for (i = [0 : len(points) - 2])
    hull() {
      translate(points[i]) circle(d = w, $fn = 16);
      translate(points[i + 1]) circle(d = w, $fn = 16);
    }
}

module mono(s, size, halign = "left") {
  // A hair of extra weight: Plex Mono's stems at this size are thinner than
  // one extrusion line, and the slicer would otherwise drop them.
  offset(delta = 0.07) text(s, size = size, font = MONO, halign = halign);
}

module qr_patch() {
  difference() {
    translate(QR_ORIGIN) rounded([QR_SIDE, QR_SIDE], 0.8);
    for (row = [0 : QR_N - 1], col = [0 : QR_N - 1])
      if (QR[row][col] == "1")
        translate(QR_ORIGIN + [(QUIET + col) * MODULE, (QR_N - 1 - row + QUIET) * MODULE])
          square(MODULE + 0.001);
  }
}

module ink() {
  for (s = STARS) translate([s[1], s[2]]) circle(r = s[3]);
  for (p = FIELD) translate(p) circle(r = FIELD_RADIUS, $fn = 16);

  // Free to run under the QR patch: its cap line sits below the patch's edge.
  translate([MEROPE[0] + 4.3, MEROPE[1] - 1.75]) mono("MEROPE", 3.2);

  translate([MARGIN, RULE_Y]) square([W - 2 * MARGIN, RULE]);

  translate([MARGIN, 8.4]) text(NAME, size = 4.6, font = SERIF);
  // The contact line drops into the bottom margin to buy its size: 2.5 is as
  // large as the title and the email go on one line and still read as two;
  // at 2.55 the gap closes to 2.4mm and they run together into one phrase.
  translate([MARGIN, 3.6]) mono(TITLE, 2.5);
  translate([W - MARGIN, 3.6]) mono(EMAIL, 2.5, halign = "right");

  qr_patch();
}

module pencil() {
  translate(MEROPE) scale(RING_SCALE) stroke(RING, RING_STROKE / RING_SCALE);
}

// ---------------------------------------------------------------------------

if (PART == "all" || PART == "sky")
  color("#0b1220") linear_extrude(BASE) rounded([W, H], CORNER);

if (PART == "all" || PART == "ink")
  color("#e9eef6") translate([0, 0, BASE]) linear_extrude(INK) difference() {
    ink();
    pencil();
  }

// The ring stands on the card rather than on the ink, so it starts at BASE in
// the pale filament and turns red for its top two layers.
if (PART == "all" || PART == "pencil")
  color("#bf3d27") translate([0, 0, BASE]) linear_extrude(INK + PENCIL) pencil();
