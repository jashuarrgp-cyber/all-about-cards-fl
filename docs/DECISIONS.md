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
