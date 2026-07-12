---
name: TanStack Start server-side request/cookie helpers
description: Correct import names for cookie and request helpers in this project's @tanstack/react-start version, since getWebRequest doesn't exist here.
---

This project's installed `@tanstack/react-start` (re-exporting `@tanstack/start-server-core`) does
**not** export `getWebRequest`. Attempting to import it from `@tanstack/react-start/server` fails the
build with `[MISSING_EXPORT]`.

**Why:** the actual exported surface (checked via `node_modules/@tanstack/start-server-core/dist/esm/index.js`)
includes `getCookie`, `setCookie`, `deleteCookie`, `getCookies`, `getRequest`, `getRequestIP`,
`getRequestHeader(s)`, `getRequestHost`, `getRequestProtocol`, `getRequestUrl`, `getResponse*`,
`setResponseHeader(s)`, `setResponseStatus`, plus session helpers (`getSession`, `updateSession`, etc.) —
no `getWebRequest`.

**How to apply:** for server-only logic inside a `createServerFn().handler()` (e.g. reading the client IP
for rate limiting, or a custom cookie-based session), import from `@tanstack/react-start/server` using
`getRequestIP()` / `getCookie()` / `setCookie()` / `deleteCookie()` directly — don't reach for a raw
`Request` object via `getWebRequest`. Always check the actual export list in
`node_modules/@tanstack/start-server-core/dist/esm/index.js` first since this surface has changed across
TanStack Start versions.
