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

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8080 | Entry point for all requests |
| User Service | 8081 | User management & JWT authentication |
| Event Service | 8082 | Event management |
| Ticket Service | 8083 | Ticket management with Redis locking |
| Order Service | 8084 | Order processing with Kafka events |
| Payment Service | 8085 | Payment processing |
| Notification Service | 8086 | Kafka-based notifications |
| Admin Service | 8090 | Vaadin admin UI |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Caching & locking |
| Kafka | 9092 | Event streaming |
| Zipkin | 9411 | Distributed tracing |

## Environment Variables

Create a `.env` file in the same directory to override defaults:

```env
POSTGRES_USER=ticket
POSTGRES_PASSWORD=ticket123
JWT_SECRET=your-secret-key-here
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
docker-compose logs kafka

# Verify Zookeeper is running
docker-compose logs zookeeper
```

**Database connection issues:**
```bash
# Check PostgreSQL is healthy
docker-compose ps postgres

# Connect to PostgreSQL
docker-compose exec postgres psql -U ticket -d ticket_user_db
```
