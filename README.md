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
