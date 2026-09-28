# Security & Correctness Findings

> Every finding below was **reproduced against the running stack**
> (`docker compose up --build app`, monolith on `:8080`) on 2026-09-28.
> Reproduction steps are included so each one can be re-verified.
>
> The checkout path is not safe to expose. Findings S1 and S2 are the priority.

---

## S1 — CRITICAL: the client controls the price paid

`order-service/.../service/OrderServiceImpl.java:78`

```java
paymentRequest.setAmount(orderRequest.getAmount());   // straight from the request body
```

`OrderRequest.amount` is a client-supplied `BigDecimal` that is forwarded
verbatim to the payment service. The server never reads `Ticket.price`.

**Reproduced** — one `price: 50.00` VIP seat, request body `"amount":0.01`:

```
POST /api/v1/orders  {"eventId":1,"ticketId":1,"quantity":1,"amount":0.01,...}
-> {"orderStatus":"COMPLETED","paymentId":"1",...}
GET  /api/v1/payments/1
-> {"amount":0.01,"paymentStatus":"COMPLETED",...}
```

A $50 ticket sells for one cent, and the payment ledger records the fraudulent
amount as legitimate. Any client can do this with `curl`.

**Fix:** derive the amount server-side from the ticket record inside the same
transaction. Reject the request if a supplied amount disagrees with the computed
total. Never persist a client-supplied figure.

## S2 — CRITICAL: no inventory tracking; a seat sells unlimited times

Ordering does not validate availability and never mutates ticket state. After a
`COMPLETED` order the seat is still reported as sellable:

```
POST /api/v1/orders (ticketId 1)  -> COMPLETED, paymentId 1
GET  /api/v1/tickets/1            -> {"ticketStatus":"AVAILABLE","lockedBy":null,"lockedUntil":null}
GET  /api/v1/tickets/stats        -> {"total":1,"byStatus":{"AVAILABLE":1}}
```

Buying the same seat three times in a row all succeed:

```
POST /api/v1/orders (ticketId 1)  -> order 1 COMPLETED, payment 1, 0.01
POST /api/v1/orders (ticketId 1)  -> order 2 COMPLETED, payment 2, 0.01
POST /api/v1/orders (ticketId 1)  -> order 3 COMPLETED, payment 3, 0.01
GET  /api/v1/orders/stats
-> {"total":3,"byStatus":{"COMPLETED":3},"totalAmount":0.03}
```

Three completed orders and three payments for a single physical seat. The Redis
lock endpoints exist (`/lock`, `/unlock`) but the **order path never calls
them**, so the locking mechanism is entirely bypassed by the main flow.

**Fix:** acquire the Redis lock inside order creation, transition the seat to
`SOLD` on success, and release it on payment failure. Enforce the seat's
uniqueness at the database level too (partial unique index on
`event_id, seat_number` where status is not cancelled) so a race cannot oversell.

## S3 — HIGH: payment failure leaves the order stuck in PROCESSING

`OrderServiceImpl` returns early on payment failure without compensation:

```java
if (paymentResponse == null || paymentResponse.isError()) {
    log.error("Payment processing failed for order ID: {}", order.getId());
    return new ResponseErrorTemplate(... PAYMENT_FAILED ..., true);
}
```

The order was already persisted as `PROCESSING` on the line above. Nothing sets
it to `FAILED` and nothing releases inventory, so the order stays `PROCESSING`
forever. This is the plan's "Payment failure cannot leave tickets permanently
locked" requirement, unmet.

## S4 — HIGH: no idempotency on checkout or payment

Repeated submits with the same request each create a new order and a new
payment. `transactionId` is derived as `<username>_<uuid>`
(`admin_0d070660-...`), which is not an idempotency key. Network retries and
double-clicks duplicate orders, and the plan's "Duplicate checkout idempotency
returns the same order" requirement is unmet.

## S5 — HIGH: admin endpoints unauthenticated outside user-service

`event`, `ticket`, `order`, `payment` and `notification` do not declare
`spring-boot-starter-security`. Under the microservice topology every
`/api/admin/**` route in those services is reachable with **no credentials at
all**. Safety depends entirely on `api-gateway` being the only ingress, which is
a single point of failure rather than a control.

## S6 — HIGH: `DELETE /api/v1/users/{id}` reachable by any USER

`UserController` exposes full write and delete operations under `/api/v1/users`,
which `CustomSecurityFilterChain` guards with `hasAnyAuthority("USER","ADMIN")`.
Any authenticated user can therefore delete any account, including admins. The
ADMIN-only `/api/admin/users` mirror is bypassed entirely by using the v1 path.
There is no ownership check.

## S7 — MEDIUM: notification admin surface escapes the ADMIN rule

`AdminNotificationController` is mapped to `/api/v1/notifications`, not
`/api/admin/notifications`, so it never matches the
`hasAuthority("ADMIN")` rule. `POST /{id}/resend` and `DELETE /{id}` are
available to any authenticated `USER`.

## S8 — MEDIUM: error responses use HTTP 200

Confirmed live. A missing event returns HTTP 200 with the error in the body:

```
GET /api/v1/events/999999
HTTP/1.1 200
{"message":"Event not found for ID 999999.","code":"404","data":{},"is_error":true}
```

Only `user-service/GlobalExceptionHandler` (400/409/500) and
`PublicController.verifyToken` (401) set real statuses. Impact: monitoring
cannot count errors, caches treat failures as success, and clients keying on
status code mis-handle failures.

## S9 — MEDIUM: weak JWT secret validation (fixed)

`JwtConfigProperties.validate()` checked only `secret.length() >= 32`, but
`JwtSecret.getSecretKey()` Base64-*decodes* the value. The default in
`docker-compose.yaml` was plain text, so the app started happily and then
returned **HTTP 500 on every login** (`Illegal base64 character 2d`).

**Fixed in this change:** validation now checks that the secret Base64-decodes to
32–64 bytes and fails at startup with an actionable message, and the compose
default is a valid Base64 key. The plaintext default would have reached any
deployment that relied on it.

## Verified as *not* broken

- **Path shadowing.** `GET /{id}` alongside `GET /stats` is fine — verified that
  `GET /api/v1/events/stats` returns stats, not a `Long` parse error.
- **Authentication in the monolith.** The security chain from `user-service` is
  picked up by `scanBasePackages = {"com.ticket"}`; unauthenticated requests to
  `/api/v1/events` correctly return 401.

## Not yet assessed

Order ownership on cancel (`/cancel` vs `/force-cancel` and whether a non-owner
can cancel), ticket-service Redis lock correctness under concurrency, refresh
token rotation, and whether the payment mock is reachable in a non-local profile.
