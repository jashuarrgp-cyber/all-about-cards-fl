# All About Cards FL

All About Cards FL LLC is a trading-card business focused on buying, selling, managing, and reporting on Pokémon and One Piece card products. The business needs a durable internal operating system that supports raw cards, graded cards, sealed products, customer relationships, consignments, card-show sales, ecommerce orders, pricing references, storage locations, imports, exports, and financial reporting.

## Project purpose

This repository will become the full-circle business platform for All About Cards FL LLC. The application is intended to centralize inventory, purchases, sales, orders, customer accounts, consignments, ecommerce workflows, mobile card-show checkout, storage tracking, pricing information, sales reporting, profit reporting, CSV imports and exports, and audit history.

## Current project status

The project is in **Phase 0: project planning**. The current repository contains planning documentation only. Application setup and application code have **not** been completed.

At this stage:

- The Next.js application has not been scaffolded.
- Major dependencies have not been installed.
- Authentication has not been implemented.
- Database migrations have not been created.
- Payments have not been implemented.
- The ecommerce storefront has not been built.
- Marketplace integrations have not been implemented.
- No credentials or secrets are stored in the repository.

## Planned technology stack

The planned technical direction is:

- Next.js App Router.
- React.
- Strict TypeScript.
- PostgreSQL.
- Prisma ORM.
- Zod validation.
- Tailwind CSS.
- Secure authentication.
- Server-enforced permissions.
- Stripe payment architecture.
- Progressive Web App support.
- Automated testing.
- Vercel-compatible deployment.

## MVP summary

The MVP will focus on a reliable internal operations platform before public ecommerce expansion. MVP scope includes product catalog foundations, company-owned inventory, individually tracked graded cards, quantity-based raw and sealed inventory, purchases and cost basis, sales and orders, customer records, storage locations, basic consignment tracking, CSV import/export workflows, audit history, and reporting for sales and profit.

Critical MVP rules include never allowing negative inventory, preserving purchase cost history after sales, ensuring each sale references the exact inventory item or quantity record, keeping consignment finances separate, using decimal-safe money handling, and requiring database transactions for inventory-changing operations.

## Development phases

1. **Phase 0: Planning** — Product, architecture, data, security, integration, roadmap, and decision documentation. No application code.
2. **Phase 1: Application foundation** — Scaffold the Next.js application, configure TypeScript, styling, linting, formatting, testing, and deployment foundations.
3. **Phase 2: Data foundation** — Introduce PostgreSQL, Prisma schema, migrations, seed strategy, validation, and transaction patterns.
4. **Phase 3: Internal inventory operations** — Build authenticated internal inventory, purchase, storage, audit, and reporting workflows.
5. **Phase 4: Sales, consignments, and card-show checkout** — Add order flows, mobile-first checkout, customer workflows, consignment settlement, and CSV exports.
6. **Phase 5: Ecommerce and payments** — Add public storefront, secure checkout, Stripe payment architecture, and idempotent webhook processing.
7. **Phase 6: Pricing and provider integrations** — Add provider interfaces, supported official APIs if available, manual pricing, and CSV fallbacks.

## Important constraints

The platform must never expose internal cost basis or profit data on public pages. It must not create unofficial scraping integrations, must not invent TCGplayer, eBay, or PSA API access, and must use provider interfaces with manual or CSV fallbacks until official access is confirmed.

## Phase 1 application foundation update

Phase 1 adds the technical foundation while preserving the Phase 0 product direction and constraints. The repository now includes a Next.js App Router application shell, strict TypeScript configuration, Tailwind CSS, Prisma/PostgreSQL configuration, Zod validation, Auth.js/NextAuth planning and adapters, ESLint, Prettier, Vitest, Playwright, and GitHub Actions CI.

### Phase 1 prerequisites and commands

- Supported Node.js version: Node.js 20.20.2 or newer; CI uses Node.js 22 LTS.
- Package manager: npm with `package-lock.json`.
- Local database: PostgreSQL 15+ using `DATABASE_URL` from `.env`.
- Install: `npm install`.
- Environment setup: `cp .env.example .env` and replace placeholder values with local development values.
- Development: `npm run dev`.
- Formatting: `npm run format` and `npm run format:check`.
- Linting: `npm run lint`.
- Type checking: `npm run typecheck`.
- Prisma: `npm run prisma:format`, `npm run prisma:validate`, `npm run prisma:generate`, and `npm run db:seed`.
- Tests: `npm test`, `npm run test:integration`, and `npm run test:e2e`.
- Build: `npm run build`.
- Dependency review: `npm run security:audit`.

### Phase 1 authentication and owner setup

Phase 1 selects NextAuth.js/Auth.js `next-auth@5.0.0-beta.31` with `@auth/prisma-adapter@2.10.0` for provider-based sign-in, database-backed sessions, App Router support, and server-side session retrieval. Protected routes must enforce permissions on the server.

To promote the first owner, configure an auth provider, sign in once with the intended owner account, seed roles and permissions with `npm run db:seed`, then run `INITIAL_OWNER_EMAIL="owner@example.test" INITIAL_OWNER_CONFIRMATION="PROMOTE_INITIAL_OWNER" npm run owner:bootstrap`. The script refuses to assign an initial owner when one already exists.

### Phase 1 limitations

Phase 1 does not implement inventory, purchases, sales, orders, customers, consignments, ecommerce checkout, Stripe processing, point-of-sale workflows, card-show event management, marketplace synchronization, price collection, real credentials, or real customer data.

## Phase 2 local PostgreSQL workflow

Start a nonproduction local database with `docker compose up -d postgres`, then set `DATABASE_URL=postgresql://aacfl:aacfl_local_only@localhost:5432/aacfl_dev?schema=public`. Apply migrations with `npm run prisma:migrate:deploy`, generate Prisma Client with `npm run prisma:generate`, and load synthetic idempotent seed data with `npm run db:seed`. Run database-backed integration tests against an isolated test database using `npm run test:integration`. Stop local PostgreSQL with `docker compose down`; add `-v` only when you intentionally want to delete local development data.

## Phase 3A: read-only internal catalog and inventory visibility

Phase 3A introduces an authenticated internal workspace at `/app` with read-only operational routes for `/app/catalog`, `/app/catalog/[productId]`, `/app/inventory`, `/app/inventory/lots/[lotId]`, and `/app/inventory/items/[itemId]`. The workspace provides mobile-friendly catalog search, inventory filters, bounded server-side pagination, dashboard counts, and stable UUID-based detail pages.

Cost protection is enforced in server-only Prisma query modules: users without `cost:read` do not select or receive acquisition cost, purchase cost, internal margin, or profit data. This phase remains read-only and does not add scanner, buying-lot, market pricing, Confirm Lot, labels, QR code, sales, ecommerce, payment, or POS features.

### Phase 3A automated test authentication

Automated component, route, and Playwright tests may use the fixed `aacfl_test_identity` cookie values `owner`, `employee`, or `vendor`. This test authentication path is guarded by `TEST_ENV=true`, refuses to activate when `NODE_ENV=production`, and does not accept arbitrary roles or user JSON from requests. Normal application pages still call the same server-side `requirePermission` checks before rendering protected catalog and inventory data.
