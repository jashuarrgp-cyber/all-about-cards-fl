# Decisions

## 2026-07-16: Phase 0 is documentation only

Decision: Phase 0 will create planning documents without scaffolding the application, installing major dependencies, implementing authentication, creating database migrations, implementing payments, building the storefront, adding credentials, or implementing marketplace integrations.

Rationale: The business rules and data model are critical enough to define before application code is introduced.

## 2026-07-16: PostgreSQL and Prisma are the planned data foundation

Decision: PostgreSQL will be the system of record, and Prisma ORM is the planned database access and migration layer.

Rationale: The application requires relational integrity, transactions, durable cost history, auditability, and type-safe access patterns.

## 2026-07-16: Inventory operations must be transaction-protected

Decision: Any operation that changes inventory, sales allocation, purchases, consignment settlement, payment state, or storage movement must use database transactions in implementation phases.

Rationale: Negative inventory, mismatched sale allocation, or lost cost history would directly harm business operations.

## 2026-07-16: Integrations require official access or fallbacks

Decision: The project will not implement unofficial scraping or assume TCGplayer, eBay, PSA, or other provider API access. Provider interfaces, manual entry, and CSV fallbacks will be planned instead.

Rationale: This avoids brittle or non-compliant integrations and allows implementation to proceed without invented credentials or unsupported access.

## Phase 1 foundation decisions

- Use Next.js App Router, React, strict TypeScript, Tailwind CSS, npm, Node.js 20.20.2+ locally, and Node.js 22 LTS in CI for the application foundation.
- Use Prisma with PostgreSQL and UUID identifiers for identity, access-control, and audit records.
- Select NextAuth.js/Auth.js `next-auth@5.0.0-beta.31` with `@auth/prisma-adapter@2.10.0` for App Router compatibility, provider-based authentication, database sessions, and future MFA extensibility. Alternatives considered include custom credentials auth, Clerk, Auth0, and Supabase Auth.
- Use centralized role and permission definitions plus server-side authorization helpers rather than scattered role-name comparisons.
- Use Zod for environment, authentication-related, and owner-bootstrap validation.
- Use structured logging with sensitive-field redaction.
- Keep Phase 2 business workflows out of Phase 1.

## 2026-07-21: Live pricing uses the Pokémon TCG API

Decision: The Search tab's live pricing uses the free, public, official
Pokémon TCG API (pokemontcg.io), which republishes TCGplayer market prices.
No API key is required for normal use; an optional key raises the rate
limit. The provider call happens server-side (`src/lib/pricing/`) behind a
public read-only route (`/api/pricing/search`) that returns only public card
names and public market prices — never cost or profit. Pokémon is the only
game covered for now; no equivalent free/official source was identified for
the other games in the catalog.

Rationale: Matches `docs/INTEGRATIONS.md` — official access, no scraping, no
invented TCGplayer/eBay/PSA credentials. The provider degrades gracefully
(returns `ok: false` with a short user-safe reason) on timeout, HTTP error,
or network failure, the same defensive pattern already used for database
queries, so the UI never fakes a price.

## Phase 2 decisions

- Use PostgreSQL as the only supported database for development, CI, and tests; SQLite is not used as a fallback.
- Store cost basis and currency directly on inventory records so historical financial data survives catalog edits.
- Keep movement history append-only and use restrictive foreign keys for inventory, purchase, and ledger records.
- Use `Decimal(18,4)` for acquisition unit costs and `Decimal(18,2)` for purchase totals.
- Defer sales orders, POS, ecommerce, settlements, scraping, pricing APIs, and marketplace integrations to later phases.
