# Roadmap

## Phase 0: Project planning

- Create product, MVP, architecture, database, security, integration, roadmap, and decision documentation.
- Document constraints and business-critical rules.
- Do not build application code.

## Phase 1: Application foundation

- Scaffold Next.js App Router application.
- Configure React, strict TypeScript, Tailwind CSS, linting, formatting, and tests.
- Establish Vercel-compatible deployment settings.

## Phase 2: Data foundation

- Add PostgreSQL and Prisma.
- Create schema and migrations.
- Add Zod validation patterns.
- Establish transaction and decimal-safe money conventions.

## Phase 3: Internal inventory operations

- Build secure internal inventory workflows.
- Add purchases, cost basis, storage locations, and audit history.
- Prevent negative inventory.

## Phase 4: Sales, consignments, and mobile checkout

- Add orders, customers, sales allocation, consignment settlement, and mobile card-show checkout.
- Optimize for iPhone use.

## Phase 5: Ecommerce and payments

- Build public storefront and customer account flows.
- Add Stripe payment architecture and idempotent webhook processing.

## Phase 6: Pricing and provider integrations

- Add provider interfaces where official access exists.
- Maintain manual and CSV fallbacks.
- Expand reporting and automation.

## Phase 1 status

Phase 1 adds the application foundation. Later phases remain responsible for data/business foundations, internal inventory operations, sales, consignments, card-show checkout, ecommerce, payments, pricing, and provider integrations.
