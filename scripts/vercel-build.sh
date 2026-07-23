#!/usr/bin/env bash
set -euo pipefail

# Vercel build entrypoint. On PRODUCTION deploys only, it creates/updates the
# database tables and makes sure the base roles exist — using Neon's direct
# (unpooled) connection, which is the reliable one for migrations. Preview
# deploys skip this so an un-merged branch can never migrate the production
# database. Then it runs the normal Next.js build.
#
# The regular `build` script is left untouched, so local dev and CI (which
# have no production database) are unaffected.

if [ "${VERCEL_ENV:-}" = "production" ] && [ -n "${DATABASE_URL_UNPOOLED:-}" ]; then
  echo "Production deploy — applying database migrations and seeding roles…"
  DATABASE_URL="$DATABASE_URL_UNPOOLED" npm run prisma:migrate:deploy
  DATABASE_URL="$DATABASE_URL_UNPOOLED" npm run prod:init
else
  echo "Not a production deploy (or no direct DB URL) — skipping DB setup."
fi

npm run build
