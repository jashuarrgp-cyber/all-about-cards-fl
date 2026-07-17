# Product Requirements

## Objective

Build a business operating platform for All About Cards FL LLC that manages Pokémon and One Piece products across inventory, purchasing, sales, customer, consignment, ecommerce, card-show, storage, pricing, reporting, import/export, and audit workflows.

## Users

- Owner/operator: needs full operational and financial visibility.
- Staff: needs permissioned inventory, checkout, and customer workflows.
- Consignor: may need future visibility into consigned items and settlements.
- Customer: may use future ecommerce account and order workflows.

## Core capabilities

- Product catalog for Pokémon and One Piece cards, sealed products, and related TCG items.
- Raw-card and sealed-product inventory tracked by quantity records.
- Graded-card inventory tracked individually by cert or unique inventory item.
- Purchase records with durable cost basis.
- Sales and order records that reference exact inventory item or quantity records.
- Customer accounts and order history.
- Consignment intake, sale, fee, payout, and settlement separation.
- Ecommerce-ready catalog and order structure.
- Mobile-first card-show checkout for iPhone use.
- Storage locations and inventory movement history.
- Pricing references with manual entry and CSV fallback.
- Sales, profit, inventory value, and consignment reporting.
- CSV imports and exports.
- Audit history for sensitive business events.

## Critical business requirements

- Never allow negative inventory.
- Track graded cards individually.
- Ensure every sale references the exact inventory item or quantity record.
- Preserve purchase cost and financial history after a sale.
- Keep consignment finances separate from company-owned inventory.
- Use decimal-safe money handling.
- Use database transactions for inventory-changing operations.
- Make future payment and marketplace webhook processing idempotent.
- Never expose internal cost or profit on public pages.
- Do not create unofficial scraping integrations.
- Do not invent TCGplayer, eBay, or PSA API access.
- Plan provider interfaces and manual or CSV fallbacks.
- Prioritize iPhone usability and mobile card-show operations.

## Non-goals for Phase 0

- Application scaffolding.
- Dependency installation.
- Authentication implementation.
- Database migrations.
- Payment implementation.
- Storefront implementation.
- Credentials.
- Marketplace integrations.

## Phase 1 requirements update

Phase 1 introduces a secure technical foundation and route shells while preserving all Phase 0 business requirements. The `/app` and `/admin` pages must communicate that operational modules will be added in later phases.

## Phase 3 note: secure internal inventory operations

Phase 3 adds the authenticated internal `/app` workspace for product catalog, quantity and individually tracked inventory, purchase/manual receiving, adjustments, transfers, reservations/releases, locations, immutable inventory movements, and restricted audit history. All pages and mutations must enforce server-side permissions independently of navigation visibility. Cost fields are selected only for users with `cost:read`; inventory is targeted by stable database IDs; inventory-changing workflows use transaction boundaries and concurrency-safe checks to prevent negative inventory and over-reservation. No Phase 4 sales, checkout, Stripe, ecommerce, marketplace, scraping, or profit-reporting work is included.
