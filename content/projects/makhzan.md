---
name: makhzan
summary: The hardware store Egypt does not have. One place to find what a project needs — wood, metal, electronics, springs, pipe — assembled from the shops that already sell it.
magnitude: 5
kind: service
firstLight: 2026-07-15
url: https://makhzan.merope.dev
---

Egypt has no hardware store — not in the sense the phrase carries elsewhere, of
one building you drive to knowing that whatever the project needs, from timber
to terminal blocks, is somewhere inside it. What exists instead is specialists:
a shop for springs, a shop for pipe, a shop for connectors, each very good at one
aisle of a store that was never built. Finding a part means knowing which street
sells it, then a phone call to learn whether anyone on that street has it today.

makhzan is that store, assembled from the shops that already exist. It reads what
suppliers already publish, normalises it, and keeps it searchable in one place.
It is a directory rather than a marketplace — no cart, no payment, no delivery.
It tells you what exists and who has it, and then sends you to them.

## Where it is

The store is the claim; a narrow slice is what can actually be proved. So V1 is
electronics components in Greater Cairo, and the rest of the aisles come after
the first one works. The ingestion spine is built and running:
Shopify, WooCommerce and Odoo adapters behind a registry, resumable partition
sweeps, around 11,800 real listings from live Cairo suppliers, and part-number
aware search in both Arabic and English. There is a read-only API, a
server-rendered bilingual frontend, and a production deploy that re-scrapes
daily.

Still to come: canonicalising the same product across suppliers, a self-serve
portal so a shop can claim its own listings, and a freshness policy that decays
a price rather than pretending it is current.

## Being a good guest

A crawler that costs a supplier anything is a crawler that has misunderstood the
job — being listed is meant to send them buyers.

- **Public pages only.** The catalogue endpoints a shop already serves to any
  visitor. No accounts, no logins, nothing behind authentication, and nothing
  about a supplier's customers.
- **`robots.txt` is honoured,** fetched per host and obeyed.
- **`Crawl-delay` is a floor, not a target.** A site asking for twenty seconds
  gets twenty, and the default pause is already longer than most crawlers use.
- **One request at a time per shop,** at least fifteen seconds apart, with a full
  pass over a catalogue spread across about a week rather than run in one burst.
- **The crawler says who it is** in every request, and leaves an address to write
  to. Suppliers can ask us to slow down, change something, or stop.

The site is live and searchable in both languages. The code is not open yet.
