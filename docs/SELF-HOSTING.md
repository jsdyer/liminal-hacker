# Self-hosting

**Night Desk update:** use [`/admin`](ADMIN.md) for live location editing, weighted discovery, schedules, pause controls and publication. Once initialized, database content takes precedence over repository seed settings. Retiring a room stops new discoveries but preserves revisits.

Server-controlled discovery changes the hosting requirement. Serve the Node app behind Apache/Nginx, or deploy the Worker with D1. Do not point Apache directly at `web/` or `dist/`; that bypasses application routing and cannot run discovery.

## Node 24 and SQLite

1. Clone the repository. There are no npm dependencies to install.
2. Copy `.env.example` to ignored `.env`.
3. Set `ART_KEY` to the existing deployment's 32-byte base64 artwork key. The authoring checkout has it in ignored `.env`; the private preview has it in runtime secrets. Preserve it securely outside Git. A replacement key requires re-encrypting all original images.
4. Set `HOST=127.0.0.1`, choose `PORT`, and choose identity mode below. Keep the Node port reachable only from the local reverse proxy in production.
5. Run `npm run check && npm test && npm run build && npm start`.
6. Reverse proxy the entire site, including `/api/`, to the Node process. Preserve the public `Host` and `Origin`; terminate HTTPS at the proxy and set `PUBLIC_ORIGIN=https://liminalhacker.com` (your actual origin). This also marks anonymous cookies Secure. Do not cache `/api/` responses. Configure your process supervisor to restart `npm start`.

Local SQL migrations run once at startup, using `local_migrations` to track them. `private/journeys.sqlite` and its WAL files are ignored. Back up the database consistently using SQLite backup tooling, together with your artwork key. Keep migration files immutable once applied. Appending a new SQL file also requires a new entry in `drizzle/meta/_journal.json`.

### Anonymous

`IDENTITY_MODE=anonymous` offers no sign-up. An HTTP-only cookie holds an unguessable visitor ID; the database owns progress. Editing local storage, changing the clock, or inventing an unlocked-room cookie does not authorize anything. Deleting the session cookie starts over. This mode therefore cannot provide the same reset resistance as account identity.

### Authenticated reverse proxy

Set `IDENTITY_MODE=proxy` only behind an authenticating reverse proxy. The proxy must strip any incoming `X-Liminal-User` header, authenticate the visitor, then supply its own stable account identifier as `X-Liminal-User`. Do not use an IP address as that identifier. Block direct public access to Node. Enabling this mode on an exposed Node listener would let callers spoof identity.

The standalone adapter never trusts `oai-authenticated-user-id` received from the network. It strips that header; `sites` mode is for the managed Worker only. For subdirectory hosting, preserve the original root paths or add a deliberate route-prefix adaptation; the server routes currently assume the domain root.

## Worker and D1

The source manifest declares `d1: "DB"` and no static directory. Sites provisions D1 and applies `drizzle/` migrations. Runtime secrets contain `ART_KEY`; runtime configuration sets `IDENTITY_MODE=sites`. Build output is one Worker module with embedded encrypted assets and a public application-shell allowlist. Deploy the built artifact with the existing source workflow. Do not expose the server module as a static file.

In a separate Cloudflare account, supply a `DB` D1 binding, run the SQL migrations, set `ART_KEY`, and provide an appropriate identity layer. Do not assume Sites identity headers exist outside Sites. Anonymous mode can be used with its documented reset limitation; authenticated identity needs a trusted front end.

## Secret-room authoring

The bonus room uses its own riddle answers rather than `ART_KEY`. The commands in CUSTOMIZING.md still apply. This preserves the independent puzzle even if an owner changes the ordinary artwork key later.
