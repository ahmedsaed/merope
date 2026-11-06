---
name: Pleione
summary: An IPTV player for LG and Samsung TVs. Your own playlists and accounts, a real programme guide, and every screen laid out for a remote with four arrows on it.
magnitude: 3
kind: app
firstLight: 2026-11-01
updated: 2026-11-05
url: https://pleione.merope.dev
repo: https://github.com/ahmedsaed/pleione
---

A television is the one computer in the house nobody wants to type on, and the
apps written for it mostly forget that. Pleione plays the IPTV service you
already have — live channels with a programme guide and catch-up, movies and
series — on an LG or Samsung TV, and it is built around the fact that the only
input device in the room is a remote.

It brings no channels of its own. You add an M3U playlist or an Xtream account
from your own provider, several if you have them, and Pleione does the rest:
finds the guide, sorts the catalogue, and remembers where you stopped, down to
which audio and subtitle track you chose on each channel and each title.

<figure>
  <img
    src="/files/pleione/guide.png"
    alt="The programme guide: a column of channel groups on the left, nine channels down the middle, and a grid of programmes across the next two hours, with a line marking the current time and the focused programme outlined."
    width="1440"
    height="810"
  />
  <figcaption>The guide, driven entirely from the D-pad.</figcaption>
</figure>

## The oldest TV sets the rules

Pleione runs on LG sets from webOS 4, which shipped in 2018, and on Samsung sets
from 2020. The browser inside a 2018 LG is Chromium 53, and that one number
decides more of the code than any feature does.

- **A modern API does not fail on an old TV. It quietly does nothing.** So the
  build targets Chromium 53, a lint gate rejects anything newer, and every
  fallback is chosen by measuring the engine at boot rather than by guessing
  from the model year.
- **Chromium 53 throws away a whole CSS rule over one selector it does not
  know.** Put `:focus-within` beside an old selector and both stop styling
  anything. A lint rule now keeps the two in separate rules, because the
  failure has no error message — the screen just looks wrong on one TV.
- **On the oldest sets, the service bundled with the app runs on Node 0.12.**
  TypeScript compiles it down to ES5, and a second gate scans the output for
  anything that would not load there.

Playlists also get large, and a TV is not a fast computer. The benchmarks run
the views against fifty thousand channels on a CPU throttled four times, stream a 128 MiB playlist through the parser, and fail when a key
press gets slower than the baseline allows.

## Typing on a remote is the problem, so don't

Entering an account with arrow keys — a server address, a username, a password
with symbols in it — is where most people give up on a TV app. Pleione puts a
QR code on screen instead. Scan it, type the pairing code, and fill in the
details on your phone. The upload happens over your home network, only while
Pleione is open, and a TV browser cannot listen on the network at all, so a
small service is bundled with the app to do it.

## The TV's own player, on purpose

The obvious way to play a stream in a browser is to parse it in JavaScript and
feed the decoder yourself. On the content the app plays today, that measured
better: correct audio tracks, exact subtitle timing, and six hundred fewer lines
of code. Pleione plays through the TV's native pipeline anyway, because native
is the only path that decodes 4K Dolby Vision with Atmos. A player that does
better on today's streams and cannot play the best one your provider sends is
the wrong trade.

The cost is written down beside the decision, measured on real hardware rather
than assumed. On the native path the app rebuilds subtitle timing itself. And a
stream with two audio tracks in the same language — the main mix and an audio
description, say — shows only one of them, because of a bug in the TV's media
framework that was fixed upstream in a version webOS does not ship. That one
cannot be worked around from an app, so it is documented rather than hidden.

<figure>
  <img
    src="/files/pleione/live.png"
    alt="The live channel list: groups on the left, channels with their current programme and progress in the middle, and a live preview of the selected channel on the right with what is on now and what is up next."
    width="1440"
    height="810"
  />
  <figcaption>Live, with the channel playing beside the list.</figcaption>
</figure>

## Arabic, properly

There are twelve languages, and Arabic mirrors the whole layout rather than just
the text. The build writes a mirrored copy of every stylesheet instead of
layering `[dir="rtl"]` overrides on top: an override outranks every rule it does
not restate, so its cascade can never quite match the left-to-right one. Search
is Arabic-aware too, matching across the spellings people actually type —
hamza, final letters, diacritics, and digits in either script.

## What it will not do

- **No account, no analytics, no ads.** Your sources and history stay on the TV,
  and Pleione talks only to your own providers and the optional services you
  switch on.
- **No recording.** webOS gives apps no way to save a stream to storage. A
  server-side recorder is the honest answer, so the documentation points there.
- **No multiview, and no playback speed.** The TV allows one active video at a
  time, and its native streaming pipeline ignores speed changes. A control that
  does nothing would be worse than no control.

Pleione is free and open source under Apache-2.0. It began as a fork of
[webOS IPTV Player](https://github.com/lennylxx/webos-iptv-player) by lennylxx,
and the credit travels inside every build.

The name is one of the cluster's two parents. Pleione and Atlas make up the
eastern edge of the Pleiades — in the asterism, but not among the seven
sisters.
