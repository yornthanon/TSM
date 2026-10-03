# TSM / TicketDesk — Render deployment notes

Updated: 2026-10-03

## Current Render setup

- Frontend: [TSM-frontend](https://tsm-frontend-1pxf.onrender.com), a Render static site. Its Render build environment now has `VITE_API_BASE_URL=https://tsm-7hu8.onrender.com/api/v1`; the environment-only deployment completed successfully.
- API: [TSM](https://tsm-7hu8.onrender.com), a Docker web service running the Spring Boot monolith.
- Both services are currently on Render's **Free** compute plan. The static site does not spin down; the API does.
- The Render workspace contains **no Render-managed PostgreSQL instance**. The app is configured to use PostgreSQL, and the repository notes an external Neon database, but the live secret values were not read. Confirm in the TSM service that `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` point to the existing durable database. Do not rely on the local fallback (`localhost:5432`) in production.

## Sleep and database durability

Render's official [Free web-service documentation](https://render.com/docs/free) says a Free web service spins down after **15 minutes without inbound traffic** and can take about a minute to spin up again. It also says Free PostgreSQL databases expire after **30 days**. I have **not** changed the API plan or created a database; that would incur recurring charges and the spending limit has not been authorized yet.

Current official [Render compute pricing](https://render.com/pricing) lists:

- Always-on API at `0.5c-512mb`: **$7/month**. This is the lowest paid web plan, but 512 MB RAM may be tight for this Java monolith.
- API at `1c-2g`: **$25/month**, with more comfortable memory headroom.
- Small paid PostgreSQL at `0.1c-256mb`: **$6/month**.
- Static sites: free to host (bandwidth/build limits still apply).

That makes the smallest API + database combination about **$13/month**; a safer 2 GB API + small database is about **$31/month**, before any usage overages or optional providers. The free API has intentionally been left on its current plan until you approve a cap.

## Production variables to check (do not send their values in chat)

On the TSM API service, check that these are configured:

- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`: a durable PostgreSQL database (existing Neon is a possible option if already configured).
- `JWT_SECRET`: stable, Base64-encoded key with at least 32 decoded bytes. MFA authenticator secrets are encrypted using key material derived from this value; rotating it makes already-enrolled secrets unreadable.
- `DEFAULT_ADMIN_PASSWORD`: a unique strong password; rotate any development/default admin credential before inviting staff.

Optional real-world integrations:

- The payment gateway implementation is currently a **mock/simulated gateway**, not a live card processor. Select and configure a provider (and its test/live credentials) before accepting real payments.
- Email delivery requires SMTP variables (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`). SMS requires Twilio credentials.
- Order-confirmation event publishing to Kafka is currently a TODO in the order service; email/SMS notifications need the provider setup and the event publisher wired before they can be considered live.

## Changes prepared in this code update

- Added optional TOTP authenticator-based MFA for login, encrypted secret storage, authenticated setup/enable/disable endpoints, and migration `V8__user_mfa.sql`. Existing accounts remain MFA-off until each user enrolls.
- Replaced Redis-dependent ticket holds with transactional PostgreSQL row locking and reclamation of expired holds, so Redis is not required for core seat locking.
- Rethemed the frontend with graphite IDE-style surfaces, blue/cyan accents, restrained transitions, and route-level code splitting. This borrows only the broad dark/cool color direction from the ChatBot site; it does not copy its UI.
- Frontend build and lint passed; production frontend dependencies report zero high-severity audit findings; Java reactor packaging passed; RFC 6238 known-answer tests passed.

## Deploy/build commands

The Render services auto-deploy from branch `main`:

- API Docker build: `app-monolith/Dockerfile` (Maven reactor; migration runs through Flyway).
- Frontend: from `frontend-admindashboard`, `npm install` then `npm run build`; publish `dist`.

After a code push, inspect the two Render deploys and confirm Flyway applied V8 before using the MFA enrollment screen. Keep the existing database and take a backup before any later schema or data-reset work.
