# 📚 TicketManagment — Project Documentation

> เอกสารពណ៌នាពី Project ទាំងមូល, Technology ដែលប្រើ, Flow/Pattern និងការពន្យល់ Code លម្អិត។

---

## 1. ទិដ្ឋភាពទូទៅនៃ Project (Overview)

**TicketManagment** គឺជា **Microservices System សម្រាប់គ្រប់គ្រងសំបុត្រ** (Event Ticketing Platform) ដែលអនុញ្ញាតឲ្យ：

- 👤 **User** ចុះឈ្មោះ / Login / ទិញសំបុត្រ Event
- 🎫 **System** ចេញសំបុត្រ, Lock កៅអ៊ី (ការ់ការ oversell), គិតថ្លៃ
- 💳 **Payment** ដំណើរការបង់ប្រាក់
- 📧 **Notification** ជូនដំណឹងតាម Email/SMS ពេល Order ជោគជ័យ
- 🖥️ **Admin Panel** សម្រាប់គ្រប់គ្រងទិន្នន័យ

Project នេះបែងចែកជា **8 Modules (Maven Multi-Module)** ដោយ service នីមួយៗរត់ដោយឡែកពីគ្នា ហើយមាន Database របស់ខ្លួន (**Database per Service pattern**)។

### Maven Module Structure

```
TicketManagment (parent pom)
├── common                  # Shared library (entity base, exception, dto, criteria)
├── user-service            # Authentication & Authorization (JWT, RBAC)
├── api-gateway             # Single entry point (routing, rate limit, logging)
├── event-service           # គ្រប់គ្រង Event (CRUD)
├── ticket-service          # គ្រប់គ្រងសំបុត្រ + Redis locking
├── order-service           # គ្រប់គ្រង Order + Kafka producer
├── payment-service         # ដំណើរការបង់ប្រាក់
└── notification-service    # ផ្ញើ Email (SMTP) + SMS (Twilio)
```

---

## 2. Technology Stack ដែលប្រើ

| Technology | Version | ប្រើសម្រាប់ | Services ដែលប្រើ |
|---|---|---|---|
| **Java** | 21 | Programming language | ទាំងអស់ |
| **Spring Boot** | 4.1.0 | Application framework | ទាំងអស់ |
| **Spring Web MVC** | - | REST API (synchronous) | user, event, ticket, order, payment |
| **Spring Cloud Gateway** | - | API Gateway (reactive routing) | api-gateway |
| **Spring Data JPA + Hibernate** | - | ORM ទាក់ទង Database | user, event, ticket, order, payment, admin |
| **Spring Data R2DBC** | - | Reactive DB access (dynamic routes) | api-gateway |
| **PostgreSQL** | - | Main relational database | user, event, ticket, order, payment |
| **H2 (in-memory)** | - | Database សាកល្បង | admin-service |
| **Apache Kafka** (`spring-kafka`) | - | Async messaging រវាង services | order-service (producer) |
| **Redis** (`spring-data-redis`) | - | Distributed lock + Rate limiting | ticket-service, api-gateway |
| **Spring Security + JJWT** | - | Authentication & JWT | user-service, api-gateway |
| **Vaadin** | - | Admin UI framework (full-stack Java) | admin-service |
| **WebClient / Spring WebFlux** | - | Inter-service HTTP calls (reactive) | order, ticket, api-gateway |
| **MapStruct** | 1.6.3 | DTO ↔ Entity mapping (compile-time) | order, ticket, event, payment |
| **Lombok** | - | កាត់បន្ថយ boilerplate (getter/setter/builder) | ទាំងអស់ |
| **Jakarta Validation** | - | Input validation (`@Valid`, `@NotNull`...) | ទាំងអស់ |
| **Jackson** | - | JSON serialize/deserialize | ទាំងអស់ |

### Infrastructure ដែលត្រូវរត់មុនពេល Start System

```
PostgreSQL (port 5432)  → databases: ticket_user_db, ticket_event_db,
                          ticket_db, ticket_order_db (+payment db)
Kafka     (port 9092)   → topic: order-confirmed-topic
Redis     (port 6379)   → rate limiting + ticket locking
```

---

## 3. Architecture និង Port របស់ Services

| Service | Port | Database | ភារកិច្ច |
|---|---|---|---|
| **api-gateway** | `8080` | `ticket_gateway_db` (R2DBC) | Entry point, JWT check, Rate limit, Logging, Dynamic routes |
| **user-service** | `8081` | `ticket_user_db` | Register/Login, JWT, RBAC (User/Role/Permission/Group) |
| **event-service** | `8082` | `ticket_event_db` | CRUD Event |
| **ticket-service** | `8083` | `ticket_db` + Redis | CRUD Ticket, Lock/Unlock កៅអ៊ី |
| **order-service** | `8084` | `ticket_order_db` | បង្កើត Order, ហៅ payment, ផ្ញើ Kafka event |
| **payment-service** | `8085` | PostgreSQL | Process payment (mock gateway) |
| **notification-service** | `8086` | `ticket_notification_db` | Consume Kafka → ផ្ញើ Email (SMTP) + SMS (Twilio) |

> ⚙️ គ្រប់ config ទាំងអស់ support **Environment Variables** ដោយ default value:
> ឧ. `spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/ticket_user_db}`
> មានន័យថា បើមិន set env → ប្រើ default ខាងស្ដាំ។

---

## 4. Overall Architecture Diagram

```mermaid
flowchart LR
    Client[Client / Frontend]
    GW[API Gateway :8080<br/>JWT + RateLimit + Log]
    US[user-service :8081<br/>Auth + RBAC]
    ES[event-service :8082]
    TS[ticket-service :8083]
    OS[order-service :8084]
    PS[payment-service :8085]
    NS[notification-service<br/>skeleton]
    K[(Kafka<br/>order-confirmed-topic)]
    R[(Redis)]
    PG[(PostgreSQL x N)]

    Client -->|HTTP + Bearer Token| GW
    GW -->|route /api/public/users/**| US
    GW -->|route /api/v1/**| ES & TS & OS & PS
    OS -->|WebClient verify-token| US
    OS -->|WebClient process payment| PS
    TS -->|WebClient validate event| ES
    TS <-->|lock/unlock| R
    OS -->|produce event| K
    K -.->|consume (future)| NS
    US & ES & TS & OS & PS --- PG
    GW --- PG
```

---

## 5. Flow Patterns (ដើមពីណា ទៅណា)

### 5.1 Request Flow ទូទៅ (តាមរយៈ API Gateway)

```
Client Request
   │  (Authorization: Bearer <jwt>)
   ▼
[1] CorrelationIdFilter      ← បង្កើត X-Correlation-ID សម្រាប់ trace request
   ▼
[2] JwtAuthenticationFilter  ← ពិនិត្យ token (public paths ដូច /login ឆ្លងកាត់)
   ▼
[3] RateLimitGlobalFilter    ← ការ់ការ DDOS (数 requests/second តាម Redis)
   ▼
[4] LoggingFilter / PerformanceLoggingFilter / RequestMetricsFilter
   │                          ← log request/response + save ទៅ RequestLog table
   ▼
[5] Dynamic Route Lookup     ← ស្វែងរក destination ពី table api_route ក្នុង DB
   ▼
Destination Service (user/event/ticket/order/payment)
```

### 5.2 Authentication Flow (Login)

```
POST /api/public/users/login  (តាម gateway → user-service)
   ▼
PublicController.login()
   ▼
AuthService.authenticate()  → CustomUserDetailService  load user ពី DB
   ▼                         PasswordEncoder (BCrypt) ផ្ទៀងផ្ទាត់ password
JwtService.generateToken()  → បង្កើត Access Token (1 hour)
RefreshTokenService         → បង្កើត Refresh Token (saved in DB)
   ▼
Response: { accessToken, refreshToken }
```

- ពេល access token ផុតកំណត់ → client ហៅ `/refreshToken` ដើម្បីបាន token ថ្មី។
- `/verify-token` → services ផ្សេងៗ (ដូច order-service) ហៅ endpoint នេះតាម WebClient ដើម្បីផ្ទៀងផ្ទាត់ token ហើយយក username។

### 5.3 Ticket Locking Flow (ការ់ការ Oversell)

```
POST /api/v1/tickets/lock  {eventId, userId, quantity, lockDuration}
   ▼
TicketServiceImpl.lockTicket()
   ├─ [1] Redis SETNX "ticket:lock:{eventId}{userId}" (TTL = lockDuration)
   │       → បើ lock មានគេកាន់រួចហើយ → return TICKET_LOCKED error
   ├─ [2] Query tickets ដែល status = AVAILABLE
   │       → បើ insufficiency → return TICKET_NOT_AVAILABLE
   ├─ [3] Mark tickets = LOCKED + lockedBy + lockedUntil → save DB
   └─ [4] finally: delete Redis lock key
   ▼
Response: List<TicketResponse> (locked tickets)
```

> 💡 **ហេតុអ្វីប្រើ Redis?** ពេល user ច្រើន lock កៅអ៊ីដូចគ្នាពេលតែមួយ — Redis `setIfAbsent` ធានាថា មានតែ 1 request បាន process ក្នុង 1 ពេល (distributed mutex)។

### 5.4 Order → Payment → Notification Flow (សំខាន់បំផុត)

```
POST /api/v1/orders/create  {eventId, ticketId, quantity, amount}
   ▼
OrderController.create()
   ▼
OrderServiceImpl.createOrder()
   ├─ [1] handleUnauthorized(): យក JWT ពី header
   │       → UserClient.verifyToken(token) ហៅ user-service
   │       → បាន username (បើ invalid → UN_AUTHORIZATION error)
   ├─ [2] OrderMapper.toEntity() → save Order (status = PROCESSING)
   ├─ [3] PaymentClient.processingPayment(PaymentRequest)  [WebClient → :8085]
   │       → PaymentServiceImpl.save Payment
   │       → PaymentGatewayServiceImpl.processPayment() (mock: return true)
   │       → បើ fail → PAYMENT_FAILED error
   ├─ [4] Update Order: status = COMPLETED + paymentId
   └─ [5] OrderConfirmedKafkaProducer.send(OrderConfirmedEvent)
           → ObjectMapper.writeValueAsString(event)  (JSON string)
           → kafkaTemplate.send("order-confirmed-topic", json)
   ▼
(Future) notification-service consume topic → ផ្ញើ Email/SMS ទៅ customer
```

**OrderConfirmedEvent payload** (order-service/src/main/java/com/ticket/orderservice/dto/OrderConfirmedEvent.java):
```java
orderId, username, email, phoneNumber, eventTitle,
quantity, amount, eventLocation, eventDate, orderDate
```

### 5.5 Communication Patterns សង្ខេប

| ប្រភេទ | Method | ប្រើពេលណា |
|---|---|---|
| **Sync (រង់ចាំចម្លើយ)** | WebClient (`.block()`) | order→user (verify token), order→payment, ticket→event |
| **Async (មិនរង់ចាំ)** | Kafka topic | order → notification (fire-and-forget events) |
| **Client → System** | REST តាម Gateway | គ្រប់ operations |

---

## 6. Layered Architecture Pattern (រចនាសម្ព័ន្ធ Code)

គ្រប់ business services ប្រើ layer ដូចគ្នា：

```
Controller        ← ទទួល HTTP request, validate @Valid, return ResponseEntity
   ▼
Service (interface)  ← contract នៃ business logic
   ▼
ServiceImpl       ← business logic ពិតប្រាកដ (transaction, orchestration)
   ▼
Repository (JPA)  ← query database (extends JpaRepository/BaseRepository)
   ▼
Entity            ← table mapping (extends BasedEntity)
```

**ឯកសារជំនួយ៖**
- **DTO** (Request/Response) — object ទទួល/បញ្ជូន ជាមួយ client (មិន expose Entity ផ្ទាល់)
- **Mapper (MapStruct)** — convert DTO ↔ Entity ដោយ automatic (generate code ពេល compile)
- **Client** — WebClient wrapper សម្រាប់ហៅ service ផ្សេង
- **Config** — Bean configuration (Kafka, WebClient, Security...)

### Standard Response Format

គ្រប់ API ប្រើ `ResponseErrorTemplate` (ពី module common):

```java
public record ResponseErrorTemplate(
    String description,   // សារពិពណ៌នា
    String code,          // code ដូចជា "200", "404"
    Object data,          // payload
    boolean error         // true = មានបញ្ហា
) {}
```

---

## 7. ការពន្យល់ Code លម្អិតតាម Module

### 7.1 Module `common` (Shared Library)

Library ដែលគ្រប់ services import (`com.ticket:common`) — **មិនរត់ដោយខ្លួនឯងទេ**។

| Package/Class | ប្រើសម្រាប់ | ប្រើពេលណា |
|---|---|---|
| `entity/BasedEntity` | `@MappedSuperclass` មាន `createdAt, createdBy, updatedAt, updatedBy` + `@PrePersist/@PreUpdate` auto-fill | Entity ទាំងអស់ extend វា ដើម្បី audit trail ស្វ័យប្រវត្តិ |
| `repository/BaseRepository` | Base JPA repository | Extend សម្រាប់ generic query |
| `exception/ResponseErrorTemplate` | Record — standard response wrapper | Return ពីគ្រប់ controller/service |
| `exception/BusinessException, SystemException, GlobalException` | Custom exceptions | Throw ពេល logic error; `GlobalException` = `@RestControllerAdvice` catch ទាំងអស់ |
| `criteria/*` (BaseCriteria, SearchOperation, JoinCriteria...) | Dynamic search/filter specification | ពេលធ្វើ API search មាន filter (ឧ. `/users/search`) |
| `constant/ApiConstant` | Enum សារ standard (SUCCESS, DATA_NOT_FOUND, PAYMENT_FAILED...) | គ្រប់ service ប្រើ message/code ដូចគ្នា |
| `dto/PaginationResponse, PageableRequestVO` | Pagination helpers | API list ដែលមាន page/size |

---

### 7.2 Module `user-service` (:8081) — Authentication & RBAC

**ភារកិច្ច៖** គ្រប់គ្រង User, Role, Permission, Group + JWT login/logout/refresh។

#### Entities (RBAC Model)
| Entity | អត្ថន័យ |
|---|---|
| `User` | អ្នកប្រើប្រាស់ (username, password encrypted, email...) |
| `Role` | តួនាទី (ADMIN, USER...) |
| `Permission` | សិទ្ធិលម្អិត (user:read, order:create...) |
| `Group` | ក្រុម users |
| `RefreshToken` | Token សម្រាប់ renew access token (stored in DB) |
| `CustomUserDetail` | Wrap User → `UserDetails` សម្រាប់ Spring Security |

#### Key Classes
| Class | File | ប្រើសម្រាប់ |
|---|---|---|
| `CustomSecurityFilterChain` | config/ | កំណត់ security rules: public paths (`/api/public/**`) vs protected, attach `JwtAuthenticationFilter` |
| `PasswordEncoderConfig` | config/ | Bean `BCryptPasswordEncoder` — hash password |
| `JwtConfigProperties` | config/properties/ | Bind `jwt.*` properties (secret, expiration...) type-safe |
| `JwtAuthenticationFilter` | filter/ | Intercept គ្រប់ request → parse + validate JWT → set Authentication context |
| `CustomAuthenticationProvider` | filter/ | Logic ផ្ទៀងផ្ទាត់ username/password custom |
| `CustomAccessDeniedHandler` | filter/ | Response 403 ពេល insufficient permission |
| `JwtService/JwtServiceImpl` | service/ | Generate/parse/validate JWT (sign ដោយ HMAC secret) |
| `AuthService/AuthServiceImpl` | service/ | login (authenticate + issue tokens), logout (revoke refresh token), refreshToken |
| `handle/*HandlerService` | service/handle/ | Validation handlers (check duplicate username, role exists...) |
| `impl/UserSearchServiceImpl` | service/impl/ | Dynamic search ប្រើ criteria ពី common |

#### Endpoints
```
PUBLIC  (/api/public/users):
  POST /registration      → បង្កើត account ថ្មី
  POST /login             → បាន accessToken + refreshToken
  POST /logout            → revoke refresh token
  POST /refreshToken      → access token ថ្មី
  POST /verify-token      → (internal) services ផ្សេង verify JWT

PROTECTED (/api/v1/users):  CRUD, /search, /{id}/change-password,
  /{id}/deactivate, /{id}/reset-password
PROTECTED (/api/v1/roles | permissions | groups):  RBAC management
```

---

### 7.3 Module `api-gateway` (:8080) — Single Entry Point

**ភារកិច្ច៖** ទទួល request ទាំងអស់ពី client → filter → route ទៅ service ត្រឹមត្រូវ។
(Spring Cloud Gateway = **reactive/non-blocking**, ទើបប្រើ R2DBC + WebFlux)

#### Key Classes
| Class | ប្រើសម្រាប់ | ប្រើពេលណា |
|---|---|---|
| `filter/CorrelationIdFilter` | បង្កើត/propagate `X-Correlation-ID` header | គ្រប់ request — trace log ពេញ system |
| `filter/JwtAuthenticationFilter` | `GlobalFilter` — verify JWT **locally** ដោយ shared `jwt.secret` (Jwts.parser) | គ្រប់ request ក្រៅ public paths; invalid → 401 JSON |
| `filter/RateLimitGlobalFilter` | Limit request rate per client | ការ់ការ abuse/DDOS |
| `service/Impl/RateLimiterService` | Redis-based counter/window | រួមជាមួយ RateLimitGlobalFilter |
| `filter/LoggingFilter` + `logging/GatewayLoggingProperties` | Log request/response (mask sensitive headers ដូច authorization/password) | Debugging + audit |
| `filter/PerformanceLoggingFilter`, `RequestMetricsFilter` | វាស់ latency, size | Monitoring |
| `entity/ApiRoute` + `repository/ApiRouteRepository` | **Dynamic routes** រក្សាទុកក្នុង table `api_route` (path → destination URL) | បន្ថែម route ថ្មី **ដោយមិនត្រូវ deploy ឡើងវិញ** |
| `service/Impl/GatewayRouteServiceImpl` | Publish `RefreshRoutesEvent` → Spring Cloud Gateway reload route definitions | ពេល add/update route តាម API |
| `controller/ApiRouteController` | CRUD `/api/routes` + `POST /api/routes/refresh` | គ្រប់គ្រង routing runtime |
| `entity/RequestLog` + `RequestLogServiceImpl` | Save request logs ទៅ DB | Audit trail |
| `config/WebClientConfig` | WebClient bean ហៅ user-service | Verify token (internal call) |

> 🔑 **ចំណុចសំខាន់៖** Gateway និង user-service **share `jwt.secret` ដូចគ្នា** — ធ្វើឲ្យ gateway verify token បានដោយខ្លួនឯង (fast, មិនត្រូវហៅ user-service រាល់ request)។

---

### 7.4 Module `event-service` (:8082) — Event Management

Service សាមញ្ញបំផុត — **reference implementation** នៃ layered pattern:

```
EventController (/api/v1/events)
  POST /create | PUT /{id} | GET /{id} | DELETE /{id}
     ▼
EventService → EventServiceImpl   (business logic + validation)
     ▼
EventRepository                   (JPA queries)
     ▼
Event (entity: title, description, eventType, eventStatus, date, location...)
```

| Class | ប្រើសម្រាប់ |
|---|---|
| `Enum/EventType` | ប្រភេទ event (CONCERT, SPORT...) |
| `Enum/EventStatus` | ស្ថានភាព (UPCOMING, ONGOING, CANCELLED...) |
| `mapper/EventMapper` (MapStruct) | Convert EventRequest ↔ Event ↔ EventResponse |
| `config/AppConfig` | General beans |

> 💡 ticket-service និង order-service **ហៅ service នេះ** ដើម្បី validate event មុនបន្ត។

---

### 7.5 Module `ticket-service` (:8083) — Tickets + Redis Locking

| Class | ប្រើសម្រាប់ | ប្រើពេលណា |
|---|---|---|
| `client/EventClient` | WebClient ហៅ event-service `GET /{id}` | ពេល create ticket — ពិនិត្យ event មានពិត |
| `config/WebClientConfig` | Bean WebClient | Inject ទៅ clients |
| `service/Impl/TicketServiceImpl.lockTicket()` | **Redis distributed lock** (`setIfAbsent` + TTL) → mark tickets LOCKED | ពេល user ចង់ទិញ — hold កៅអ៊ីชั่วคราว |
| `unlockTicket()` | បញ្ច្រាស — ប្រែ LOCKED → AVAILABLE | ពេល expire/cancel |
| `Enum/TicketStatus` | AVAILABLE, LOCKED, SOLD... | Track lifecycle សំបុត្រ |
| `mapper/TicketMapper` | DTO↔Entity | គ្រប់ operations |

**Endpoints:** `POST /create`, `GET /{id}`, `POST /lock`, `POST /unlock`

---

### 7.6 Module `order-service` (:8084) — Order Orchestration

Service ដែល **tie គ្រប់អ្វីៗចូលគ្នា** (orchestrator):

| Class | ប្រើសម្រាប់ | ប្រើពេលណា |
|---|---|---|
| `client/UserClient` | WebClient → user-service `/verify-token` | ពេល create/cancel — ផ្ទៀងផ្ទាត់ JWT យក username |
| `client/PaymentClient` | WebClient → payment-service | ពេល create order — process payment |
| `Config/KafkaProducerConfig` | Beans: `ProducerFactory` + `KafkaTemplate<String,Object>` (StringSerializer) | Bootstrap Kafka producer |
| `Producer/OrderConfirmedKafkaProducer` | Serialize `OrderConfirmedEvent` → JSON → send ទៅ topic `${notification.topic.order-confirmed}` | ពេល order COMPLETED — trigger notification async |
| `dto/OrderConfirmedEvent` | Event payload (orderId, email, amount...) | Message format លើ Kafka |
| `Mapper/OrderMapper` (MapStruct) | OrderRequest ↔ Order ↔ OrderResponse | គ្រប់ operations |
| `Enum/OrderStatus` | PROCESSING → COMPLETED / CANCELLED | Lifecycle |

**Flow ពេញមួយ `createOrder`:**
```
verify JWT → save(PROCESSING) → call payment → save(COMPLETED) → publish Kafka event
```
> ⚠️ TODO ក្នុង code: email/phone/eventTitle មិនទាន់ pull ពី user/event services ពិតទេ (hardcoded placeholder)។

---

### 7.7 Module `payment-service` (:8085) — Payment Processing

| Class | ប្រើសម្រាប់ |
|---|---|
| `service/PaymentServiceImpl` | ទទួល PaymentRequest → save Payment record → call gateway → update status |
| `service/PaymentGatewayServiceImpl` | **Mock payment gateway**: `switch(paymentMethod)` → CREDIT_CARD / PAYPAL / BANK_TRANSFER / CASH (ឥឡូវ return `true` — ត្រូវ integrate provider ពិត ដូចជា Stripe/ABA ពេលក្រោយ) |
| `Enum/PaymentMethod`, `PaymentStatus` | PENDING/SUCCESS/FAILED lifecycle |

---

### 7.8 Module `notification-service` (:8086) — Notification Delivery (Implemented)

Service នេះ consume Kafka event ពី order-service រួចផ្ញើ **Email ពិត (SMTP)** និង **SMS ពិត (Twilio)**：

```
Kafka consumer (OrderConfirmedEventListener)
   ▼
Parse OrderConfirmedEvent (JSON via tools.jackson ObjectMapper)
   ▼
NotificationServiceImpl.handlerOrderConfirmationEvent()
   ├─[1] save Notification (status=PENDING) → tt_notification
   ├─[2] EmailService.sendEmail()  → JavaMailSender (MimeMessage, HTML)
   └─[3] SmsService.sendSms()      → Twilio SDK (Message.creator)
   ▼
Update Notification status = SENT / FAILED
```

| Class | ប្រើសម្រាប់ |
|---|---|
| `EmailService` | `JavaMailSender` + `MimeMessageHelper` (HTML email), retry 3x ជាមួយ exponential backoff |
| `SmsService` | Twilio SDK (`com.twilio.sdk:twilio`) — ប្រសិទ្ធភាពមិនមាន credentials នឹង skip gracefully |
| `config/TwilioConfig` | `Twilio.init()` ពេល startup (បើមាន credentials) |
| `listener/OrderConfirmedEventListener` | `@KafkaListener` លើ `order-confirmed-topic` |
| `controller/AdminNotificationController` | CRUD: findAll, stats, resend, delete |

> ⚙️ **Config:** `spring.mail.*` (SMTP) + `twilio.account-sid/auth-token/phone-number` (env vars) — សុទ្ធតែ support env override។ បើគ្មាន Twilio credentials → SMS ត្រូវ skip (log warning) មិន crash app។

> 📝 **TODO:** PUSH_NOTIFICATION (`case PUSH_NOTIFICATION -> false`) នៅមិនទាន់ implement (ត្រូវបន្ថែម FCM)។ Retry ពេលនេះ manual loop — អាចបន្ថែម `@RetryableTopic` / Dead Letter Queue ពេលក្រោយ។

---

## 8. Cross-Cutting Patterns សង្ខេប

| Pattern | កន្លែងប្រើ | អត្ថប្រយោជន៍ |
|---|---|---|
| **Database per Service** | គ្រប់ services | Loose coupling — service crash មួយ មិន impact ដទៃ |
| **API Gateway / Edge Service** | api-gateway | Single entry, centralize auth/rate-limit/logging |
| **Layered Architecture** | គ្រប់ services | Separation of concerns, testable |
| **DTO + Mapper (MapStruct)** | គ្រប់ services | មិន expose entity, compile-time safety |
| **Interface + Impl** | Services | Swap implementation បានងាយ (mock ពេល test) |
| **Sync IPC (WebClient)** | order→user/payment, ticket→event | ត្រូវការចម្លើយភ្លាម |
| **Async Events (Kafka)** | order→notification | Decouple — notification down ក៏ order នៅដំណើរការ |
| **Distributed Lock (Redis)** | ticket-service | ការ់ការ race condition ពេល lock កៅអ៊ី |
| **Rate Limiting (Redis)** | api-gateway | ការពារ abuse |
| **Correlation ID** | api-gateway | Trace មួយ request ពេញ microservices |
| **Audit Fields (BasedEntity)** | គ្រប់ entities | ដឹងថា នរណា បង្កើត/កែ ពេលណា |
| **Env-var Config with Defaults** | គ្រប់ services | Deploy បានគ្រប់ environment ដោយមិនកែ code |

---

## 9. របៀប Run Project

### បុព្វការី (Prerequisites)
```bash
# 1. PostgreSQL រត់នៅ localhost:5432 (user: ticket / pass: ticket123)
#    បង្កើត databases: ticket_user_db, ticket_event_db, ticket_db,
#                      ticket_order_db, ticket_gateway_db
# 2. Kafka រត់នៅ localhost:9092
# 3. Redis រត់នៅ localhost:6379
```

### Build ទាំងមូល
```bash
./mvnw clean install
```

### Run តាមលំដាប់
```bash
./mvnw spring-boot:run -pl user-service          # 1. :8081
./mvnw spring-boot:run -pl api-gateway           # 2. :8080
./mvnw spring-boot:run -pl event-service         # 3. :8082
./mvnw spring-boot:run -pl ticket-service        # 4. :8083
./mvnw spring-boot:run -pl payment-service       # 5. :8085
./mvnw spring-boot:run -pl order-service         # 6. :8084
```

### Test End-to-End (Order Flow)
```bash
# 1. Login យក token
curl -X POST http://localhost:8080/api/public/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"...","password":"..."}'

# 2. Create order (token ពី step 1)
curl -X POST http://localhost:8080/api/v1/orders/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"eventId":1,"ticketId":1,"quantity":2,"amount":20.00}'

# 3. មើល message លើ Kafka topic
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic order-confirmed-topic --from-beginning
```

---

## 10. Known Issues / TODOs (រកឃើញក្នុង Code)

1. **notification-service** — PUSH_NOTIFICATION នៅមិនទាន់ implement (សូមមើល section 7.8); Kafka consumer នៅគ្មាន DLQ/retry topic ពេល processing fail ជាប់ៗ
2. **order-service** — `email`, `phoneNumber`, `eventTitle`, `eventLocation` ក្នុង `OrderConfirmedEvent` នៅ hardcoded (OrderServiceImpl.java:100-103) — ត្រូវ pull ពី user-service/event-service
3. **order-service pom.xml** — duplicate dependency `spring-webflux` (lines 82-88)
4. **payment-service** — gateway ជា mock (return true) — ត្រូវ integrate provider ពិត
5. **admin-service** — ប្រើ H2 in-memory + data seeder — សម្រាប់ production ត្រូវប្ដូរ PostgreSQL
6. **ddl-auto=create-drop** — data បាត់រាល់ពេល restart (dev mode); production ត្រូវប្រើ `validate` + migration tool (Flyway/Liquibase)
7. **jwt.secret** — hardcoded default ក្នុង properties — ត្រូវ inject តាម env var ពេល deploy ពិត

---

*ឯកសារនេះ generate ដោយវិភាគ source code ផ្ទាល់ — update ពេល project ផ្លាស់ប្ដូរ។*
