# Project Vision — All About Cards FL

## Who this is for

Josh, owner of All About Cards FL LLC — a Florida trading-card business
dealing in Pokémon, One Piece, and other TCGs: buying collections, selling
online and at card shows, grading submissions, and consignments.

## The one-sentence vision

A single platform that runs the whole card business — inventory, purchases,
sales, consignments, pricing, ecommerce, and card-show checkout — wrapped in
a mobile experience so polished it feels like a top consumer collector app.

## The design bar

Josh's reference is **DeckTradr** (he provided ~20 screenshots and screen
recordings): dark theme, a Portfolio dashboard with a big total value and
green performance chart, Raw/Graded/Sealed counts, a Market tab, card
scanning with AI centering analysis, and buttery mobile navigation. His
words: it "needs to be flawless like that."

**Decision (Jul 2026):** build the business platform from the plan, but lead
with the DeckTradr-quality look — ship beautiful screens first, wire deeper
business features in behind them.

## What makes this different from a collector app

Under the hood this is a business system with rules a consumer app doesn't
have (from `AGENTS.md`):

- Inventory can never go negative; graded cards tracked individually.
- Purchase cost and financial history preserved forever; decimal-safe money.
- Consignment finances separated from company-owned inventory.
- Internal cost/profit never shown on public or collector-style pages.
- Database transactions for anything that changes inventory.

## Retail operations feature set (added Jul 2026)

The features below turn the platform from an inventory/collector app into a
working **store register**: employees running buys, sales, and trades at the
counter, everything they touch tracked to them, and every card flowing in and
out of inventory across all our sales channels at once. Guiding rule from
Josh: **one-step simple** — scan, scan, checkout, done. No menu digging.

### Feature A — Employee time clock and performance tracking

Purpose: know who's working and how each person is performing, without
turning the register into a second job.

Requirements:

- **Dead-simple clock in/out.** An employee clocks in, clocks out, and
  starts/ends breaks from the main register screen — ideally a 4-digit PIN
  or one tap, not a separate app or a buried menu. The current clocked-in
  employee is always visible on the register.
- **Automatic attribution.** Every buy, sale, and trade run through the card
  scanner is automatically tagged to whoever is clocked in at that register.
  The employee does nothing extra — the tag is invisible to their workflow.
- **Per-employee performance numbers.** The system tracks each employee's own
  totals: number of buys, sales, and trades; total cost paid out; and profit
  made on their transactions. These numbers are internal and role-gated (see
  Feature F) — an employee never sees a coworker's numbers.
- **Time records are permanent and auditable.** Clock events (in, out, break
  start/end) are stored with a timestamp and the register they happened at,
  and can't be silently edited — corrections are logged, not overwritten
  (same discipline as the existing inventory audit log).

### Feature B — Scan-to-checkout lot builder

Purpose: the fastest possible counter flow for selling cards.

Requirements:

- **Scan looks up two things at once.** When an employee scans a card, the
  system finds it in our inventory (is it in stock, where, what did we pay)
  **and** shows the current market price — side by side.
- **Back-to-back scans build a lot automatically.** Scanning a second card
  doesn't start over; it adds to a running item list with a live running
  total on screen. This is the "cart."
- **Immediate checkout.** The lot screen has a checkout button right there.
  Scan, scan, scan, checkout — one continuous flow, no navigating away.
- **Sales reduce inventory correctly.** Checkout writes a real sale, reduces
  inventory (never below zero), records which employee rang it, and kicks off
  multi-channel delisting (Feature E) for anything that's listed elsewhere.

### Feature C — Trade-in workflow

Purpose: handle the most complex counter interaction — a customer trading
cards in — as a guided, one-screen flow with the right money controls.

Requirements:

- **Scan each trade-in card, pick condition fast.** The employee scans each
  card the customer is trading in and taps a condition from quick preset
  buttons (e.g. NM / LP / MP / HP). The system auto-pulls the market price for
  that card and condition, using AI-assisted pricing where a clean lookup
  isn't available (clearly flagged as an estimate when it is).
- **The trade-in lot totals automatically.** As cards are added, a running
  trade-in value builds on screen.
- **Configurable payout percentages, cash vs. credit.** The store gives the
  customer a percentage of market value, and that percentage is a store
  default set in Settings — with **separate defaults for cash and for trade
  credit** (stores typically pay more in credit than cash). The employee can
  confirm or adjust the percentage on the spot within allowed limits.
- **Two clear offer buttons.** The screen shows a **CASH OFFER** button and a
  **TRADE OFFER** button, each displaying its actual dollar amount.
- **Manager approval over a threshold.** Any trade or buy offer whose total is
  **over $500 requires approval** from a manager, GM, or owner before it can
  be completed. Approval is quick — the manager enters their PIN at the
  register or approves from their own device. The **$500 threshold is
  configurable in Settings** so Josh can change it later. Every approval is
  logged: who requested, who approved, the amount, and the time.
- **Cash accepted → cash out.** The customer takes cash; the traded-in cards
  enter our inventory with their cost basis recorded (what we effectively paid
  per card), so profit tracking stays accurate.
- **Trade accepted → scan what they want, auto-calculate the difference.** The
  employee scans the cards the customer wants in return; the system compares
  the outgoing value against the trade credit and shows the difference — the
  customer owes us the balance, or we owe them remaining store credit.
- **Everything flows into inventory with cost basis.** Every card taken in on
  a trade lands in inventory with a recorded cost, so downstream profit
  numbers (Features A and F) are honest.

### Feature D — One-step multi-channel listing

Purpose: a card bought or scanned into inventory can be posted for sale
everywhere we sell, from one action.

Requirements:

- **List everywhere from one scan.** When cards are added to inventory, the
  system can post them for sale to: (1) our own app/storefront, (2) our
  TCGplayer store, (3) our eBay store, and (4) our company website.
- **Josh supplies the keys; we build the plumbing.** These platforms require
  seller API access that Josh applies for and provides. The build delivers a
  **Settings → Sales Channels** screen where Josh pastes in credentials for
  each channel, a **"Test connection"** button per channel to confirm it's
  hooked up, and an **individual on/off toggle per channel** so the system
  runs fine with only some channels connected.
- **A sync engine that never fails silently.** Listing to an outside channel
  can fail (network, rate limit, a rejected listing). Failed posts **retry
  automatically** with backoff, and anything still failing lands on a
  **"Needs attention"** list with a plain reason — nothing disappears
  quietly.

**What's real about these channels (researched Jul 2026 — read before
building):**

- **eBay — available.** eBay runs a public Developers Program. Josh registers
  an application, gets production keys, and the Sell/Inventory API lets us
  create and manage listings programmatically. Default limit is roughly 5,000
  calls/day per API (raisable via eBay's "Application Growth Check"), with
  additional short-window limits — so the sync engine must batch and pace its
  calls, not fire one request per card instantly.
- **TCGplayer — restricted.** eBay acquired TCGplayer (2022), and in late 2024
  TCGplayer **stopped accepting new API applications**; access is generally
  limited to existing key-holders and approved partners. Their model, when
  granted, uses a store-authorization workflow (public key + private key +
  a per-store access token) that can read and modify a store's pricing and
  inventory. **Plan for this reality:** build the TCGplayer integration
  function so it's ready the moment access is granted, **and** ship a
  **CSV bulk-upload fallback** (TCGplayer's seller portal accepts spreadsheet
  uploads) so the TCGplayer channel is usable even without direct API access.
- **Company website — depends on what it runs on.** If it's our own future
  storefront (roadmap phase below), we control it directly and no third-party
  key is needed. If it's a hosted platform (Shopify, Squarespace, BigCommerce,
  etc.), it needs that platform's own API and keys. **Open question for Josh:
  what does/will the website run on?**
- **Industry reality.** Multi-channel card selling is normally done through
  tools like BinderPOS, TCG Sync, or Crystal Commerce; the hard part is not
  posting a listing but keeping quantities honest across channels in near
  real time (see Feature E).

**API accesses Josh needs to apply for (plain list):**

1. **eBay Developers Program** account + a production app (keys/OAuth) →
   developer.ebay.com.
2. **TCGplayer API/partner access** → apply/request via TCGplayer; expect this
   to be gated, so the CSV fallback covers the gap.
3. **Website platform API** → only if the site runs on a third-party platform;
   none needed if it's our own storefront.

### Feature E — One-step multi-channel delisting

Purpose: when a card sells anywhere, it comes down everywhere else fast
enough that we don't sell the same card twice.

Requirements:

- **A sale on any channel updates all the others.** When a card sells in
  store, on TCGplayer, on eBay, or on the website, its quantity is reduced (or
  the listing removed) across every other connected channel automatically.
- **Fast enough to prevent oversell.** The sync must be near real time. Where
  a platform pushes us sale notifications (webhooks), we use them; where it
  doesn't, we poll frequently.
- **Handle the oversell race explicitly.** If two channels sell the last copy
  at nearly the same moment, the system must not pretend both are fine. The
  design: inventory is decremented against a single source of truth with a
  guard so it can't go negative; the second sale is flagged as an
  **oversell exception** on the "Needs attention" list with the affected
  order, so a human can refund/cancel or source another copy. Optional
  safeguard: a configurable "buffer" (hold the last N copies off outside
  channels) for high-value singles.

### Feature F — Owner and GM dashboards

Purpose: give the owner and general manager the whole-store view — people
and money — while keeping everyone else's view limited to their own work.

Requirements:

- **Team view.** Owner and GM can see all employee profiles: who's clocked in
  right now, hours worked, breaks taken, and each employee's buy/sell/trade
  performance numbers (from Feature A).
- **Owner money graph.** The owner dashboard shows a **triple line graph over
  time**: total inventory cost, current market value, and potential profit
  (the gap between the two lines).
- **Strict role gating.** This must fit the existing roles/permissions system.
  Regular employees **cannot** see each other's numbers or the owner graphs.
  Manager/GM/owner get approval rights for the Feature C over-$500 rule. The
  cost/profit-hiding rule from the design bar still holds: none of this
  internal money data ever appears on a customer- or collector-facing screen.

### Counter simplifications (approved Jul 2026)

Refinements approved by Josh to keep the counter flows one-step simple and
safe. These apply across Features A–C and the approval flow.

- **Quick "switch employee" PIN.** Hand the register to a coworker with a
  tap-and-PIN instead of a full clock-out/clock-in, so buys, sales, and trades
  stay tagged to the right person even when a register is shared.
- **Park & resume a lot.** Pause an in-progress lot (customer steps away, the
  phone rings) and pick it back up later without losing any scanned cards.
- **Void / undo last action, reason logged.** One tap to fix a mis-scan or
  cancel the last sale, instead of digging through menus. Every void records
  who did it and why (auditable, never silent).
- **Receipts.** Print a receipt for buys, trades, and sales, with an optional
  text/email copy. (Hardware note: needs a receipt printer at the register.)
- **Customer-facing view that hides cost/profit.** A "turn the screen around"
  mode that shows only the offer and totals — never our cost or margin — so a
  customer can look at the screen without seeing internal numbers.
- **Manager approval on their phone, with the cards shown.** The over-threshold
  approval request (Feature C) pings the manager's phone for a one-tap approve
  — **and the request itemizes the actual cards involved**: each card, its
  condition, and its value, clearly marked as coming **in** (buy/trade-in) or
  going **out** (sale/trade-out). The manager sees exactly what they're
  approving, not just a dollar total, and can approve or decline from their own
  device. The itemized list is kept with the approval log.
- **Don't-lose-work safety net.** If an employee forgets to clock out, the
  system auto-clocks them out at close and flags it (never silently inflates
  hours); and if the network drops mid-transaction, the sale/trade is queued
  locally and synced when the connection returns, so nothing at the counter is
  lost.

## Long-run roadmap (plain language)

Phases 0–3 are built and merged. Phase 4 (the mobile shell + Portfolio) is
largely built and lives in the open pull request awaiting merge. Everything
from here is sequenced so each phase stands on the one before it. Items
carried over from `PROGRESS.md` are folded in so this is the single roadmap.

**Done (merged to `main`):**

1. ~~Plan the system~~
2. ~~App skeleton: login, roles, security~~
3. ~~Inventory database: products, lots, purchases, costs~~

**Built, in the open PR (awaiting Josh's merge):**

4. Mobile app shell + Portfolio dashboard (DeckTradr-quality look).
5. Collection browsing and live card search (real Pokémon market prices).
6. Card detail page with real price range + link to full price history.
7. Responsive desktop layout; Miami Vice palette; layout made distinct from
   DeckTradr.
8. Real Google sign-in built (turns on once Josh finishes the one-time setup
   in `docs/SETUP_LOGIN.md`); automatic owner bootstrap.

**Next up — finish the foundation:**

9. Turn on real login for real (Josh's Google + database setup), then make
   the tools (search, scan, lookup) public and gate only the personal
   collection/portfolio behind login — the DeckTradr access model.
10. Live pricing gaps: interactive price-history chart (needs a real
    historical data source — pending Josh's TCGplayer API reply), and a
    pricing source for One Piece (no free/official one found yet).
11. Loose ends from `PROGRESS.md`: the "card back instead of front" image
    issue (pending a screenshot), automatic card recognition on scan (needs a
    licensed recognition service), scan → inventory saving.

**Retail operations (this new feature set) — sequenced to build safely:**

12. **Employee accounts + time clock (Feature A):** PIN-based clock in/out and
    per-employee attribution wired into the existing roles system. Foundation
    for everything else.
13. **Scan-to-checkout lot builder (Feature B):** the fast sell flow; real
    sales that reduce inventory and record the employee.
14. **Trade-in workflow (Feature C):** condition presets, configurable
    cash/credit percentages, the two-offer screen, manager approval over a
    configurable threshold, and cost-basis capture into inventory.
15. **Owner/GM dashboards (Feature F):** team view + the triple money graph,
    strictly role-gated. Builds directly on the numbers from 12–14.
16. **Multi-channel listing (Feature D):** the Sales Channels settings screen,
    per-channel test/toggle, eBay integration first (it's actually open),
    TCGplayer via CSV fallback until/unless API access is granted, website
    per its platform, plus the retrying sync engine.
17. **Multi-channel delisting + oversell handling (Feature E):** near-real-time
    quantity sync across channels with the oversell exception flow.

**Later:**

18. Consignment payouts; card-show point-of-sale polish.
19. Public storefront (Stripe-ready), PWA install.
