# AGENTS.md

## Repository scope
These instructions apply to the entire repository.

## Current phase
This repository is in Phase 0 project planning. Do not scaffold application code, install major dependencies, create database migrations, add credentials, or implement integrations unless a later phase explicitly requests it.

## Project direction
All About Cards FL LLC is planning a Next.js App Router, React, strict TypeScript, PostgreSQL, Prisma, Zod, Tailwind CSS, secure-authentication, server-permissioned, Stripe-ready, PWA-capable, Vercel-compatible application.

## Business rules to preserve
- Never allow negative inventory.
- Track graded cards individually.
- Ensure each sale references exact inventory records.
- Preserve purchase cost and financial history after sale.
- Separate consignment finances from company-owned inventory.
- Use decimal-safe money handling.
- Use database transactions for inventory-changing operations.
- Design future webhook processing to be idempotent.
- Never expose internal cost or profit on public pages.
- Do not create unofficial scraping integrations or invent provider API access.

## Documentation conventions
- Keep planning documents consistent with `README.md` and files in `docs/`.
- Record major architectural decisions in `docs/DECISIONS.md`.
- Prefer explicit risks, assumptions, and phase boundaries over implied scope.
