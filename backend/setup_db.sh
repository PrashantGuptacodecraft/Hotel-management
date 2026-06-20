#!/usr/bin/env bash
# One-shot backend setup: generate Prisma client, create + seed the SQLite DB,
# then type-check. Safe to re-run (seed is idempotent).
set -e
cd "$(dirname "$0")"

echo "==> prisma generate"
npx prisma generate

echo "==> prisma db push"
npx prisma db push --skip-generate --accept-data-loss

echo "==> seed"
npm run db:seed

echo "==> typecheck (backend)"
npx tsc --noEmit

echo "ALL DONE"
