# Back4app deployment

The repository is a Maven multi-module Spring Boot project. The deployable backend is the `app-monolith` module, but it depends on the other Maven modules. Back4app must therefore build from the repository root using the root `Dockerfile`.

## Back4app settings

Create or update the Back4app Container App with:

- **Repository:** `yornthanon/TSM`
- **Branch:** `main`
- **Root directory:** repository root (`/` or empty)
- **Deployment type/runtime:** Docker/Container
- **Port:** `8080`

Do not set the root directory to `app-monolith`. That directory does not contain the complete Maven reactor required by the monolith build.

The root Dockerfile runs:

```text
mvn -pl app-monolith -am -DskipTests clean package
java -jar /app/app.jar
```

The application listens on `PORT`, with `8080` as the fallback:

```text
server.port=${PORT:8080}
```

## Required environment variables

Set these in Back4app Container Settings. Keep their values out of Git and out of chat.

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<database>?sslmode=require
SPRING_DATASOURCE_USERNAME=<database-user>
SPRING_DATASOURCE_PASSWORD=<database-password>
JWT_SECRET=<base64-secret-with-at-least-32-decoded-bytes>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
APP_FRONTEND_URL=https://<frontend-domain>
CORS_ALLOWED_ORIGINS=https://<admin-frontend-domain>,https://<customer-frontend-domain>
PLATFORM_ADMIN_EMAILS=<verified-admin-email>
INTERNAL_AUTH_TOKEN=<long-random-token>
```

`CORS_ALLOWED_ORIGINS` must contain the exact browser origins, separated by
commas and without a trailing slash. If only one frontend exists, set both
`APP_FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` to that frontend's origin. Do
not use `*` in production.

`CORS_ALLOWED_ORIGINS` must contain the exact browser origins, separated by
commas and without a trailing slash. For example:

```text
CORS_ALLOWED_ORIGINS=https://admin.example.com,https://customer.example.com
```

If only one frontend exists, set both `APP_FRONTEND_URL` and
`CORS_ALLOWED_ORIGINS` to that frontend's origin. Do not use `*` in production.

Optional integrations can be added later with `MAIL_*`, `TWILIO_*`, `REDIS_URL`, and `KAFKA_BOOTSTRAP_SERVERS`. The monolith is configured so Redis and Kafka are not required for its health check.

## Re-deploy checklist

1. Push the commit containing the root `Dockerfile` to `main`.
2. In Back4app, confirm the app is connected to the `main` branch and the repository root.
3. Confirm the container exposes/listens on port `8080`.
4. Add the required environment variables before deploying.
5. Deploy the latest commit and inspect **Runtime Logs**.
6. A successful startup should include a Spring Boot startup message and a line indicating Tomcat is listening on port `8080`.

If the logs still show `default web process set to: java -jar app.jar`, Back4app is still using its Java build detection rather than the root Dockerfile. Recreate the app as a Docker/Container deployment or correct its repository root, then deploy again.
