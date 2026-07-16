# Architecture

## Planned stack

- Next.js App Router for web application routing and server components.
- React for UI composition.
- Strict TypeScript for compile-time safety.
- PostgreSQL as the system of record.
- Prisma ORM for typed database access and migrations in later phases.
- Zod for runtime validation at system boundaries.
- Tailwind CSS for responsive styling.
- Secure authentication with server-enforced permissions.
- Stripe-ready payment architecture.
- Progressive Web App support for card-show usability.
- Automated tests.
- Vercel-compatible deployment.

## High-level modules

- Catalog: Pokémon and One Piece products, variants, and identifiers.
- Inventory: raw quantity records, sealed quantity records, and individually tracked graded cards.
- Purchasing: vendors, purchase orders, line items, and cost basis.
- Sales/orders: order lifecycle, line items, inventory allocations, taxes, discounts, and payment references.
- Customers: customer accounts, contact details, and order history.
- Consignments: consignor inventory, fees, sale allocation, payout, and settlement.
- Checkout: mobile-first internal card-show checkout and future ecommerce checkout.
- Storage: locations, bins, cases, and movement history.
- Pricing: manual values, CSV imports, and future provider adapters.
- Reporting: sales, profit, inventory, and consignment reports.
- Audit: immutable event history for operational and financial changes.

## Architectural principles

- PostgreSQL is the source of truth for inventory and financial state.
- Inventory-changing operations must use database transactions.
- Sales must reference exact inventory sources.
- Money must be stored and calculated with decimal-safe representations.
- Public routes must not expose internal cost basis or profit.
- Provider integrations must go through explicit interfaces with idempotent processing and fallback paths.
- UI must prioritize mobile/iPhone workflows for card-show operations.

## Phase 0 status

No application runtime architecture has been implemented. This document describes the intended direction only.
