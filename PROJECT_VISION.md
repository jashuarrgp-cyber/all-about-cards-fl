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

## Long-run roadmap (plain language)

1. ~~Plan the system~~ (done)
2. ~~App skeleton: login, roles, security~~ (done)
3. ~~Inventory database: products, lots, purchases, costs~~ (done)
4. **Beautiful mobile app shell + Portfolio dashboard** (current)
5. Collection browsing; catalog search
6. Live market pricing (legitimate data sources only — no scraping)
7. Sales, point-of-sale for card shows, consignment payouts
8. Card scanning / AI centering
9. Public storefront (Stripe-ready), PWA install
