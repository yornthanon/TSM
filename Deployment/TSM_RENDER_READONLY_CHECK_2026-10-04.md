# Render Read-only Check — 2026-10-04

This note records Render metadata observed through the Render MCP tools. No service, environment variable, deployment, database, or billing setting was changed.

## TSM API

- Public URL: https://tsm-7hu8.onrender.com
- Render service: `TSM` — https://dashboard.render.com/web/srv-dam1c57f3r2c73e4amu0
- Repository/branch: `yornthanon/TSM` / `main`
- Runtime: Docker, `app-monolith/Dockerfile`, Oregon, one instance
- Plan: **Free**; health-check path `/actuator/health`; auto-deploy enabled
- Latest deployment returned by `render/list_deploys`: status `live`, commit `c41d0b01c2a72d8627ea577af96930628b6c395b` (`feat: add secure Google OAuth2 sign-in`), completed 2026-10-03 13:53:57 UTC

## TSM Frontend

- Public URL: https://tsm-frontend-1pxf.onrender.com
- Render service: `TSM-frontend` — https://dashboard.render.com/static/srv-dap7dd60tbcc738lsp90
- Repository/branch: `yornthanon/TSM` / `main`
- Static site, root directory `frontend-admindashboard`, publish directory `dist`, auto-deploy enabled
- Latest deployment returned by `render/list_deploys`: status `live`, same commit `c41d0b01c2a72d8627ea577af96930628b6c395b`, completed 2026-10-03 13:43:12 UTC

## Scope and source

The checks were read-only `render/list_workspaces`, `render/list_services`, `render/list_deploys`, and `render/get_service` calls in the user's Render workspace. No live HTTP health request was sent during this check; prior deployment notes record an earlier `/actuator/health` HTTP 200. The multi-tenant changes remain local on branch `feat/multi-tenant-workspaces`; they have not been pushed or deployed, and migration V10 has not been run against production.

Official free-service behavior reference: https://render.com/docs/free
