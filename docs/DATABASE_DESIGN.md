# Database Design

## Planned database

PostgreSQL is planned as the primary system of record, accessed through Prisma ORM in later phases. No migrations are created in Phase 0.

## Core entity areas

- Users, roles, and permissions.
- Products, product variants, games, sets, card numbers, languages, and conditions.
- Inventory items for individually tracked graded cards.
- Inventory quantity lots for raw cards and sealed products.
- Purchases, vendors, purchase lines, fees, shipping, taxes, and cost allocation.
- Sales/orders, order lines, inventory allocations, payments, refunds, and adjustments.
- Customers and customer account data.
- Consignors, consignment agreements, consigned inventory, fees, payouts, and settlements.
- Storage locations and inventory movement events.
- Pricing snapshots, manual prices, provider references, and CSV import batches.
- Audit events.
- Idempotency keys for future payment and marketplace webhooks.

## Inventory rules

- Graded cards are tracked individually as unique inventory records.
- Raw cards and sealed products may use quantity records, but sales must allocate against exact quantity lots.
- Database constraints and transactional logic should prevent negative inventory.
- Sold inventory must retain original purchase, cost basis, sale, and audit references.
- Inventory ownership must distinguish company-owned items from consigned items.

## Money handling

Money values should use decimal-safe database fields and application types. Floating-point numbers must not be used for persisted monetary calculations.

## Transaction requirements

Database transactions are required for operations that change inventory, orders, payments, consignment settlement, purchase cost allocation, or storage movement.

## Phase 0 status

This is a planning document only. No Prisma schema or database migration has been created.
