# Integrations

## Planned approach

Integrations will be adapter-based. Each provider should have a narrow interface, explicit credentials, documented rate limits, idempotent event handling where applicable, and a manual or CSV fallback.

## Potential integration categories

- Stripe for future payment processing.
- Pricing providers for market reference data.
- Marketplace providers for future listings or order import if official access exists.
- CSV import/export for inventory, pricing, orders, and reports.
- Email or notification services for future customer communication.

## Provider restrictions

- Do not create unofficial scraping integrations.
- Do not invent TCGplayer, eBay, or PSA API access.
- Do not assume production credentials exist.
- Do not store credentials in source control.
- Public pages must not expose internal cost or profit through integration responses.

## Phase 0 status

No integrations are implemented. This document defines future boundaries and fallback expectations.

## Phase 1 integration status

Phase 1 adds only authentication provider placeholders. It does not add TCGplayer, eBay, PSA, Stripe, marketplace, pricing, scraping, or production third-party integrations.
