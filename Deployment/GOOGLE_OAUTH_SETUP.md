# TicketDesk Google OAuth2 setup

## Google Cloud Console

Open the [Google Auth Platform Clients page](https://console.cloud.google.com/auth/clients) for the Google Cloud project that owns the OAuth web client. If Google prompts you, complete app branding/audience setup first.

Create or edit a **Web application** OAuth client and add this exact **Authorized redirect URI**:

```text
https://tsm-7hu8.onrender.com/login/oauth2/code/google
```

Google requires the redirect URI to match exactly (including scheme, host, path, and trailing slash). The frontend origin is `https://tsm-frontend-1pxf.onrender.com`; this server-side authorization-code flow does not need a JavaScript-origin allowlist for token exchange, though it may be added as an origin if the Console prompts for one.

## Runtime configuration

Render service `TSM` receives the following variables through its environment-variable manager; do not put their values in Git or frontend build variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APP_FRONTEND_URL=https://tsm-frontend-1pxf.onrender.com`

The backend requests only `openid`, `email`, and `profile`. Google sign-in is linked only to an existing active TicketDesk account with a verified matching email; it does not auto-create users or change their roles. Existing TOTP MFA remains required. The backend returns a random, one-time, short-lived exchange code in the SPA URL fragment, hashes the code in PostgreSQL, and the frontend removes the code from the URL before exchanging it for TicketDesk tokens. No TicketDesk JWT is sent in a URL.

## Official references

- [Google OAuth 2.0 for web-server applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Manage OAuth clients](https://support.google.com/cloud/answer/15549257?hl=en)
