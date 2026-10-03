# TSM / TicketDesk — Render deployment notes

Updated: 2026-10-03

## Live deployment

- Frontend: [TSM-frontend](https://tsm-frontend-1pxf.onrender.com) is an existing Render static site configured to auto-deploy from `main`. Its build environment has `VITE_API_BASE_URL=https://tsm-7hu8.onrender.com/api/v1`; the live bundle and login page were verified.
- API: [TSM](https://tsm-7hu8.onrender.com) is an existing Render web service configured to auto-deploy from `main`. `/actuator/health` returned HTTP 200 on the prior API rollout; the current Free plan is unchanged.
- Database: the API connected to the existing Neon PostgreSQL database. Runtime logs confirmed Flyway migration `V8__user_mfa.sql` was applied successfully. No database was created, replaced, or reconfigured.

## Sleep and compute cost

The API remains on Render's **Free** compute plan; the static frontend is free and stays available. Render's official [Free web-service documentation](https://render.com/docs/free) says Free web services spin down after **15 minutes without inbound traffic** and need to start again on the next request. Therefore the API can still sleep; I have not upgraded it because you have not approved a recurring spend limit. The just-completed API rollout took about 4.5 minutes to become healthy on its current low-CPU Free instance.

Render's official [compute pricing](https://render.com/pricing) currently lists these API choices:

| API plan | Monthly compute price | Capacity | Notes |
|---|---:|---:|---|
| Free | $0 | 0.1 CPU / 512 MB RAM | Current; sleeps after 15 idle minutes |
| `0.5c-512mb` | $7 | 0.5 CPU / 512 MB RAM | Always-on, but limited memory for the Java monolith |
| `1c-2g` | $25 | 1 CPU / 2 GB RAM | Recommended for more comfortable Spring Boot headroom |

These are **API compute costs only**. The existing Neon database has not been upgraded or re-priced, and no new Render Postgres is needed for the current deployment. No paid plan change was made.

## Production safeguards and still-needed integrations

Keep the existing `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` pointed at Neon; do not rely on the local `localhost:5432` fallback. `JWT_SECRET` must remain stable and be Base64-encoded with at least 32 decoded bytes: MFA secrets are encrypted using key material derived from it, so rotating it would make already-enrolled secrets unreadable. Keep `DEFAULT_ADMIN_PASSWORD` unique and strong, and rotate any development/default credentials before inviting staff. Do not send these secret values in chat.

The payment gateway remains a **mock/simulated gateway**, not a live card processor. Do not accept real payments until a provider is selected and configured. The API currently reports SMS delivery disabled without Twilio credentials; email needs SMTP configuration, and order-confirmation event publishing to Kafka remains a TODO. MFA backup/recovery codes are not implemented; recovery from a lost authenticator requires an administrator procedure.

## Changes and validation

The dashboard shell now closely follows the selected ChatBot IDE workspace: compact top bar, flat collapsible Tool Windows menu with the ticketing routes, shortcut badges, ⌘K route palette, and a bottom status bar. Its four headline metrics use graphite panels, JetBrains Mono figures, and blue/cyan accents; loading/error states are compact and retryable. Route-level code splitting and the optional TOTP MFA settings remain in place. MFA remains opt-in; stored authenticator secrets are encrypted, login/setup failures participate in the account lockout policy, and migration V8 is live. Core ticket holds use transactional PostgreSQL row locks and reclaim expired holds on the next lock attempt, removing Redis as a core ticket-lock dependency.

The frontend production build and lint passed after the shell/dashboard changes; the production dependency audit found zero vulnerabilities. The new reusable skill passed the official skill structure validator. The Java reactor package and RFC 6238 TOTP known-answer test passed previously. The full Maven suite could not run completely in the sandbox because its existing `EventServiceApplicationTests.contextLoads` requires a local JDBC database; the sandbox has no local PostgreSQL. Render's Neon connection, migration, and API health check were verified during the prior rollout.
