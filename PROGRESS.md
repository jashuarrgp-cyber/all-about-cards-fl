# Progress Log

Newest first. Keep entries short and plain. Update at the end of every
working session.

## 2026-07-21 — Collection tab + project memory files

- Added `CLAUDE.md`, `PROJECT_VISION.md`, `PROGRESS.md` (this file) so new
  sessions start with full context.
- Built the **Collection tab**: browsable grid of inventory (raw, graded,
  sealed) with search box and filter chips. Reads live inventory from the
  database when connected; otherwise shows clearly-labeled sample cards.
  No cost/profit shown.
- Added `/preview/collection` (no login, sample data) for design review.
- Opened a pull request from `claude/all-about-cards-sync-yhsp8x` into
  `main` covering the mobile shell, Portfolio dashboard, and Collection tab.
  **Waiting on Josh's approval to merge.**

## 2026-07-20 — Mobile shell + Portfolio dashboard (pushed)

- Direction decision by Josh: keep the business plan, but lead with a
  DeckTradr-quality mobile look ("Both, DeckTradr look first").
- Closed the two competing Codex "Phase 3" PRs (#5, #6) per Josh — starting
  Phase 3 fresh instead.
- Built the mobile app shell: bottom tabs (Search, Collection, Portfolio,
  Social, Profile), top tabs (Portfolio, Market, AI Centering).
- Built the Portfolio dashboard: total value, gain %, interactive 1W–All
  chart, Raw/Graded/Sealed counts, Most Valuable rail, Breakdown donut.
  Counts read live inventory when the DB is reachable; dollar values are
  labeled samples until live pricing exists.
- Verified: typecheck, lint, unit tests, production build, and phone-size
  browser screenshots. Pushed to `claude/all-about-cards-sync-yhsp8x`.

## Earlier (merged to `main` before this log existed)

- **Phase 2** — inventory & cost-basis database: catalog products, quantity
  lots, individual (graded) items, purchases, storage locations, movements,
  consignors, audit log. (PR #4)
- **Phase 1** — Next.js app skeleton: auth, roles/permissions, Prisma, CI,
  tests, security headers. (PR #2)
- **Phase 0** — planning docs in `README.md`, `AGENTS.md`, `docs/`. (PR #1)

## Not started yet

- Live market pricing (needs a legitimate data source — no scraping).
- Sales / card-show point-of-sale / consignment payouts.
- Card scanning + AI centering flow.
- Public storefront and Stripe.
