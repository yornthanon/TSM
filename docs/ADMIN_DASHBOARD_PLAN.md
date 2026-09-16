# Admin Dashboard — Implementation Plan

## 1. Objectives

- Provide a centralized admin interface to manage Users, Events, Tickets, Orders, Payments, and Notifications.
- Use **React + TypeScript** for the frontend.
- Keep backend implementation minimal by leveraging existing services, or introduce a lightweight aggregator if cross-cutting aggregation is needed.
- Ensure security via ADMIN role and JWT.

## 2. Approach

### Extend Existing Services (Chosen Approach)

- Add admin controllers to existing services (`user-service`, `event-service`, `order-service`, `payment-service`, `notification-service`).
- Expose endpoints under `/api/admin/**`.
- API Gateway already supports ADMIN role checks.
- Frontend talks directly to existing services via API Gateway.

## 3. Backend Plan

### 3.1 Endpoints to Implement

| Method | Path | Service | Description |
|---|---|---|---|
| GET | `/api/admin/users` | user-service | List users with search & pagination |
| GET | `/api/admin/users/:id` | user-service | User detail |
| PUT | `/api/admin/users/:id` | user-service | Update user (role/status) |
| DELETE | `/api/admin/users/:id` | user-service | Delete user |
| GET | `/api/admin/events` | event-service | List events |
| PUT | `/api/admin/events/:id` | event-service | Approve/reject event |
| GET | `/api/admin/tickets` | ticket-service | List tickets with filters |
| POST | `/api/admin/tickets/:id/lock` | ticket-service | Manual lock |
| POST | `/api/admin/tickets/:id/unlock` | ticket-service | Manual unlock |
| GET | `/api/admin/orders` | order-service | List orders with filters |
| GET | `/api/admin/orders/:id` | order-service | Order detail |
| GET | `/api/admin/payments` | payment-service | List payments |
| GET | `/api/admin/payments/stats` | payment-service | Payment statistics |
| GET | `/api/admin/notifications` | notification-service | List notifications (exists) |
| POST | `/api/admin/notifications/:id/resend` | notification-service | Resend notification (exists) |
| GET | `/api/admin/dashboard/stats` | aggregated | Dashboard aggregated data |
| GET | `/api/admin/system/health` | aggregated | Service health check |

### 3.2 Security

- Reuse existing JWT setup.
- ADMIN role required for all `/api/admin/**`.
- Gateway `JwtAuthenticationFilter` already has `isAdminPath()` logic.

### 3.3 DTOs & Validation

- Reuse `BasedDTO`, `ResponseErrorTemplate` from `common`.
- Add pagination and search criteria from `common/criteria`.

## 4. Frontend Plan

### 4.1 Tech Stack

- React 18 + TypeScript
- Vite
- React Router v6
- Axios
- TanStack Query (React Query)
- Tailwind CSS
- Recharts
- React Hook Form + Zod

### 4.2 Pages

- `/` → Dashboard
- `/users` → User management
- `/events` → Event management
- `/orders` → Order monitoring
- `/payments` → Payment stats
- `/notifications` → Notification center

### 4.3 Layout

- Sidebar navigation
- Header with user info and logout
- Protected routes

## 5. Deployment

- Frontend: Build static assets, serve via Nginx or Spring Boot.
- Backend: Add routes in API Gateway, update `docker-compose.yaml`.

## 6. Implementation Order

1. Backend admin endpoints (extend existing services).
2. Frontend setup (Vite + React + TS).
3. Auth flow (login, token storage, axios interceptor).
4. Dashboard page with stats.
5. CRUD pages (users, events, orders, payments, notifications).
6. Polish (error handling, loading states, validation).

## 7. Open Questions

- Decide on hosting strategy for frontend (Nginx vs embedded in Spring Boot).
- Confirm ADMIN user seed data and credentials.
