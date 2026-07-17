# MVP Scope

## MVP goal

Deliver a dependable internal operations application that controls inventory, purchasing, selling, customer, consignment, storage, import/export, audit, and reporting workflows before public ecommerce expansion.

## In scope

- Internal authenticated user access and server-enforced permissions after Phase 0.
- Product records for Pokémon and One Piece items.
- Inventory records for raw cards, sealed products, and graded cards.
- Individual graded-card tracking.
- Purchase and cost-basis records.
- Sales/orders connected to exact inventory sources.
- Customer records.
- Basic consignment intake, sale allocation, fee, payout, and settlement tracking.
- Storage locations and item movement tracking.
- Manual pricing records and CSV imports/exports.
- Sales and profit reporting for internal users.
- Audit history for inventory, financial, permission, and integration events.
- Mobile-first checkout optimized for iPhone card-show operations.

## Out of scope for MVP

- Unconfirmed marketplace API integrations.
- Unofficial scraping.
- Public exposure of internal cost or profit.
- Advanced accounting-suite synchronization.
- Complex loyalty programs.
- Native mobile apps.
- Automated PSA, TCGplayer, or eBay access unless official credentials and terms are confirmed.

## Boundary rule

If a feature can change inventory, money, permissions, customer data, or audit history, it must be designed with server-side authorization, validation, decimal-safe persistence, transactions where needed, and test coverage.

## Phase 1 scope note

Phase 1 is foundational only: application shell, tooling, identity/access-control schema, audit foundation, owner bootstrap, tests, and CI. MVP business workflows remain planned for later phases.

## Phase 3 note: secure internal inventory operations

Phase 3 adds the authenticated internal `/app` workspace for product catalog, quantity and individually tracked inventory, purchase/manual receiving, adjustments, transfers, reservations/releases, locations, immutable inventory movements, and restricted audit history. All pages and mutations must enforce server-side permissions independently of navigation visibility. Cost fields are selected only for users with `cost:read`; inventory is targeted by stable database IDs; inventory-changing workflows use transaction boundaries and concurrency-safe checks to prevent negative inventory and over-reservation. No Phase 4 sales, checkout, Stripe, ecommerce, marketplace, scraping, or profit-reporting work is included.
