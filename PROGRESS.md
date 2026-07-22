# Progress Log

Newest first. Keep entries short and plain. Update at the end of every
working session.

## 2026-07-21 (end of session) — Card detail page, real desktop layout, new colors, and moving away from DeckTradr's look

Everything below is in one open pull request, **PR #12**, not yet merged —
still waiting on Josh to say "merge." CI (typecheck, lint, all tests,
security audit, production build) and Vercel are both green on the latest
commit.

**Finished today:**

- **Tap a card → detail page → Add to Collection.** Search results are now
  tappable. The detail page shows the full-size image, set/number/rarity,
  live price, and — if you're logged in — a real "Add to Collection" form
  (quantity + optional cost) that writes a real inventory record through
  the same audited path the rest of inventory already uses. The public,
  no-login preview page doesn't get the Add button, on purpose.
- **Real price range + link to full history.** Added the card's real
  low/high price band next to the market price, plus a real link out to
  that exact card's TCGplayer page for full price history and recent
  sales. We don't have a licensed source for historical price charts
  ourselves, so rather than fake one, we link to the real thing. Josh is
  waiting to hear back from TCGplayer about API access — once that's in,
  we can revisit building our own chart.
- **A real desktop layout.** Until today the whole app was a phone-width
  column even in a full browser window. Now there's a proper computer
  layout — a left sidebar for navigation, a wider content area — while
  the phone experience (bottom tabs) is unchanged. Same features, same
  data, either way.
- **New color scheme — "Miami Vice."** Josh asked for a South
  Beach/Miami Vice feel. Swapped the app's accent color from teal to hot
  pink and the background from plain near-black to a deep purple-black,
  kept green/red for portfolio gains/losses (that convention is too
  useful to break). One central place controls this (`tailwind.config.ts`),
  so it was a low-risk change even though it touches how the whole app
  looks.
- **Rearranged the layout so it isn't a look-alike of DeckTradr.** Josh
  raised a fair concern: we'd been building screens by directly copying
  the arrangement of DeckTradr's own screenshots (image-then-price on the
  card page, a top nav bar on desktop), and that's a real look-alike risk
  worth avoiding, separate from just picking different colors. Kept every
  feature and every piece of data, but changed the arrangement: the card
  page now leads with name + price (price in its own glowing pink card
  with pill-shaped low/high badges) with the image moved lower and to the
  side; the desktop nav became a left sidebar instead of a top bar; the
  Portfolio screen's stat counts became pill chips instead of a boxed
  grid, and "Most Valuable" became a list instead of horizontal-scrolling
  cards. I'm not a lawyer and this isn't legal advice — just a genuine
  effort to make the design our own rather than a close copy.
- **Fixed a flaky test in CI.** Two integration test files were both
  wiping the same shared database tables and racing each other when
  Vitest ran them in parallel — passed in one CI step, failed in another,
  same run, same commit. Forced test files to run one at a time so this
  can't happen again for any future test file either.
- **Fixed a real security warning.** `npm audit` flagged a high-severity
  vulnerability in `sharp` (an image library Next.js uses internally,
  unrelated to anything we wrote). Patched it with a version override
  without touching Next.js itself; verified 0 vulnerabilities afterward.

**Still open / not started:**

- Interactive price history chart (the "drag your finger and the price
  updates" idea) — needs real historical price data we don't have yet.
  Waiting on Josh hearing back from TCGplayer about their API before
  deciding how to build this honestly.
- One Piece cards can already live in real inventory/collection, but
  Search still has no live pricing source for them — only Pokémon is
  wired up (no free/official source found yet for One Piece).
- Card images sometimes showing the card back instead of the front —
  still open, waiting on a screenshot from Josh to diagnose properly
  rather than guessing.
- Everything from the prior "Unfinished / not started" list below is
  still unfinished: automatic card recognition, scan → inventory saving,
  Market/Social/Profile tabs, sales/POS, consignment payouts,
  storefront/Stripe, PWA.

**Known problems / gotchas for the next session:**

- All the standing gotchas from the entry below still apply (branch
  restart after a squash-merge, signed commits, no local database/no
  Docker in this sandbox — DB tests only run in CI).
- The Miami Vice colors and the rearranged layout are both first passes
  Josh reacted to positively in chat, but hasn't seen live and clicked
  through yet — worth a proper look together next session before
  considering either "final."

**Suggested next session:** get Josh's "merge" on PR #12, then pick
between (1) hearing back from TCGplayer and building real price history,
(2) a live pricing source for One Piece, or (3) scan → inventory saving.

## 2026-07-21 (live-testing round) — First real Vercel deploy + fixes from Josh's live feedback

Josh got the app deployed to Vercel for the first time and tested it live —
this is the first round of feedback from real usage instead of my own
verification inside this sandbox (which has no internet access).

- **Fixed the Vercel build crash.** Root cause: nothing told a fresh
  `npm install` to regenerate the Prisma Client, so Vercel's clean install
  never had one. Added a `postinstall` script. Verified by reproducing the
  exact failure locally (deleted the generated client, fresh install with
  zero env vars, confirmed the build then succeeds) and confirmed for real
  on Vercel's own infrastructure once pushed — build went from failing to
  "Ready."
- **Cleared up a repo mix-up.** Josh's earlier deploy was pointed at a
  different, nearly-empty GitHub repo (`all-about-cards-fl-v2`, one commit,
  a completely different older codebase) — not this one. All of today's
  work is verifiably in `all-about-cards-fl` (checked directly). Flagging
  here in case it comes up again.
- **Fixed missing prices on some real cards.** My variant-name list for
  picking a card's price was guessed from memory (never checked against a
  real response, since this sandbox can't reach the internet) and missed
  older/historical print-variant names. Now falls back to any priced
  variant instead of only a fixed list.
- **Made card images fail gracefully.** If an image URL doesn't load, it
  now falls back to the placeholder box instead of leaving a blank gap.
- **Added tapping a card → detail view → Add to Collection**, per Josh's
  request. Tap any search result to see a full detail screen (bigger
  image, set/series/number/rarity, price). On the real authenticated
  `/app/search` page, a "Add to Collection" section lets you set a
  quantity and optionally enter what you paid, then writes a real
  inventory record — reusing the same audited `receiveQuantityInventory()`
  path the rest of the inventory system already uses, not a separate
  ad-hoc write. Cost is never guessed from the market price — left blank
  it's stored as $0, clearly editable later, never silently invented.
  The public `/preview/search` page intentionally does not get this
  button — no login there, so no write access.
- Open question: Josh reported some card images showing the card back
  instead of the front artwork. Waiting on a screenshot to diagnose —
  didn't want to guess-fix something that might be a data quirk in the
  source rather than a bug in this code.
- Verified: typecheck, lint, 39 unit/integration tests (3 new provider
  tests, 3 new component tests for the detail/add flow, plus a new
  DB-backed integration test suite for the write path that runs in CI —
  no database reachable in this sandbox to run it here), production
  build, and a real-browser check of the actual built app using request
  interception to feed it realistic data (confirmed the Add to Collection
  section correctly does NOT appear on the public preview).

## 2026-07-21 (later still) — Made sure live prices actually stay live

Josh asked "make sure the prices update." Checked for anything that could
cause a stale/cached price to stick around instead of refreshing:

- Both pricing API routes (`/api/pricing/search`, `/api/pricing/sets`) now
  explicitly set `export const dynamic = 'force-dynamic'` and send
  `Cache-Control: no-store`, so they can never be served from Next's route
  cache, a browser cache, or a proxy in between.
- The server-side call to the real Pokémon TCG API now passes
  `cache: 'no-store'` explicitly, so Next's fetch layer never reuses an old
  response either.
- The browser-side fetch calls in the Search screen also pass
  `cache: 'no-store'`, belt-and-suspenders.
- Added tests that actually check this (not just comments claiming it):
  route tests confirming the `force-dynamic` export and the response
  header, provider tests confirming the outbound fetch options. Also ran
  the real built server and read the real HTTP response headers back to
  confirm `cache-control: no-store` is actually sent.
- Worth knowing: this guarantees every search fetches fresh from the
  Pokémon TCG API — but that service's own prices are a third-party
  aggregate of TCGplayer market data, which isn't updated tick-by-tick.
  Searching the same card twice in a row showing the same number is
  expected, not a bug — it means nothing changed upstream yet.

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
