---
name: Peace
summary: An expense tracker that keeps its mouth shut. Every record lives in one SQLite file on your phone — no account, no server, no sync, and nothing on the network unless you ask for it.
magnitude: 2
kind: app
firstLight: 2026-08-10
url: https://github.com/ahmedsaed/Peace/releases
repo: https://github.com/ahmedsaed/Peace
---

Peace is built around the month, and around the thing you do fifty times a
month: type an amount.

The pickers sit at the top of the record screen and a calculator keypad at the
bottom, so the bottom-right key walks the whole record — account, category,
save — and a coffee takes four taps with one thumb. `=` finishes a sum first if
you were still adding things up, and the key's label always says which of the
three it is about to do. It works in split-screen, with a bank notification open
beside it, because that is where records actually get logged.

Everything else exists to make the ledger tell the truth afterwards. Transfers
appear once instead of twice. A refund nets against the thing it reversed rather
than inflating both sides of the month. A credit card reads as money owed rather
than an emptied wallet. The percentages on the analysis ring add up to exactly 100. Search shows the total of every match, not of the rows that fit on screen.

## What it refuses to do

What an app declines is as much a description of it as what it ships.

- **No sync.** Sync means a server, an account, and a copy of your spending
  somewhere you do not control.
- **No budget carry-over.** An unspent limit rolling forward is a limit that
  gets easier every time you fail to use it. What carries between months is
  money, and the header does that instead.
- **No single cross-currency total.** Valuing a whole balance needs today's
  rate, and the only honest rates here belong to past records — each one stored
  against the record that used it, so a purchase made when the dollar was fifty
  pounds stays at fifty forever.
- **No settings that do nothing.** A control for a preference nothing reads is a
  switch that silently lies, so each row ships in the same change as the code
  that honours it.

The whole app makes four outbound calls and there are no others: an exchange
rate when you tap for one, a receipt or bank message sent to Gemini if you have
supplied your own key, Drive if you have connected it, and a once-a-day check
for a newer build. Two of the four are off until you switch them on.

It is an APK you sideload rather than a store listing, and that is the price of
reading bank alerts without asking Google's permission to keep the feature.
