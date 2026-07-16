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

## Phase 1 database foundation

Phase 1 configures Prisma for PostgreSQL and adds only identity, access-control, and audit-log models: `User`, `Account`, `Session`, `VerificationToken`, `Role`, `Permission`, `UserRole`, `RolePermission`, and `AuditLog`. Inventory, purchasing, sales, customer, consignment, payment, and marketplace models remain deferred.

## Phase 2 business data foundation

Phase 2 adds PostgreSQL-only Prisma models for catalog products, consignors, storage locations, quantity inventory lots, individually tracked inventory items, purchases, purchase lines, and an append-only inventory movement ledger. UUID primary keys are used throughout the Phase 2 domain.

Money is stored with Prisma `Decimal`: financial totals use `Decimal(18,2)` and acquisition unit costs use `Decimal(18,4)` so low-cost cards and averages remain decimal-safe. Application code accepts decimal strings and converts to Prisma Decimal rather than JavaScript floating point math.

Quantity lots hold fungible raw cards and sealed products. Individually tracked items hold serialized assets such as graded cards, with optional grading company, grade, certification number, qualifier, and label details. Historical acquisition cost is snapshotted onto the inventory lot or item and is not derived from mutable catalog data.

Ownership is enforced at the database layer: company-owned inventory cannot reference a consignor, and consignment inventory must reference a consignor. Quantity constraints prevent negative on-hand and reserved quantities, and prevent reserved quantity from exceeding on-hand quantity. Movement rows must reference exactly one inventory target.

Inventory-changing services run in Prisma transactions with serializable isolation. Receiving purchases, receiving serialized items, adjustments, transfers, reservations, and releases write movement history and sensitive mutations also write audit logs in the same transaction.
