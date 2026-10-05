# TicketDesk — Local Docker Compose

## Scope

This Compose stack runs the modular monolith (`app-monolith`) on port 8080 with one shared PostgreSQL database. It does not launch the individual service modules or an API gateway. The React dashboard is a separate Vite app and is run locally with `npm run dev` from `frontend-admindashboard`.

The target Render deployment remains the existing Free plan. This local guide does not authorize or perform any production migration or deployment.

## Prerequisites

Install Docker Engine 20.10+ and Docker Compose 2.0+. The stack starts PostgreSQL, the monolith, and optional local Redis/Kafka/Zipkin containers. The monolith uses PostgreSQL row locks for ticket concurrency; Redis is not required for that lock behavior.

## Configure secrets first

From the repository root, copy the template and edit the new private file:

```bash
cp .env.example .env
```

Set a unique `POSTGRES_PASSWORD`. Generate `JWT_SECRET` with `openssl rand -base64 32`; it must decode to 32–64 bytes. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `APP_FRONTEND_URL=http://localhost:5173`. Put the verified Google account(s) with platform-wide administrator access in `PLATFORM_ADMIN_EMAILS`. Add `http://localhost:8080/login/oauth2/code/google` to the Google OAuth client's authorized redirect URIs for local development. Keep `.env` private and out of Git.

`DEFAULT_ADMIN_PASSWORD` may remain blank; the bootstrap creates a random password rather than using a public default, and the product sign-in flow is Google-based. Do not rely on the bootstrap role in place of the configured platform-admin email allowlist.

## Start and stop

Run these commands from `Deployment/infrastructure`:

```bash
docker compose --env-file ../../.env up --build -d
docker compose ps
docker compose logs -f app
docker compose down
```

The application listens at `http://localhost:8080`; Vite normally serves the frontend at `http://localhost:5173`. Zipkin, if enabled, is at `http://localhost:9411`. PostgreSQL persists data in the `postgres_data` volume. **`docker compose down -v` deletes local database data**; it is unrelated to the production Neon database.

## Multi-tenant notes

The Render monolith packages all domain modules with one Flyway history and is the deployment target for the current shared-database tenant migration. V10 is additive: it creates the Legacy workspace and adds tenant ownership columns without resetting or deleting existing rows. Back up and review any database migration before a production rollout. This local guide does not run a migration against Render.

## Troubleshooting

Check container health and startup logs with `docker compose ps` and `docker compose logs -f app`. If Compose reports a missing `POSTGRES_PASSWORD` or `JWT_SECRET`, fill those values in the repository-root `.env`; this is intentional, not a fallback to a known public credential. If Google rejects a local callback, verify the exact URI in Google Cloud Console. For a database shell, run `docker compose exec postgres psql -U ticket -d ticket_db`.
