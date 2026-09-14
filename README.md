# 🎫 TicketManagement

> Microservices-based Event Ticketing Platform built with Spring Boot, Spring Cloud, React, and TypeScript.

[![Java](https://img.shields.io/badge/Java-21-blue)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-green)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2025.1.2-brightgreen)](https://spring.io/projects/spring-cloud)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7%2B-red)](https://redis.io/)
[![Kafka](https://img.shields.io/badge/Kafka-3%2B-black)](https://kafka.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://www.docker.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## 🎯 Overview

**TicketManagement** is a production-ready, microservices-based event ticketing platform that enables users to browse events, purchase tickets, and receive notifications. The system is designed with scalability, resilience, and maintainability in mind, following modern cloud-native patterns.

### Key Capabilities

- 🎪 **Event Management** — Create, update, and manage events with different types and statuses
- 🎟️ **Ticket Management** — Sell tickets with Redis-based distributed locking to prevent overselling
- 🛒 **Order Processing** — Seamless order creation with integrated payment processing
- 💳 **Payment Gateway** — Mock payment gateway supporting multiple payment methods (extensible to real providers like Stripe)
- 📧 **Notifications** — Real-time email and SMS notifications via Kafka event streaming
- 🔐 **Authentication & Authorization** — JWT-based authentication with Role-Based Access Control (RBAC)
- 🖥️ **Admin Dashboard** — React-based admin panel for system management and analytics
- 🚦 **API Gateway** — Single entry point with rate limiting, logging, and dynamic routing

## ✨ Features

### User Features
- User registration and authentication
- Browse available events
- Purchase tickets securely
- Receive order confirmations via email/SMS

### Admin Features
- **Dashboard** — Overview of system metrics (users, events, orders, revenue)
- **User Management** — View, search, and manage user accounts
- **Event Management** — Approve/reject events, manage event listings
- **Order Monitoring** — Track orders, filter by status, view details
- **Payment Analytics** — Revenue statistics, success/failure rates
- **Notification Center** — View notification logs, resend failed notifications
- **System Health** — Monitor service status and infrastructure

### Technical Features
- **Microservices Architecture** — Database per service pattern for loose coupling
- **Event-Driven Communication** — Apache Kafka for async messaging
- **Distributed Locking** — Redis-based ticket locking to prevent race conditions
- **Rate Limiting** — Redis-based rate limiting at the API Gateway
- **Distributed Tracing** — Zipkin integration for request tracing
- **Correlation IDs** — End-to-end request tracking
- **Audit Trail** — Automatic tracking of created/updated records
- **Environment Configuration** — All services support environment variable overrides
- **Docker Deployment** — Complete Docker Compose setup for local development

## 🏗️ Architecture

### System Architecture

```
┌─────────────┐
│   Client    │
│ (React App) │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│                   API Gateway (:8080)                 │
│  ┌────────────────────────────────────────────────┐  │
│  │  Filters: CorrelationId, JWT, RateLimit, Log   │  │
│  │  Dynamic Routes (stored in DB)                 │  │
│  └────────────────────────────────────────────────┘  │
└───┬──────┬──────┬──────┬──────┬──────┬──────────────┘
    │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼
  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌──────────┐
  │ US │ │ ES │ │ TS │ │ OS │ │ PS │ │    NS    │
  │:808│ │:808│ │:808│ │:808│ │:808│ │  :8086  │
  └────┘ └────┘ └────┘ └────┘ └────┘ └──────────┘
    │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼
  ┌──────────────────────────────────────────────────┐
  │           PostgreSQL (Multiple Databases)         │
  │  user_db | event_db | ticket_db | order_db | ... │
  └──────────────────────────────────────────────────┘

       │      │      │      │      │
       ▼      ▼      ▼      ▼      ▼
    ┌──────────────────────────────────────┐
    │  Redis (:6379)                       │
    │  - Rate Limiting                     │
    │  - Distributed Locking (Tickets)     │
    └──────────────────────────────────────┘

       │
       ▼
    ┌──────────────────────────────────────┐
    │  Kafka (:9092)                       │
    │  Topic: order-confirmed-topic        │
    └──────────────────────────────────────┘
```

### Request Flow

```
Client Request (with JWT)
    ↓
[1] CorrelationIdFilter → Create X-Correlation-ID
    ↓
[2] JwtAuthenticationFilter → Verify JWT token
    ↓
[3] RateLimitGlobalFilter → Check rate limit
    ↓
[4] LoggingFilters → Log request/response
    ↓
[5] Dynamic Route Lookup → Find destination service
    ↓
Destination Service → Process business logic
```

### Order Flow

```
POST /api/v1/orders/create
    ↓
1. Verify JWT (via User Service)
    ↓
2. Create Order (status = PROCESSING)
    ↓
3. Process Payment (via Payment Service)
    ↓
4. Update Order (status = COMPLETED)
    ↓
5. Publish Kafka Event (order-confirmed-topic)
    ↓
6. Notification Service consumes → Send Email/SMS
```

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 21 | Programming language |
| **Spring Boot** | 4.1.0 | Application framework |
| **Spring Cloud Gateway** | 2025.1.2 | API Gateway |
| **Spring Data JPA** | - | ORM / Database access |
| **Spring Security + JJWT** | 0.12.6 | Authentication & Authorization |
| **Spring Kafka** | - | Event streaming |
| **Spring Data Redis** | - | Caching & distributed locking |
| **PostgreSQL** | 15+ | Primary database |
| **Redis** | 7+ | Caching, rate limiting, locking |
| **Apache Kafka** | 3+ | Async messaging |
| **MapStruct** | 1.6.3 | DTO mapping |
| **Lombok** | - | Boilerplate reduction |
| **Flyway** | 10.10.0 | Database migrations |
| **Zipkin** | - | Distributed tracing |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18 | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Vite** | - | Build tool |
| **React Router** | v6 | Routing |
| **Axios** | - | HTTP client |
| **TanStack Query** | - | Server state management |
| **Tailwind CSS** | - | Styling |
| **Recharts** | - | Charts & analytics |
| **React Hook Form + Zod** | - | Form validation |
| **Day.js** | - | Date handling |

### Infrastructure

- **Docker & Docker Compose** — Containerization and orchestration
- **PostgreSQL** — Primary data store
- **Redis** — Cache and distributed lock
- **Kafka** — Event streaming platform
- **Zipkin** — Distributed tracing

## 📁 Project Structure

```
ticket-management/
├── .mvn/                          # Maven wrapper
├── api-gateway/                   # API Gateway (:8080)
│   └── src/main/java/com/ticket/apigateway/
│       ├── filter/                # JWT, RateLimit, Logging filters
│       ├── service/               # Route management, logging
│       ├── controller/            # API route CRUD
│       └── ApiGatewayApplication.java
├── common/                        # Shared library
│   └── src/main/java/com/ticket/common/
│       ├── entity/BasedEntity.java
│       ├── dto/                   # Base DTOs, events
│       ├── exception/             # Global exception handling
│       ├── criteria/              # Dynamic search criteria
│       ├── constant/              # API constants
│       └── config/                # WebClient, OpenAPI config
├── user-service/                  # Authentication & RBAC (:8081)
│   └── src/main/java/com/ticket/userservice/
│       ├── controller/            # Public, User, Role, Permission, Group
│       ├── service/               # Auth, User, RBAC services
│       ├── entity/                # User, Role, Permission, Group, RefreshToken
│       └── filter/                # JWT, CORS, Security filters
├── event-service/                 # Event Management (:8082)
│   └── src/main/java/com/ticket/eventservice/
│       ├── controller/EventController.java
│       ├── service/EventService.java
│       └── entity/Event.java
├── ticket-service/                # Ticket Management + Redis Locking (:8083)
│   └── src/main/java/com/ticket/ticketservice/
│       ├── controller/TicketController.java
│       ├── service/TicketService.java
│       └── client/EventClient.java
├── order-service/                 # Order Processing + Kafka Producer (:8084)
│   └── src/main/java/com/ticket/orderservice/
│       ├── controller/OrderController.java
│       ├── service/OrderService.java
│       ├── client/                # UserClient, PaymentClient, EventClient
│       └── Producer/OrderConfirmedKafkaProducer.java
├── payment-service/               # Payment Processing (:8085)
│   └── src/main/java/com/ticket/paymentservice/
│       ├── controller/PaymentController.java
│       ├── service/PaymentService.java
│       └── service/PaymentGatewayServiceImpl.java
├── notification-service/          # Email/SMS Notifications (:8086)
│   └── src/main/java/com/ticket/notificationservice/
│       ├── controller/AdminNotificationController.java
│       ├── service/EmailService.java
│       ├── service/SmsService.java
│       └── listener/OrderConfirmedEventListener.java
├── deployment/
│   └── infrastructure/
│       ├── docker-compose.yaml
│       ├── init-databases.sql
│       └── README.md
├── docs/
│   ├── PROJECT_DOCUMENTATION.md
│   └── ADMIN_DASHBOARD_PLAN.md
├── pom.xml                        # Parent Maven POM
└── mvnw                           # Maven wrapper (Unix)
```

## 🚀 Getting Started

### Prerequisites

- **Java 21** — [Download](https://openjdk.org/)
- **Maven 3.8+** — [Download](https://maven.apache.org/)
- **PostgreSQL 15+** — [Download](https://www.postgresql.org/)
- **Redis 7+** — [Download](https://redis.io/)
- **Apache Kafka 3+** — [Download](https://kafka.apache.org/)
- **Node.js 18+** — [Download](https://nodejs.org/) (for frontend)

### Quick Start with Docker

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ticket-management.git
cd ticket-management/deployment/infrastructure

# 2. Start all services
docker-compose up --build

# 3. Access the application
# API Gateway: http://localhost:8080
# Admin Dashboard: http://localhost:8090 (when implemented)
# Zipkin: http://localhost:9411
```

### Manual Setup

#### 1. Setup Databases

```bash
# Create PostgreSQL databases
createdb ticket_user_db
createdb ticket_event_db
createdb ticket_db
createdb ticket_order_db
createdb ticket_gateway_db
```

#### 2. Start Infrastructure

```bash
# Start Redis
redis-server

# Start Kafka
# Follow Kafka quick start guide for your OS
```

#### 3. Build the Project

```bash
./mvnw clean install
```

#### 4. Run Services (in order)

```bash
# Terminal 1: User Service
./mvnw spring-boot:run -pl user-service

# Terminal 2: API Gateway
./mvnw spring-boot:run -pl api-gateway

# Terminal 3: Event Service
./mvnw spring-boot:run -pl event-service

# Terminal 4: Ticket Service
./mvnw spring-boot:run -pl ticket-service

# Terminal 5: Order Service
./mvnw spring-boot:run -pl order-service

# Terminal 6: Payment Service
./mvnw spring-boot:run -pl payment-service

# Terminal 7: Notification Service
./mvnw spring-boot:run -pl notification-service
```

#### 5. Run Frontend (Admin Dashboard)

```bash
cd admin-dashboard
npm install
npm run dev
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/public/users/registration` | Register new user |
| POST | `/public/users/login` | Login and get tokens |
| POST | `/public/users/logout` | Logout (revoke refresh token) |
| POST | `/public/users/refreshToken` | Refresh access token |
| POST | `/public/users/verify-token` | Verify JWT token (internal) |

### Protected Endpoints

#### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/users` | Get all users |
| GET | `/v1/users/{id}` | Get user by ID |
| PUT | `/v1/users/{id}` | Update user |
| DELETE | `/v1/users/{id}` | Delete user |
| POST | `/v1/users/{id}/change-password` | Change password |
| POST | `/v1/users/{id}/deactivate` | Deactivate user |
| POST | `/v1/users/{id}/reset-password` | Reset password |
| GET | `/v1/users/search` | Search users |
| GET | `/v1/roles` | Get all roles |
| GET | `/v1/permissions` | Get all permissions |
| GET | `/v1/groups` | Get all groups |

#### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/events/create` | Create event |
| GET | `/v1/events/{id}` | Get event by ID |
| PUT | `/v1/events/{id}` | Update event |
| DELETE | `/v1/events/{id}` | Delete event |

#### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/tickets/create` | Create ticket |
| GET | `/v1/tickets/{id}` | Get ticket by ID |
| POST | `/v1/tickets/lock` | Lock tickets (purchase) |
| POST | `/v1/tickets/unlock` | Unlock tickets |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/orders/create` | Create order |
| GET | `/v1/orders/{id}` | Get order by ID |
| GET | `/v1/orders` | Get all orders |

#### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/payments/process` | Process payment |
| GET | `/v1/payments/{id}` | Get payment by ID |

#### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/notifications` | Get all notifications |
| GET | `/v1/notifications/stats` | Get notification stats |
| POST | `/v1/notifications/{id}/resend` | Resend notification |
| DELETE | `/v1/notifications/{id}` | Delete notification |

#### Admin Routes (ADMIN role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/routes` | Get all routes |
| POST | `/routes` | Create route |
| PUT | `/routes/{id}` | Update route |
| DELETE | `/routes/{id}` | Delete route |
| POST | `/routes/refresh` | Refresh routes |

## 🚢 Deployment

### Docker Compose (Recommended)

```bash
cd deployment/infrastructure
docker-compose up --build -d
```

### Environment Variables

Create a `.env` file in `deployment/infrastructure/`:

```env
POSTGRES_USER=ticket
POSTGRES_PASSWORD=ticket123
JWT_SECRET=your-secret-key-here-minimum-256-bits
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/ticket_user_db
SPRING_REDIS_HOST=redis
SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092
```

### Service Ports

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8080 | Main entry point |
| User Service | 8081 | Authentication & RBAC |
| Event Service | 8082 | Event management |
| Ticket Service | 8083 | Ticket management |
| Order Service | 8084 | Order processing |
| Payment Service | 8085 | Payment processing |
| Notification Service | 8086 | Email/SMS notifications |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & locking |
| Kafka | 9092 | Event streaming |
| Zipkin | 9411 | Distributed tracing |

## 🗺️ Roadmap

### Phase 1: Core Ticketing (✅ Completed)
- [x] User authentication & JWT
- [x] Event management
- [x] Ticket management with Redis locking
- [x] Order processing
- [x] Payment processing (mock)
- [x] Email/SMS notifications
- [x] API Gateway with routing & security

### Phase 2: Enhancements
- [ ] Real payment gateway integration (Stripe/ABA)
- [ ] Push notifications (FCM)
- [ ] Advanced analytics & reporting
- [ ] CSV export for orders/payments
- [ ] Email templates customization
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Kubernetes deployment manifests
- [ ] CI/CD pipeline

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or support, please open an issue in the GitHub repository.

---

**Built with ❤️ using Spring Boot, Spring Cloud, React, and TypeScript**
