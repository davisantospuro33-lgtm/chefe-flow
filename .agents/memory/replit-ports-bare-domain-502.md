---
name: Replit .replit ports mapping and bare-domain 502s
description: Why the public https://<repl>.replit.dev/ link can 502 even though the app is healthy, and how to fix the .replit ports table.
---

The bare public dev-domain URL (`https://<id>.replit.dev/`, no explicit port) is always routed by
Replit's edge proxy through the `[[ports]]` entry whose `externalPort = 80`. If that entry's
`localPort` doesn't match where the app actually listens, the edge gets a connection refused from an
unused local port and returns a bare `502` with `content-length: 0` — indistinguishable at a glance from
a crashed app.

**Why:** Lovable-imported projects often ship a leftover `[[ports]] localPort = 8080 / externalPort = 80`
mapping (their original dev-server default) alongside a newly added `localPort = 5000 / externalPort = 5000`
mapping (added for Replit's webview requirement). Both can coexist in `.replit`, and the stale 8080→80 entry
silently wins for the bare domain even though nothing listens on 8080 anymore.

**How to apply:** when diagnosing a public-link 502 with a healthy server (`curl localhost:<port>` returns
200, port confirmed listening via `lsof -i :<port>`), test `https://<domain>:<port>/path` explicitly — if
that works but the bare domain doesn't, check `.replit`'s `[[ports]]` table for a stale `externalPort = 80`
entry pointing at the wrong `localPort`. Fix by editing the port table so `externalPort = 80` maps to the
actual app port (write full TOML to a temp file and call `verifyAndReplaceDotReplit`; direct edits to
`.replit` are blocked). Don't assume a bare-domain 502 means the app crashed — always curl the port-suffixed
URL first to rule this out before touching app code, env vars, or session/secret logic.
