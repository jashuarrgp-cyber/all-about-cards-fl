# Progress Log

Newest first. Keep entries short and plain. Update at the end of every
working session.

## 2026-07-21 (later still) — Browse by Set added to live Search

- Extended the live pricing engine from last round: the Search tab now also
  lets you browse real Pokémon sets (official logo, series, release year,
  card count) and tap into one to see every card in that set with live
  prices — reuses the same search infrastructure, just filtered by set.
- Added `listPokemonSets()` to the pricing provider and a new public
  `/api/pricing/sets` route, mirroring the existing search route.
- Same honesty rules as before: real data only, graceful "couldn't load"
  messages on failure, no fake numbers.
- Verified: typecheck, lint, all 32 unit/integration tests (18 new: 8
  provider tests for sets + combined name/set queries, 1 new component
  test for the browse-and-select flow), production build, and a live
  browser check confirming the degrade path (this sandbox still can't
  reach the real internet) renders cleanly with no crash.

## 2026-07-21 (end of session) — Status wrap-up

**Finished today (all merged to `main` with Josh's approval):**

- PR #7 merged: mobile app shell, Portfolio dashboard, Collection tab,
  project memory files.
- PR #8 merged: card scan flow + AI Centering (details in the entry below).
  CI was green (full suite including database integration tests) before
  merging.

**Unfinished / not started:**

- Live market pricing — every dollar figure in the app is still a labeled
  sample. Needs a licensed pricing source (no scraping).
- Automatic card recognition — the scan flow works but identification is
  tap-to-match; a licensed recognition service plugs into the same flow.
- Scan → inventory saving — scan sessions are session-only; writing them
  into real inventory (with cost basis and locations) is the receiving
  phase.
- Market tab, Search tab, Social tab, Profile tab — polished "coming soon"
  placeholders only.
- Sales / card-show POS, consignment payouts, storefront/Stripe, PWA.

**Known problems / gotchas for the next session:**

- Mid-session, this environment's GitHub _write_ access went stale (reads
  worked, pushes/API writes returned 403). It recovered on its own after
  ~30 minutes. If it happens again: keep the work committed locally, retry
  periodically, and export a `git format-patch` backup for Josh.
- After a squash-merge, the working branch MUST be restarted from
  `origin/main` (`git checkout -B claude/all-about-cards-sync-yhsp8x
origin/main`). Reusing the old branch history makes GitHub report merge
  conflicts and silently blocks CI from starting on the PR.
- Commits must be signed (repo config is already set up: SSH signing key +
  `commit.gpgsign=true`) and authored as Claude <noreply@anthropic.com>,
  or a stop-hook flags them and GitHub shows them Unverified.
- The database is not reachable in these sandboxes and the network policy
  blocks pulling the postgres Docker image — DB tests only run in CI.

**Suggested next session:** ask Josh to pick between (1) live market
pricing, (2) scan → inventory saving, or (3) the Market tab. Read
CLAUDE.md first; verify visually; never merge without Josh's approval.

## 2026-07-21 (later) — Card scanner + AI Centering

- Merged PR #7 with Josh's approval (mobile shell, Portfolio, Collection).
- Later merged as PR #8 after CI went green.
- Built **AI Centering**: camera capture or photo upload, on-device border
  detection (outer card edge + inner printed frame), grader-style L/R and
  T/B splits, manual fine-tuning of all 8 lines (drag or arrows), and an
  approximate grade readout (labeled approximate). Photos never leave the
  device. Detection math is unit-tested against synthetic card images.
- Built the **card scan flow**: camera view with capture frame, tap-to-match
  card identification against a sample catalog with sample prices (labeled),
  quantity steppers, running market total, and a Review Scans screen.
  Automatic recognition needs a licensed recognition/pricing service — it
  plugs into this same flow in a later phase. Scan sessions are not yet
  written to inventory (that lands with the receiving phase).
- Security: Permissions-Policy now allows the camera for this origin only
  (mic and location remain blocked); strict image CSP kept intact.
- Collection screen gained a Scan button; scan lives under the Collection
  tab. New previews: `/preview/ai-centering`, `/preview/scan`.

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
