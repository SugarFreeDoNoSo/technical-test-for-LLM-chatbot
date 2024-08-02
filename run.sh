#!/bin/bash
# wait-for-it.sh
set -e
shift
sleep 5

>&2 echo "bunx prisma migrate deploy"
bunx prisma migrate deploy

>&2 echo "bun run start:prod"
exec bun run start:prod

