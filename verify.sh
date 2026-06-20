#!/usr/bin/env bash
# Type-check both apps in one pass.
set +e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> backend tsc"
( cd "$ROOT/backend" && npx tsc --noEmit ) ; BE=$?

echo "==> frontend tsc"
( cd "$ROOT/frontend" && npx tsc --noEmit ) ; FE=$?

echo "----------------------------------------"
echo "backend tsc exit:  $BE"
echo "frontend tsc exit: $FE"
[ $BE -eq 0 ] && [ $FE -eq 0 ] && echo "TYPECHECK PASS" || echo "TYPECHECK HAS ERRORS"
