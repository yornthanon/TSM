#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"
LOG_DIR="$ROOT_DIR/.local/logs"
PID_DIR="$ROOT_DIR/.local/pids"
mkdir -p "$LOG_DIR" "$PID_DIR"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

is_running() { [[ -f "$PID_DIR/$1.pid" ]] && kill -0 "$(cat "$PID_DIR/$1.pid")" 2>/dev/null; }
start_process() {
  local name="$1"; shift
  if is_running "$name"; then
    echo "Already running: $name (PID $(cat "$PID_DIR/$name.pid"))"
    return
  fi
  echo "Starting $name..."
  nohup "$@" >"$LOG_DIR/$name.log" 2>&1 &
  echo $! >"$PID_DIR/$name.pid"
}

command -v redis-cli >/dev/null 2>&1 && redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" ping >/dev/null 2>&1 || \
  echo "WARNING: Redis is not reachable. Start redis-server before using ticket locking/rate limiting."
command -v nc >/dev/null 2>&1 && nc -z "${KAFKA_HOST:-localhost}" "${KAFKA_PORT:-9092}" >/dev/null 2>&1 || \
  echo "WARNING: Kafka is not reachable. Start Kafka before using orders/notifications."

MVNW="$ROOT_DIR/mvnw"
start_process backend "$MVNW" -pl app-monolith spring-boot:run
start_process frontend npm run dev -- --host 0.0.0.0

echo
echo "Started native services. Logs: $LOG_DIR"
echo "Frontend: http://localhost:3000"
echo "Backend (monolith): http://localhost:8080"
echo "Stop everything with: ./stop-local.sh"
