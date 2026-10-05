# TSM Platform Access, Tenancy, OAuth, and ERD Guide

**Audience:** Future maintainers, reviewers, and deployment operators  
**Repository:** `yornthanon/TSM`  
**Last reviewed:** 2026-10-05  
**Current production model:** Render static frontend + Render Spring Boot monolith + Neon PostgreSQL

---

## 1. Executive summary

TSM uses a **workspace-per-Google-account** tenancy model:

> One verified Google account receives one local user account, one private workspace, and one isolated dashboard.

The configured platform administrator is different:

> The allowlisted platform `ADMIN` has global visibility across users, workspaces, events, tickets, orders, payments, and notification records.

The effective security boundary is always the backend. Frontend route guards and hidden buttons are UX controls only.

### Verified current behavior

- `ADMIN` is global and can open the platform-wide Users, Workspaces, Access, System, Dashboard, Events, Inventory, Orders, and Payments views.
- `TENANT_ADMIN` is isolated to its own active workspace and can manage tenant events, tickets, and permitted operational actions.
- `USER` is isolated to its own workspace and is read-oriented, with only explicitly permitted user actions such as ordinary order cancellation.
- New non-admin Google accounts are provisioned with a new active workspace and `TENANT_ADMIN` role.
- Existing Google accounts are linked by stable Google `sub` first, then case-insensitive email, with role/workspace reconciliation.
- Tenant Admin dashboard queries no longer call the platform-admin-only notification statistics endpoint.

### Important intentional constraints

1. **Admin event mutations require a selected workspace context.** The backend accepts `ADMIN` for tenant-admin operations, but the frontend hides direct create/edit controls for global Admin. Use the audited **act-as workspace** flow or an explicit trusted workspace context.
2. **Admin ordinary order cancel is not the same as force-cancel.** `ADMIN` uses the platform `force-cancel` operation; ordinary `/orders/{id}/cancel` is intended for `USER` and `TENANT_ADMIN`.
3. **Notifications are platform-admin-only in the current policy.** Tenant Admin must not call `/api/v1/admin/notifications/**`.

---

## 2. Role model

| Role | Scope | Dashboard | Manage own workspace | Platform-wide management |
|---|---|---|---|---|
| `ADMIN` | Global, unless intentionally acting as a workspace | Yes, all-workspace overview | Via act-as/selected workspace | Users, workspaces, access, system, notifications, global reporting |
| `TENANT_ADMIN` | One active workspace | Yes, own workspace | Events, tickets, permitted orders/payments | No |
| `USER` | One active workspace | Yes, read-oriented own workspace | Only explicitly allowed user actions | No |
| `INTERNAL_SERVICE` | Service-to-service only | Not a browser role | Internal routes only | No browser access |

### Role precedence in the frontend

`frontend-admindashboard/src/lib/auth.ts` maps backend authorities to one UI role with this precedence:

1. `ADMIN`
2. `TENANT_ADMIN`
3. `USER`

Backend authorities use the same names. Do not introduce `ROLE_ADMIN` or `ROLE_TENANT_ADMIN` unless every matcher and frontend mapper is updated together.

---

## 3. Frontend route and feature policy

Source: `frontend-admindashboard/src/App.tsx`, `AdminLayout.tsx`, and `RequireAuth.tsx`.

| Frontend route | `USER` | `TENANT_ADMIN` | `ADMIN` | Notes |
|---|---:|---:|---:|---|
| `/admin` | Yes | Yes | Yes | Dashboard; data scope comes from backend |
| `/admin/events` | Yes/read | Yes/manage | Yes/global view | Admin mutations should use workspace context/act-as |
| `/admin/events/:id` | Yes/read | Yes/manage | Yes/global/read | Approve/reject mutation requires workspace context |
| `/admin/inventory` | Yes/read | Yes/manage | Yes/global/read | Admin mutation through workspace context |
| `/admin/orders` | Yes/read/allowed cancel | Yes/allowed cancel | Yes/global/force-cancel | See order cancellation distinction |
| `/admin/payments` | Yes/read | Yes/read/refund policy | Yes/global/read | Refund requires tenant admin or Admin policy |
| `/admin/notifications` | No | No | Yes | Backend endpoint is platform-admin-only |
| `/admin/users` | No | No | Yes | Platform user directory |
| `/admin/access` | No | No | Yes | Roles, groups, permissions |
| `/admin/system` | No | No | Yes | Platform system page |
| `/admin/workspaces` | No | No | Yes | Global workspace list/status |

`RequireAuth` only checks whether an access token exists. It does **not** prove that the role is valid. Backend authentication and authorization must remain authoritative.

### Dashboard read endpoints

These are intentionally available to all application roles; the backend tenant scope controls the returned rows:

| Endpoint | `USER` | `TENANT_ADMIN` | `ADMIN` |
|---|---:|---:|---:|
| `GET /api/v1/events/stats` | Allow | Allow | Global |
| `GET /api/v1/tickets/stats` | Allow | Allow | Global |
| `GET /api/v1/orders/stats` | Allow | Allow | Global |
| `GET /api/v1/payments` | Allow | Allow | Global |
| `GET /api/v1/payments/revenue-summary` | Allow | Allow | Global |
| `GET /api/v1/workspaces/current` | Own workspace | Own workspace | Selected/current workspace |
| `GET /api/v1/admin/overview/workspaces` | Deny | Deny | Global overview |
| `GET /api/v1/admin/notifications/stats` | Deny | Deny | Allow |

The frontend must keep `useNotificationStats` disabled for non-Admin users. A forbidden admin-only query must not be included in the combined tenant dashboard loading/error state.

---

## 4. Backend authorization matrix

Primary source: `user-service/src/main/java/com/ticket/userservice/config/CustomSecurityFilterChain.java`. Defense-in-depth source: `common/src/main/java/com/ticket/common/security/ServiceRoleAuthorizationFilter.java`.

### Profile and workspace

| Route | Allowed |
|---|---|
| `/api/v1/users/me` | `USER`, `TENANT_ADMIN`, `ADMIN` |
| `/api/v1/users/me/mfa/**` | `USER`, `TENANT_ADMIN`, `ADMIN` |
| `GET /api/v1/workspaces/current` | `USER`, `TENANT_ADMIN`, `ADMIN` |
| `GET /api/v1/users/**` | `ADMIN`, `INTERNAL_SERVICE` |
| Other `/api/v1/users/**` mutations | `ADMIN`, `INTERNAL_SERVICE` |

### Tenant operations

| Operation | Allowed |
|---|---|
| Event create/update/delete | `TENANT_ADMIN`, `ADMIN` |
| Event approve/reject | `TENANT_ADMIN`, `ADMIN` |
| Ticket create/update/delete/unlock | `TENANT_ADMIN`, `ADMIN` |
| Order force-cancel | `TENANT_ADMIN`, `ADMIN` |
| Ordinary order cancel | `USER`, `TENANT_ADMIN` |
| Admin order cancel route | `TENANT_ADMIN`, `ADMIN` |
| Payment refund | `TENANT_ADMIN`, `ADMIN` |

### Platform operations

The generic platform route rule is:

```text
/api/v1/admin/** and /api/admin/** -> ADMIN only
```

Specific event/order exceptions appear before the generic rule and must remain before it. Do not reorder these matchers casually.

Platform-only groups:

```text
/api/v1/roles/**
/api/v1/groups/**
/api/v1/permissions/**
/api/v1/admin/users/**
/api/v1/admin/workspaces/**
/api/v1/admin/notifications/**
/api/v1/admin/overview/**
```

### Why the recent Tenant Admin dashboard bug occurred

The dashboard called `/api/v1/admin/notifications/stats` for every role. The backend correctly returned `403` to a Tenant Admin, but the frontend aggregated that error with the normal dashboard queries and displayed a full-page error. The fix is frontend-side: only `ADMIN` enables that query and sees the notification card/menu.

---

## 5. Tenant isolation and global Admin scope

### Request flow

1. `JwtAuthenticationInternalFilter` validates the bearer token and loads the user principal.
2. `TenantScopeFilter` runs after authentication.
3. For `USER` and `TENANT_ADMIN`, tenant ID comes from the authenticated principal, not from a client-supplied header.
4. The workspace must exist and be `ACTIVE`.
5. `TenantContextHolder` stores the request tenant context in a `ThreadLocal`.
6. Hibernate `tenantFilter` is enabled with the tenant ID.
7. The context and filter state are cleared in `finally`.

### Platform Admin behavior

For an allowlisted `ADMIN`:

- No tenant header means global/platform scope.
- The tenant Hibernate filter is not enabled.
- `TenantContextHolder.isPlatformAdmin()` is true.
- Global JPA queries can see all workspaces.
- A trusted `X-Tenant-Id` header can select a workspace when an Admin performs a workspace-specific operation.

### Safety requirements

- Never trust `X-Tenant-Id` from a normal user request.
- Only Admin/internal service paths may select a tenant by trusted header.
- Do not create tenant-owned entities in global Admin scope; select a workspace or use act-as first.
- Always clear `TenantContextHolder` in a `finally` block.
- Any new service with direct JPA access must install equivalent tenant context/filter behavior; `@Filter` annotations alone are not a complete request policy.

### Tenant-scoped entities

The following entities use the tenant filter:

- `users`
- `event`
- `tt_ticket`
- `tt_order`
- `tt_payment`
- `tt_notification`

`tenant_workspaces` is intentionally global metadata. Its list/status endpoints are protected by `ADMIN` authorization.

### Global Admin overview

`AdminWorkspaceOverviewService` intentionally uses global aggregate SQL over `tenant_workspaces` and counts/sums users, events, tickets, orders, payments, and completed payments by workspace. This is the correct source for platform-wide workspace totals.

---

## 6. Google OAuth and workspace lifecycle

### Login flow

```text
Browser
  -> Google authorization
  -> Spring OAuth success handler
  -> verified email + stable Google sub validation
  -> OAuthLoginCodeService resolves/creates local account
  -> one-time hashed OAuth login code
  -> frontend /api/v1/auth/oauth/exchange
  -> access token + refresh token
  -> /api/v1/users/me
  -> /admin dashboard
```

### Existing account resolution

1. Stable Google `sub` is checked first.
2. Case-insensitive email is checked next.
3. Conflicting Google subjects are rejected to prevent account takeover.
4. Legacy accounts without a Google subject may be linked after verified Google login.
5. The allowlisted platform email remains the canonical Admin identity.

### New account provisioning

For a non-allowlisted Google account:

- Create a unique sanitized username.
- Store verified email and Google subject.
- Set status `ACTIVE`.
- Initialize login attempts.
- Assign `USER` and `TENANT_ADMIN`.
- Create one new `ACTIVE` workspace.
- Set `users.tenant_id`.
- Set `tenant_workspaces.owner_user_id`.

### Eligibility checks

A Google account must have:

- verified Google email;
- nonblank stable Google subject;
- local user status `ACTIVE`;
- login attempts within the configured maximum;
- an active workspace for tenant users;
- valid MFA code when MFA is enabled.

OAuth handoff codes are hashed, short-lived, one-time-use codes. Replay, expiry, or an ineligible account must not mint tokens.

---

## 7. ERD and relationships

The diagram below distinguishes database-enforced foreign-key relationships from logical cross-service references. Dotted lines are intentional application-level references where the migrations do not declare SQL foreign keys.

```mermaid
erDiagram
    USERS {
        BIGSERIAL id PK
        VARCHAR username UK
        VARCHAR email
        VARCHAR google_subject UK_NULLABLE
        BIGINT tenant_id FK_NULLABLE
        VARCHAR status
        BOOLEAN mfa_enabled
        INTEGER login_attempts
        INTEGER max_attempts
    }
    ROLES {
        BIGSERIAL id PK
        VARCHAR name UK
        VARCHAR status
    }
    PERMISSIONS {
        BIGSERIAL id PK
        VARCHAR name UK
        VARCHAR status
    }
    GROUPS {
        BIGSERIAL id PK
        VARCHAR name UK
        VARCHAR status
    }
    TENANT_WORKSPACES {
        BIGSERIAL id PK
        VARCHAR name
        VARCHAR status
        BIGINT owner_user_id FK_NULLABLE UK
    }
    EVENTS {
        BIGSERIAL id PK
        BIGINT tenant_id FK
        VARCHAR title
        TIMESTAMP event_date
        NUMERIC base_price
        INTEGER capacity
    }
    TT_TICKET {
        BIGSERIAL id PK
        BIGINT tenant_id FK
        BIGINT event_id
        VARCHAR seat_number
        VARCHAR ticket_status
        NUMERIC price
    }
    TT_ORDER {
        BIGSERIAL id PK
        BIGINT tenant_id FK
        VARCHAR username
        BIGINT ticket_id
        BIGINT event_id
        BIGINT payment_id
        NUMERIC amount
        INTEGER quantity
        VARCHAR idempotency_key
    }
    TT_PAYMENT {
        BIGSERIAL id PK
        BIGINT tenant_id FK
        BIGINT order_id
        VARCHAR username
        VARCHAR transaction_id UK
        VARCHAR payment_status
        NUMERIC amount
    }
    TT_NOTIFICATION {
        BIGSERIAL id PK
        BIGINT tenant_id FK
        VARCHAR username
        VARCHAR email
        BIGINT order_id
        VARCHAR notification_status
    }
    OAUTH_LOGIN_CODES {
        VARCHAR code_hash PK
        BIGINT user_id FK
        TIMESTAMP expires_at
        TIMESTAMP consumed_at
    }
    REFRESH_TOKEN {
        BIGSERIAL id PK
        VARCHAR token UK
        TIMESTAMP expiry_date
        BIGINT user_id FK UK
    }
    USER_ROLES {
        BIGINT user_id PK,FK
        BIGINT role_id PK,FK
    }
    USER_GROUPS {
        BIGINT user_id PK,FK
        BIGINT group_id PK,FK
    }
    GROUP_ROLES {
        BIGINT group_id PK,FK
        BIGINT role_id PK,FK
    }
    GROUP_PERMISSIONS {
        BIGINT group_id PK,FK
        BIGINT permission_id PK,FK
    }
    ROLE_PERMISSIONS {
        BIGINT role_id PK,FK
        BIGINT permission_id PK,FK
    }

    TENANT_WORKSPACES o|--o| USERS : owns
    TENANT_WORKSPACES ||--o{ USERS : scopes
    TENANT_WORKSPACES ||--o{ EVENTS : scopes
    TENANT_WORKSPACES ||--o{ TT_TICKET : scopes
    TENANT_WORKSPACES ||--o{ TT_ORDER : scopes
    TENANT_WORKSPACES ||--o{ TT_PAYMENT : scopes
    TENANT_WORKSPACES ||--o{ TT_NOTIFICATION : scopes

    USERS ||--o{ USER_ROLES : assigned
    ROLES ||--o{ USER_ROLES : contains
    USERS ||--o{ USER_GROUPS : member
    GROUPS ||--o{ USER_GROUPS : contains
    GROUPS ||--o{ GROUP_ROLES : grants
    ROLES ||--o{ GROUP_ROLES : included
    GROUPS ||--o{ GROUP_PERMISSIONS : grants
    PERMISSIONS ||--o{ GROUP_PERMISSIONS : included
    ROLES ||--o{ ROLE_PERMISSIONS : grants
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : included

    USERS ||--o{ OAUTH_LOGIN_CODES : authenticates
    USERS ||--o| REFRESH_TOKEN : owns

    EVENTS ||..o{ TT_TICKET : has
    EVENTS ||..o{ TT_ORDER : ordered_for
    TT_TICKET o|..o{ TT_ORDER : references
    TT_ORDER ||..o{ TT_PAYMENT : paid_by
    TT_ORDER ||..o{ TT_NOTIFICATION : notifies
    USERS ||..o{ TT_ORDER : identified_by_username
    USERS ||..o{ TT_PAYMENT : identified_by_username
    USERS ||..o{ TT_NOTIFICATION : identified_by_username
```

### Relationship notes

- `users` to `roles`, `groups`, and the permission graph are many-to-many association tables with composite keys and cascade deletes.
- `tenant_workspaces.owner_user_id` is unique, so one user owns at most one workspace through this relationship.
- `users.tenant_id` is nullable to support the global platform Admin account.
- Events, tickets, orders, payments, and notifications require tenant ownership.
- `tt_ticket.event_id`, `tt_order.ticket_id`, `tt_order.event_id`, `tt_order.payment_id`, `tt_payment.order_id`, and `tt_notification.order_id` are logical service references in the current migrations; several are not SQL foreign keys.
- `refresh_token.user_id` is unique, so each user has at most one refresh-token row.
- `oauth_login_codes.user_id` cascades when a user is deleted; expired/consumed codes must not be reusable.
- `tt_order(username, idempotency_key)` has a partial unique index when `idempotency_key` is non-null.

### Additional operational tables

The repository also contains `admin_act_as_sessions` and `admin_act_as_audit`. These are used for audited platform-admin workspace access and should be included in a future ERD revision if act-as reporting becomes a primary data-model concern.

---

## 8. Database migration map

| Version | Area | Purpose |
|---|---|---|
| V1 | user-service | Users, roles, groups, permissions, association tables, refresh tokens |
| V2 | event-service | Event baseline |
| V3 | event-service | Event image URL |
| V4 | ticket-service | Ticket baseline |
| V5 | order-service | Order baseline |
| V6 | payment-service | Payment baseline |
| V7 | notification-service | Notification baseline |
| V8 | user-service | MFA fields/data |
| V9 | user-service | OAuth login codes |
| V10+ | app-monolith | Tenant workspaces and isolation |
| V13 | order-service | Order idempotency index; renamed to avoid duplicate Flyway version |

Always inspect the active migration locations before adding a new migration. Never reuse a version already present in the production database.

---

## 9. Current findings and maintenance decisions

### No remaining Tenant Admin dashboard authorization defect found

The Dashboard read endpoints are correctly available to the three application roles, and the only accidental admin-only call was the notification statistics request. That call is now disabled for non-Admin roles.

### Intentional Admin event-mutation UI restriction

The backend permits Admin for event mutation, but direct global Admin creation is unsafe without a workspace. The frontend therefore exposes mutation controls to `TENANT_ADMIN` and expects platform Admin to use the audited act-as flow. Do not “fix” this by allowing global event creation without a selected tenant.

### Intentional order cancellation distinction

- Ordinary cancel: `USER` and `TENANT_ADMIN`.
- Force-cancel: `TENANT_ADMIN` and `ADMIN`.

If product requirements later say platform Admin should cancel ordinary orders directly, update both the Spring matcher and `ServiceRoleAuthorizationFilter`, then add tests. Do not change only the frontend.

### High-priority future review items

1. Verify every separately deployed microservice installs tenant context/filter behavior, not only the monolith path.
2. Add or verify explicit `@FilterDef(name = "tenantFilter")` bootstrap configuration for every service using `@Filter`.
3. Confirm the fresh-database migration chain contains `google_subject`, `tenant_id`, and workspace constraints in the actual production migration locations.
4. Consider database uniqueness/locking for concurrent first-login account/workspace provisioning.
5. Keep platform Admin deletion/deactivation protection aligned with `PLATFORM_ADMIN_EMAILS`.
6. Add frontend automated tests; the repository currently relies on `npm run lint` and `npm run build` for frontend validation.

---

## 10. Verification and release checklist

### Local checks

```bash
# Frontend
cd frontend-admindashboard
npm run lint
npm run build

# Backend/common authorization tests
cd ..
./mvnw -pl common -am -Dtest=ServiceRoleAuthorizationFilterTest test

# Broader Java suite when infrastructure is available
./mvnw test
```

### Production checks after a deploy

1. Confirm Render deployment is `live`.
2. Confirm `GET https://tsm-7hu8.onrender.com/actuator/health` returns `UP`.
3. Open the frontend in a clean/incognito session.
4. Login as a tenant Google account.
5. Confirm `/api/v1/users/me` returns the expected role and tenant ID.
6. Confirm Dashboard loads without a 401/403 loop.
7. Confirm a tenant account cannot see another workspace's event/order/payment data.
8. Login as platform Admin.
9. Confirm Users and Workspaces show all accounts/workspaces.
10. Confirm Admin Dashboard totals include all workspaces.
11. Confirm Admin can use act-as to manage a selected workspace.
12. Confirm suspended workspace access returns `403` for non-Admin users.
13. Confirm Notifications is visible only to Admin.
14. Review Render logs for OAuth, JWT, CORS, Flyway, and tenant-scope errors.

### Required production environment variables

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET` (stable Base64 key of sufficient length)
- `JWT_REFRESH_TOKEN_EXPIRATION`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APP_FRONTEND_URL`
- `PLATFORM_ADMIN_EMAILS`
- `INTERNAL_AUTH_TOKEN`
- `VITE_API_BASE_URL` (frontend build-time value ending in `/api/v1`)
- `CLOUDINARY_URL` for event image uploads

Do not commit secret values. Keep `PLATFORM_ADMIN_EMAILS` and `APP_FRONTEND_URL` synchronized with the intended production frontend.

---

## 11. Primary source files

### Frontend

- `frontend-admindashboard/src/App.tsx`
- `frontend-admindashboard/src/components/RequireAuth.tsx`
- `frontend-admindashboard/src/lib/auth.ts`
- `frontend-admindashboard/src/lib/api.ts`
- `frontend-admindashboard/src/layouts/AdminLayout.tsx`
- `frontend-admindashboard/src/pages/admin/Dashboard.tsx`
- `frontend-admindashboard/src/hooks/useApi.ts`

### Backend authorization and tenancy

- `user-service/src/main/java/com/ticket/userservice/config/CustomSecurityFilterChain.java`
- `user-service/src/main/java/com/ticket/userservice/filter/JwtAuthenticationInternalFilter.java`
- `user-service/src/main/java/com/ticket/userservice/filter/TenantScopeFilter.java`
- `common/src/main/java/com/ticket/common/security/ServiceRoleAuthorizationFilter.java`
- `common/src/main/java/com/ticket/common/tenant/TenantContextHolder.java`
- `common/src/main/java/com/ticket/common/entity/TenantScopedEntity.java`
- `user-service/src/main/java/com/ticket/userservice/service/AdminWorkspaceOverviewService.java`

### OAuth and workspace lifecycle

- `user-service/src/main/java/com/ticket/userservice/security/GoogleOAuthLoginHandler.java`
- `user-service/src/main/java/com/ticket/userservice/service/OAuthLoginCodeService.java`
- `user-service/src/main/java/com/ticket/userservice/service/handle/CustomUserDetailService.java`
- `user-service/src/main/java/com/ticket/userservice/service/TenantWorkspaceService.java`

### Regression tests

- `common/src/test/java/com/ticket/common/security/ServiceRoleAuthorizationFilterTest.java`
- `user-service/src/test/java/com/ticket/userservice/filter/TenantScopeFilterTest.java`
- `user-service/src/test/java/com/ticket/userservice/service/OAuthLoginCodeServiceTest.java`
- `user-service/src/test/java/com/ticket/userservice/security/GoogleOAuthLoginHandlerTest.java`

### Deployment

- `Deployment/TSM_RENDER_DEPLOYMENT.md`
- `.env.example`
- `frontend-admindashboard/.env.example`
- `app-monolith/src/main/resources/application.properties`

---

## 12. Change-control rule for future maintainers

When changing a role or endpoint:

1. Update the backend Spring matcher.
2. Update `ServiceRoleAuthorizationFilter`.
3. Update frontend route/button visibility.
4. Update the role matrix in this document.
5. Add or update role tests for `USER`, `TENANT_ADMIN`, and `ADMIN`.
6. Run frontend lint/build and relevant Maven tests.
7. Verify both tenant isolation and platform-admin global visibility in production.
8. Deploy and inspect Render health/logs before declaring complete.

Never treat a hidden frontend button as authorization. Never grant a global Admin write path without an explicit workspace context.
