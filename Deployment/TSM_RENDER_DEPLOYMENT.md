# TSM / TicketDesk — Render deployment notes

Updated: 2026-10-05

## Live deployment

- Frontend: [TSM-frontend](https://tsm-frontend-1pxf.onrender.com) is an existing Render static site configured to auto-deploy from `main`. Its build environment has `VITE_API_BASE_URL=https://tsm-7hu8.onrender.com/api/v1`; the live bundle and login page were verified.
- API: [TSM](https://tsm-7hu8.onrender.com) is an existing Render web service configured to auto-deploy from `main`. Commit `643178d` is live and `/actuator/health` returned HTTP 200 with status `UP`; the Free plan is unchanged.
- Database: the API uses the existing Neon PostgreSQL database. Flyway V10 (`tenant workspaces and isolation`) completed successfully; schema checks confirmed the Legacy workspace and tenant columns. No database was created or replaced.

## Sleep and compute cost

The API remains on Render's **Free** compute plan; the static frontend is free and stays available. Render's official [Free web-service documentation](https://render.com/docs/free) says Free web services spin down after **15 minutes without inbound traffic** and need to start again on the next request. Therefore the API can still sleep; no paid upgrade was made. The tenant/API deployment took about 4 minutes 43 seconds to become live on the current low-CPU Free instance.

Render's official [compute pricing](https://render.com/pricing) currently lists these API choices:

| API plan | Monthly compute price | Capacity | Notes |
|---|---:|---:|---|
| Free | $0 | 0.1 CPU / 512 MB RAM | Current; sleeps after 15 idle minutes |
| `0.5c-512mb` | $7 | 0.5 CPU / 512 MB RAM | Always-on, but limited memory for the Java monolith |
| `1c-2g` | $25 | 1 CPU / 2 GB RAM | Recommended for more comfortable Spring Boot headroom |

These are **API compute costs only**. The existing Neon database has not been upgraded or re-priced, and no new Render Postgres is needed for the current deployment. No paid plan change was made.

## Production safeguards and still-needed integrations

Keep the existing `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` pointed at Neon; do not rely on the local `localhost:5432` fallback. `JWT_SECRET` must remain stable and be Base64-encoded with at least 32 decoded bytes: MFA secrets are encrypted using key material derived from it, so rotating it would make already-enrolled secrets unreadable. Sign-in is Google OAuth only; the application no longer seeds a default username/password admin. Only the verified email(s) in `PLATFORM_ADMIN_EMAILS` receive global `ADMIN`. Keep secrets out of Git and do not send them in chat.

The payment gateway remains a **mock/simulated gateway**, not a live card processor. Do not accept real payments until a provider is selected and configured. The API currently reports SMS delivery disabled without Twilio credentials; email needs SMTP configuration, and order-confirmation event publishing to Kafka remains a TODO. MFA backup/recovery codes are not implemented; recovery from a lost authenticator requires an administrator procedure.

## Changes and validation

The dashboard shell now closely follows the selected ChatBot IDE workspace: compact top bar, flat collapsible Tool Windows menu with the ticketing routes, shortcut badges, ⌘K route palette, and a bottom status bar. Its four headline metrics use graphite panels, JetBrains Mono figures, and blue/cyan accents; loading/error states are compact and retryable. Route-level code splitting and the optional TOTP MFA settings remain in place. MFA remains opt-in; stored authenticator secrets are encrypted, login/setup failures participate in the account lockout policy, and migration V8 is live. Core ticket holds use transactional PostgreSQL row locks and reclaim expired holds on the next lock attempt, removing Redis as a core ticket-lock dependency.

The frontend production build and lint passed after the shell/dashboard changes; the production dependency audit found zero vulnerabilities. The new reusable skill passed the official skill structure validator. On 2026-10-05, `npm run lint`, `npm run build`, `./mvnw -q -DskipTests package`, and all 7 user-service tests passed. The full Maven suite was attempted and stopped at the existing `EventServiceApplicationTests.contextLoads`: Hibernate could not determine its JDBC dialect because the sandbox has no local database/JDBC metadata. Render's Neon connection, earlier migration, and API health check were verified during the prior rollout. The latest Render metadata snapshot was read-only; see [TSM_RENDER_READONLY_CHECK_2026-10-04.md](TSM_RENDER_READONLY_CHECK_2026-10-04.md).

## Multi-tenant release status — 2026-10-05 (deployed)

The tenant refactor is commit `643178d` on public `main`, and both the API and frontend deployments are live. Migration V10 is packaged only with the monolith and adds workspace IDs/constraints while backfilling existing business rows to workspace 1, `Legacy TicketDesk Workspace`. Existing users remain without a tenant until their first verified Google sign-in creates a private workspace; this makes old user sessions fail closed instead of retaining access to Legacy. The migration does not truncate, drop, or reset production data. PostgreSQL's serial sequence is advanced after inserting the Legacy row.

At each non-platform user's first verified Google login after rollout, the account is assigned to a newly provisioned private workspace. Existing business rows are intentionally left in Legacy because the source data does not reliably identify a sole owning Google user. As a result, those users will initially see an empty private workspace; the allowlisted global platform administrator can still inspect all workspaces and legacy records. The user has accepted this data-access transition.

The release includes Google open enrollment, `USER` plus `TENANT_ADMIN` provisioning, an explicit `PLATFORM_ADMIN_EMAILS` allowlist for global `ADMIN`, tenant-aware Hibernate filters and internal-service header propagation, a platform workspace console, Google-only sign-in routes, and TOTP MFA support. The public repository README already declared MIT; a standard `LICENSE` file is included. Known public development password/JWT fallbacks were removed from Compose and application configuration. The current-tree credential scan found no known password or Google credential literals; root `.env` remains ignored by Git.

Render's API and frontend auto-deploy from `main`; the API remains on the $0 Free plan and can sleep after 15 minutes idle. On 2026-10-05 the user-provided `PLATFORM_ADMIN_EMAILS` value was merged into the API service configuration without replacing other variables. API deploy `dep-db1ko0unfi0s739dlbm0` and frontend deploy `dep-db1ko0tg1s2s739om4f0` are both `live` on commit `643178d`. Production Flyway V10 is successful. A manual Neon snapshot `before-tenant-v10-2026-10-05` was created with expiry 2026-11-04; the temporary migration-test branch was discarded without applying its SQL to production.


## Public Git history caveat

Commit `643178d` removes known development credential defaults from the current public tree, but earlier Git history has not been rewritten. The scan covered the current working tree only, not all historical commits. Other Render secret values were not inspected. If any previously published development default was ever used as a real secret in an environment, rotate that affected value before continued use.


## Platform-admin allowlist update

The user selected the verified platform-admin Gmail; it is stored only in the Git-ignored repository-root `.env` with restrictive file permissions and is not written into tracked documentation or `.env.example`. Render's `PLATFORM_ADMIN_EMAILS` is configured by merge and is active in the live API deployment.
