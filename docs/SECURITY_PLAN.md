# Security Plan

## Goals

Protect inventory, customer, order, consignment, payment, cost, profit, and audit data while supporting internal operations and future ecommerce.

## Authentication and authorization

- Use secure authentication in a later phase.
- Enforce permissions on the server, not only in the UI.
- Separate public customer capabilities from internal staff capabilities.
- Restrict internal cost, profit, settlement, and administrative data to authorized internal users.

## Data protection

- Do not commit credentials, API keys, tokens, or private customer exports.
- Use environment variables and deployment secret storage for future credentials.
- Validate input with Zod at server boundaries.
- Log audit events for sensitive changes.
- Avoid exposing internal errors to public users.

## Payments and webhooks

- Design Stripe payment flows in later phases.
- Store payment references, not sensitive card data.
- Process future payment and marketplace webhooks idempotently.
- Verify webhook signatures where provider support exists.

## Integration policy

Do not create unofficial scraping integrations. Do not invent TCGplayer, eBay, PSA, or other provider API access. Use explicit provider interfaces and manual or CSV fallbacks until official access and terms are confirmed.
