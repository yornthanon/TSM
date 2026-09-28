# TicketManagement - Docker Setup

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 8GB RAM available for Docker

## Quick Start

```bash
# 1. Navigate to the deployment directory
cd Deployment/infrastructure

# 2. Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

## Services

This compose file runs the **monolith** (`app-monolith`), which packages every
service module into one process on port 8080. It does **not** start the
individual microservices or the API gateway — see the root `README.md` for that
topology.

| Service | Port | Description |
|---------|------|-------------|
| app-monolith | 8080 | All domain modules (user, event, ticket, order, payment, notification) in one process |
| PostgreSQL | 5432 | Database (`ticket_db`, single shared schema) |
| Redis | 6379 | Ticket locking & caching |
| Kafka | 9092 | Event streaming, KRaft mode (no ZooKeeper) |
| Zipkin | 9411 | Distributed tracing |

The admin dashboard is a separate Vite app and is **not** built by this compose
file. Run it from the repository root with `npm run dev`.

## Environment Variables

Create a `.env` file in the repository root to override defaults:

```env
POSTGRES_USER=ticket
POSTGRES_PASSWORD=ticket123
# Must be Base64 decoding to 32-64 bytes, or every login returns 500.
# Generate with: openssl rand -base64 32
JWT_SECRET=wM0mBxIDFKh1FOCWfA++ZCSk8d1I8ztVZAOxdqxtiXxOmb8yF9UCwIZ8MMCGHptU
```

## Useful Commands

```bash
# View logs for all services
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f user-service

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild a specific service
docker-compose up --build api-gateway

# Execute a command in a running container
docker-compose exec postgres psql -U ticket -d ticket_user_db
```

## Accessing the Application

- API Gateway: http://localhost:8080
- Admin UI: http://localhost:8090
- Zipkin Tracing: http://localhost:9411

## Default Login

- Username: `admin`
- Password: `admin123`

## Database

All databases are automatically initialized via `init-databases.sql`:
- ticket_user_db
- ticket_event_db
- ticket_db
- ticket_order_db
- ticket_payment_db
- ticket_notification_db
- ticket_gateway_db

## Troubleshooting

**Port already in use:**
```bash
# Check what's using the port
lsof -i :8080

# Or modify ports in docker-compose.yaml
```

**Kafka connection issues:**
```bash
# Check Kafka logs
docker compose logs kafka

# Verify the broker is healthy (KRaft mode - there is no ZooKeeper container)
docker compose ps kafka

# Talk to the broker directly
docker compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

**Database connection issues:**
```bash
# Check PostgreSQL is healthy
docker compose ps postgres

# Connect to PostgreSQL (the monolith uses the single ticket_db)
docker compose exec postgres psql -U ticket -d ticket_db
```
