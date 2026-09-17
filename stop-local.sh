#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT_DIR/.local/pids"

if [[ ! -d "$PID_DIR" ]]; then
  echo "No native local processes are registered."
  exit 0
fi

shopt -s nullglob
for pid_file in "$PID_DIR"/*.pid; do
  name="$(basename "$pid_file" .pid)"
  pid="$(cat "$pid_file")"
  if kill -0 "$pid" 2>/dev/null; then
    echo "Stopping $name (PID $pid)"
    kill "$pid" 2>/dev/null || true
    for _ in {1..20}; do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.25
    done
    kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$pid_file"
done

echo "Native local processes stopped. PostgreSQL, Redis, and Kafka were not stopped."
