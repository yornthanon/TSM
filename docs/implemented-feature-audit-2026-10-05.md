# Implemented Feature Audit — 2026-10-05

## Scope

This audit checks only the features listed as already implemented:

1. Event create/upload
2. API error handling
3. User pagination
4. Notification resend/delete
5. Admin event/ticket/order/payment authorization
6. Ticket lock/unlock
7. Frontend permissions
8. Event error display

No new feature scope was added.

## Verification limits

- Frontend production build: **passed**.
- Frontend lint: **passed with 1 warning** in `Events.tsx` for React Hook Form `watch()` being an incompatible library API; no lint errors.
- Maven backend tests: **not executed successfully**. Maven failed at `common` compilation with `release version 21 not supported`, even though the shell currently reports Java 21. This is a build/toolchain environment mismatch and means backend test results are not available.
- PostgreSQL/Docker end-to-end test: **not possible in this sandbox** because `docker` and `pg_isready` are unavailable. Production upload/create with a real admin login was therefore not verified.

## Summary table

| Feature | Current result | Status |
|---|---|---|
| Event create/upload | Implemented with frontend validation, backend image validation, tenant check, Cloudinary upload, and unit tests. Real production E2E is still unverified. | **Implemented, E2E incomplete** |
| API error handling | Most event/ticket/order/payment/notification controllers always return HTTP 200, even when the envelope says `is_error=true`. | **Error remains** |
| User pagination | Backend returns `content/totalElements/...`; frontend converts only the current page to an array and paginates locally. Total/page count can still be wrong for more than one backend page. | **Error remains** |
| Notification resend/delete | Admin-intended route is under `/api/v1/notifications`, not an admin path; any authenticated user can reach it in the monolith. Failed resend is returned as a successful response. Delete exists in backend but is not wired in the dashboard UI. | **Security and completeness errors** |
| Admin event/ticket/order/payment | Gateway/user-service rules protect admin paths, but the individual services have no Spring Security dependency/filter. Direct service access can bypass gateway-only authorization. | **Security gap remains** |
| Ticket lock/unlock | Explicit lock uses database pessimistic locking and clears expired locks only when another lock request runs. Checkout/order creation never acquires or releases a ticket lock and never marks a ticket SOLD. | **Incomplete / correctness error** |
| Frontend permissions | Platform-admin-only pages are route guarded and tenant-admin actions are mostly hidden. Notifications remain visible to all authenticated roles and resend has no frontend role guard. | **Partially fixed; gap remains** |
| Event error display | Business-envelope errors are converted to frontend errors and displayed by toast/query states. Framework errors and HTTP-200 failures are not consistently normalized; production logged-in E2E is unverified. | **Partially implemented** |

## Detailed findings

### 1. Event create/upload

**What is implemented**

- `POST /api/v1/events/upload-photo` accepts multipart data.
- Backend checks missing file, 5 MiB limit, workspace/tenant context, MIME type, and binary signature for JPEG/PNG/WebP.
- Cloudinary upload uses a workspace-specific folder and validates that the returned URL is HTTPS.
- Frontend checks file type and size, preserves the multipart boundary, uploads first, then submits the event with the returned URL.
- Unit tests cover missing files, oversize files, missing tenant, invalid binary, MIME mismatch, and missing Cloudinary configuration.

**What is not complete**

- The real flow with a logged-in production admin/TENANT_ADMIN, tenant context, `CLOUDINARY_URL`, and PostgreSQL has not been verified.
- The local sandbox has no Docker/PostgreSQL tooling, so this cannot be called a passing E2E feature yet.
- The frontend build is green, but lint reports one non-blocking React Hook Form warning at `Events.tsx:404`.

**Conclusion:** implementation exists and the unit-level validation is strong; production E2E remains open, not proven broken.

### 2. API error handling

**Confirmed defect**

The service controllers wrap both success and failure envelopes with `ResponseEntity.ok(...)`. This is visible in event, ticket, order, payment, and notification controllers. Therefore a missing record or business rejection can be returned as:

- HTTP status: `200 OK`
- Body: `is_error: true`

This breaks clients, monitoring, caching, and standard HTTP behavior. The frontend currently compensates by inspecting `is_error`, but that does not fix API semantics for other clients.

**Conclusion:** **error remains**. Map error codes to appropriate HTTP statuses such as 400, 401, 403, 404, 409, 422, and 500, preferably through a shared exception/response policy.

### 3. User pagination

**Confirmed defect**

The backend returns a pageable object using fields such as `content`, `totalElements`, `totalPages`, `pageNumber`, and `pageSize`. The dashboard hook `useUsers()` calls `toArray()` and returns only an array. `Users.tsx` then uses `usePagedRows(filtered, 10)` on that already fetched array.

Consequences:

- If the backend returns its default page, the frontend sees only that page.
- The pager total is based on the current page, not `totalElements`.
- Search and status filtering are only applied to the loaded page.
- A user directory with more records than the backend page size will show incorrect page/total behavior.

**Conclusion:** **the old field mismatch was partially hidden, not actually solved**. Either preserve the complete pagination metadata in the API hook and drive server-side pagination, or intentionally request all users and remove the backend pageable contract.

### 4. Notification resend/delete

**Confirmed security defect**

`AdminNotificationController` is mapped to `/api/v1/notifications`, not an admin-only route. The current user-service rules do not restrict this path to ADMIN/TENANT_ADMIN, and notification-service itself has no Spring Security dependency. In the monolith, any authenticated user can reach the list, stats, resend, and delete operations.

**Confirmed behavior defect**

`NotificationServiceImpl.resend()` sets the status to FAILED when delivery fails but still returns a `SUCCESS` response with `is_error=false`. The frontend therefore shows “Notification queued for resend” even when the retry actually failed.

**Completeness gap**

- Backend `DELETE /api/v1/notifications/{id}` exists.
- The dashboard has a resend action but no delete hook/button.

**Conclusion:** **security and behavior errors remain; delete is not complete end-to-end**.

### 5. Admin event/ticket/order/payment authorization

**Current positive change**

The user-service gateway rules now protect `/api/v1/admin/**` and `/api/admin/**` with ADMIN, and tenant-management mutations use TENANT_ADMIN rules. The former broad USER access to `/api/v1/users/**` writes is also restricted in the current security configuration.

**Remaining security gap**

Event, ticket, order, payment, and notification service POMs do not include Spring Security, and those services do not independently validate the caller role. Direct access to a service port can therefore bypass the gateway/user-service authorization boundary.

This is defense-in-depth failure and becomes a real authorization bypass whenever a service port is reachable outside the gateway or a route is misconfigured.

**Conclusion:** **gateway authorization is improved, but service-level authorization is not complete**.

### 6. Ticket lock/unlock

**What works**

- The explicit bulk lock path uses `@Transactional` and pessimistic-write repository queries.
- Expired `LOCKED` tickets are reset to `AVAILABLE` when a new bulk lock request runs.
- Admin lock/unlock handlers exist.

**Confirmed correctness gaps**

- `OrderServiceImpl.createOrder()` never calls ticket-service to acquire a lock.
- Successful checkout never changes the ticket to `SOLD`.
- Payment failure returns early and does not mark the order FAILED or release inventory.
- There is no scheduled expiry/release worker; an expired lock may remain stored until another lock request triggers cleanup.
- `unlockTicket(eventId, quantity)` releases arbitrary locked tickets for an event rather than a lock owned by a specific checkout/user.

**Conclusion:** **the locking feature exists as an isolated API but is not integrated safely into checkout**. The requirement “payment failure/checkout timeout cannot leave tickets permanently locked” is not met.

### 7. Frontend permissions

**What works**

- Users, access control, system, and workspace pages are wrapped with a platform-admin route guard.
- Event/inventory mutation buttons are hidden unless the active role is TENANT_ADMIN.
- Payment refunds are hidden/disabled outside the allowed tenant-admin context and blocked during act-as sessions.

**Remaining gap**

- The notifications page is available to every authenticated role through `App.tsx`.
- The notification page always renders the resend action; there is no role check before the mutation.
- This matches the backend route weakness rather than preventing it.

**Conclusion:** **partially fixed**. Frontend hiding improves UX but cannot replace backend authorization, and notification permissions are still too broad.

### 8. Event error display

**What works**

- Axios rejects service responses where `is_error=true`.
- Event create/update/upload mutations show `toast.error(error.message)`.
- Query pages display query errors and provide retry actions.
- The frontend build passes.

**Remaining gap**

- HTTP 200 business failures remain semantically wrong for non-dashboard clients.
- Spring `ResponseStatusException`/framework error bodies do not necessarily use the project’s `{message, code, data, is_error}` envelope, so some upload failures may surface as generic or JSON-string error text.
- Logged-in production create/upload has not been tested end-to-end.

**Conclusion:** **frontend handling is present but not fully normalized across all backend error sources**.

## Highest-priority remaining issues

1. **P0/P1 — Checkout safety:** derive amount server-side, integrate ticket reservation/SOLD transition, release on payment failure/timeout, and add idempotency.
2. **P1 — Authorization:** enforce role/tenant checks inside every service, not only at the gateway.
3. **P1 — Notification authorization:** move admin operations to an admin route or add explicit method security; fix resend failure response; add/delete UI if delete is intended.
4. **P1 — HTTP status contract:** stop returning HTTP 200 for business errors.
5. **P1 — Pagination contract:** pass backend metadata through the hook and implement server-side page/search/filter behavior.
6. **P2 — Verification:** run Maven with a consistent Java 21 toolchain, start PostgreSQL/Redis/Cloudinary-compatible configuration, and execute logged-in event upload/create E2E tests.

## Verification commands/results

```text
npm run build  -> PASS
npm run lint   -> PASS with 1 warning, 0 errors
./mvnw -q test -> BLOCKED at common compilation:
                 Fatal error compiling: error: release version 21 not supported
```
