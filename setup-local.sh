#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

POSTGRES_USER="${POSTGRES_USER:-ticket}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-ticket123}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
DATABASES=(ticket_user_db ticket_event_db ticket_db ticket_order_db ticket_payment_db ticket_notification_db ticket_admin_db ticket_gateway_db)

fail() { echo "ERROR: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "Missing '$1'. Install it and run this script again."; }

need java
need javac
need node
need npm
need psql
need createdb
need pg_isready
need redis-server

if [[ ! -x "$ROOT_DIR/mvnw" ]]; then
  fail "Maven wrapper is missing or not executable. Run: chmod +x mvnw setup-local.sh run-local.sh stop-local.sh"
fi

if ! pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" >/dev/null 2>&1; then
  fail "PostgreSQL is not running at ${POSTGRES_HOST}:${POSTGRES_PORT}. Start PostgreSQL natively, then run this script again."
fi

export PGPASSWORD="${PGPASSWORD:-$POSTGRES_PASSWORD}"
for db in "${DATABASES[@]}"; do
  if ! psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1; then
    echo "Creating database: $db"
    createdb -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$db"
  else
    echo "Database exists: $db"
  fi
done
unset PGPASSWORD

if [[ ! -f .env ]]; then
  cp .env.example .env
  cat >> .env <<EOF

# Native local defaults (no Docker)
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
SPRING_DATASOURCE_USERNAME=$POSTGRES_USER
SPRING_DATASOURCE_PASSWORD=$POSTGRES_PASSWORD
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
KAFKA_BOOTSTRAP_SERVERS=${KAFKA_BOOTSTRAP_SERVERS:-localhost:9092}
JWT_SECRET=${JWT_SECRET:-change-this-local-secret-to-at-least-32-characters}
EOF
  echo "Created .env with local defaults. Review it before starting services."
else
  echo "Using existing .env"
fi

npm install
"$ROOT_DIR/mvnw" -q -DskipTests install

echo
echo "Native setup completed. Next:"
echo "  1. Start Redis and Kafka natively (Kafka is required by order/notification services)."
echo "  2. Run ./run-local.sh"
