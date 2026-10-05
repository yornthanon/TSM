# TicketDesk Google OAuth2 setup

## Google Cloud Console

Open the [Google Auth Platform Clients page](https://console.cloud.google.com/auth/clients) for the Google Cloud project that owns the OAuth web client. If Google prompts you, complete app branding/audience setup first.

Create or edit a **Web application** OAuth client and add this exact **Authorized redirect URI**:

```text
https://tsm-7hu8.onrender.com/login/oauth2/code/google
```

Google requires the redirect URI to match exactly (including scheme, host, path, and trailing slash). The frontend origin is `https://tsm-frontend-1pxf.onrender.com`; this server-side authorization-code flow does not need a JavaScript-origin allowlist for token exchange, though it may be added as an origin if the Console prompts for one.

For local development only, add `http://localhost:8080/login/oauth2/code/google` as a second redirect URI and set `APP_FRONTEND_URL=http://localhost:5173`. Do not replace the Render redirect URI.

## Runtime configuration

Render service `TSM` receives the following variables through its environment-variable manager; do not put their values in Git or frontend build variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APP_FRONTEND_URL=https://tsm-frontend-1pxf.onrender.com`
- `PLATFORM_ADMIN_EMAILS` — comma-separated verified Google email(s) allowed to receive global `ADMIN` authority. Leave empty until the intended administrator has been explicitly chosen; no database role alone grants global administrator access.

The backend requests only `openid`, `email`, and `profile`. Any Google account with a verified email may enroll automatically: it receives a base `USER` role, a workspace-owner `TENANT_ADMIN` role, and a new isolated workspace. Only email addresses in `PLATFORM_ADMIN_EMAILS` receive global `ADMIN`; ordinary tenant admins cannot access platform-admin endpoints. Existing accounts are preserved and reconciled at their next Google sign-in. Password login and public password registration routes are disabled; use Google as the primary sign-in method. Existing TOTP MFA remains required for accounts where it is enabled.

The backend returns a random, one-time, short-lived exchange code in the SPA URL fragment, hashes the code in PostgreSQL, and the frontend removes the code from the URL before exchanging it for TicketDesk tokens. No TicketDesk JWT is sent in a URL. In the multi-tenant release, migration V10 assigns pre-existing database rows to the `Legacy TicketDesk Workspace`; new Google accounts create separate workspaces, and pre-existing non-platform-admin accounts move from Legacy into a fresh private workspace on their first verified Google sign-in. Existing business rows remain in Legacy rather than being guessed/reassigned to a user. The global platform admin can still access them; tenant users will not see legacy rows after migrating to their private workspace. The migration is additive and does not reset or delete existing records, but it must be reviewed and backed up before a production rollout.

## Official references

- [Google OAuth 2.0 for web-server applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Manage OAuth clients](https://support.google.com/cloud/answer/15549257?hl=en)
