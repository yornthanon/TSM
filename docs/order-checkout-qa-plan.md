# Order and Checkout QA Plan

**Prepared:** 2026-10-06  
**Scope:** Test design only. No live Order, Payment, Ticket, or Event records were created or changed while preparing this plan.

## 1. Current implementation and test boundary

- Order creation is exposed at `POST /api/v1/orders` (also `/api/v1/orders/create`). The admin Orders page is a monitoring/cancellation table; the dashboard contains no checkout page or `useCreateOrder` mutation. Until a customer-facing checkout UI exists, end-to-end checkout must be exercised only through an isolated QA API/integration harness.
- The backend supports one seat per checkout. It reserves the seat, validates the event association and amount against the ticket price, creates a `PROCESSING` order, asks the payment service to process it, confirms the seat sale, and then marks the order `COMPLETED`.
- The payment adapter is currently a **mock**: `PaymentGatewayServiceImpl` returns success for all four methods (`CREDIT_CARD`, `PAYPAL`, `BANK_TRANSFER`, `CASH`). The payment service still writes payment rows, and the order service writes order rows. A mock success is therefore still a database write, not a harmless preview.
- `idempotencyKey` is supported per username. Repeating the same key returns the existing order.

## 2. Safety rules and prerequisites

1. Use a separate QA workspace/database and a dedicated QA account. Never use an existing customer event, ticket, or order.
2. Create one clearly named QA event and one or two disposable QA seats with known prices. Record their IDs and initial states. Use only a QA account and synthetic contact details.
3. Do not enter card details or submit a checkout against the production database. Do not interpret the mock gateway as a real sandbox payment provider.
4. Use a unique idempotency key such as `qa-checkout-<run-id>`; do not paste bearer tokens into reports or chat.
5. Preserve order/payment history. After an order has been created, the new Event delete guard should block deleting that event. Do not bypass the guard or delete order rows manually.
6. **Do not run cancellation tests yet.** Current `cancelOrder`/`forceCancelOrder` only mark an order `CANCELLED`; they do not refund the payment or release/transition the sold ticket. The user-level cancellation path also does not compare the authenticated username to `order.username`. Define the cancellation/refund/seat-restoration policy and fix those paths first.

## 3. Test matrix (isolated QA only)

| Case | Setup / action | Expected outcome |
|---|---|---|
| Successful single-seat checkout | QA seat is `AVAILABLE`; `POST /api/v1/orders` with its event/ticket IDs, `quantity: 1`, matching amount, a mock payment method, and a fresh idempotency key | HTTP 200; order `COMPLETED`; server amount equals ticket price; one payment row is linked; ticket becomes `SOLD` and lock metadata is cleared |
| Server-derived amount | Omit `amount` while using a valid QA seat | Server stores the ticket price multiplied by quantity (quantity is restricted to one) |
| Quantity validation | Send `quantity: 2` | HTTP 400 before reservation; no order/payment row; ticket remains unchanged |
| Wrong amount | Send an amount different from the seat price | HTTP 400; temporary reservation is released; no payment/order is created |
| Event/ticket mismatch | Pair a QA ticket with a different event ID | HTTP 400; reservation is released; no payment/order is created |
| Locked or sold seat | Attempt checkout on a seat locked by another QA user or already sold | Reservation fails; no second completed order/payment; existing seat state is preserved |
| Idempotent retry | Repeat the successful request with the same username and idempotency key | Same order ID is returned; no duplicate payment or second order is created |
| Payment failure compensation | In a test harness, stub the payment client/gateway to fail | Order becomes `CANCELLED`; reservation is released; no ticket sale is confirmed. Existing unit coverage verifies this path; add an integration test when the harness is available |
| Sale-confirmation failure compensation | In a test harness, make ticket confirmation fail after mock payment success | Payment refund is requested; order becomes `CANCELLED`; reservation is released; ticket is not left sold |
| Concurrent checkout | Two QA requests race for the same available ticket | At most one reservation/order succeeds; the losing request receives a conflict/unavailable result |
| Event deletion with linked seat | Delete a QA event while a QA seat still references it | HTTP 409; event remains; response identifies that linked seats/orders block deletion |
| Event deletion with order history | Delete an event with an order, including a cancelled order | HTTP 409; event remains to preserve history |
| Dependency-check outage | Simulate a failure in either read-only dependency query | HTTP 503; deletion fails closed; event remains |
| Event deletion with no references | Delete a disposable QA event only after confirming it has no tickets or orders | HTTP 200; event is removed |

For checkout requests, use placeholders until a QA fixture exists:

```json
{
  "eventId": "<QA_EVENT_ID>",
  "ticketId": "<QA_TICKET_ID>",
  "quantity": 1,
  "amount": 25.00,
  "paymentMethod": "CASH",
  "recipientEmail": "qa@example.invalid",
  "phoneNumber": "0000000000",
  "idempotencyKey": "qa-checkout-<unique-run-id>"
}
```

## 4. Suggested execution order

1. Run service unit/integration tests with mocked clients and an isolated database first; cover success, validation failures, payment failure, and sale-confirmation failure.
2. Confirm the API is configured for the isolated QA workspace/database before any write test. If the API points to production data, stop before `POST /api/v1/orders`.
3. Execute only the success, validation, locked/sold, and idempotency cases against QA fixtures. Verify order, payment, and ticket state through read-only GETs.
4. Defer cancellation/refund scenarios until ownership checks and compensation behavior are fixed and a cancellation policy is approved.
5. Add customer-facing checkout UI tests only after a checkout form and mutation are implemented; the current admin dashboard cannot complete checkout.

## 5. Related implementation note

The Event delete guard uses read-only existence checks against `tt_ticket` and `tt_order` in the deployed modular monolith. It checks all order statuses and also detects an order whose `ticketId` references a seat for the event, even if its stored `eventId` is inconsistent. It does not change the Neon schema or existing records. If the services are later split onto separate databases, replace these shared-schema queries with authenticated internal dependency-check APIs and keep deletion fail-closed.
