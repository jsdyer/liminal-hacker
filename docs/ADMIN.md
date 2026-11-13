# The night desk

Open `/admin`. The hosted desk is restricted to operator emails in the runtime `ADMIN_EMAILS` allowlist, using trusted Sites identity. The current owner is configured in the hosting environment, not in source. Being able to visit the website does not grant operator access. The visitor footer shows a Night desk link only to operators.

The desk also includes **My journal** and **My photographs** for your personal publishing. See [the journal guide](JOURNAL.md) for posts, photo essays, background reuse and backup details.

## A normal shift

1. **Night overview:** see remembered journeys, collection depth, location reach and daily first-arrival/discovery/revisit counters. These are aggregates, not a live-people counter. Existing journeys contribute to collection totals; activity counters begin with this update. Daily counts use UTC and are best effort, not an accounting ledger.
2. **Location workshop:** edit writing, colour, sound, exact radio frequency, notes, transmissions and existing hotspot labels/coordinates. Preview every room without granting it to a visitor. Choose a unique lowercase ID to add a new location; add artwork before publishing.
3. **Building rhythm:** adjust the first wait, usual wait and random variation; simulate 400 hypothetical walks before deciding. The simulation holds the active catalogue constant and assumes immediate claims. It estimates elapsed time, not actual visitor behavior.
4. **Signal check:** decrypt each published image, inspect the secret-room envelope and check configuration. The clue-route warnings detect missing/retired prerequisite rooms and missing frequency hints. They do not solve the riddle or prove that edited prose still contains the correct answer.
5. **Shift notebook:** leave private observations, repairs and ideas for future work. This never reads visitors’ personal notebook entries.
6. **Publication history:** restore an earlier publication to the working draft. Review before publishing it. Later-added rooms are retained off rotation to preserve visitors’ discoveries.

## Drafts, publication and timing

Edits are local to the current browser page until **Save draft**. The saved draft is private to operators. **Review & publish** validates and applies the complete world in one database transaction, with an audit entry and version snapshot. Optimistic revisions reject stale saves from another window. The original catalogue is retained as the first restore point.

The first saved draft initializes database configuration. From then on, that database configuration takes precedence over `content/themes.js` and `config/journey.js`; those files are the initial seed, not an automatic overwrite of live edits. Use the desk for ongoing content work. Deployments preserve database edits and visitor journeys.

Timing changes apply to future deadlines. They do not shorten an existing wait or reset progress. Pause stops new discovery claims while allowing initial arrivals and visits to already-found rooms. Unpausing uses existing deadlines. Retiring a room affects future selection only. At least one location must remain available without a retirement date.

Schedules are entered in **UTC**. Blank dates mean no limit. An enabled room outside its schedule is unavailable to new discoveries. Weight 1 is normal; 0.2 is rarer; 3 is more common. Weights affect selection among each visitor’s unseen, currently available rooms. Selection never repeats a room already found. Low weights do not guarantee an exact percentage, and every remaining room can eventually be found.

The night transmission is a short plain-text line on the visitor page, optionally with an expiry. It appears on the next journey load or action; it is not a push notification. Clearing its text removes it.

## Artwork and recovery

The workshop accepts JPEG, PNG or WebP. The browser resizes to at most 1672 × 1200 and converts to WebP under 500 KB. The server encrypts it with the existing runtime `ART_KEY` and authenticated room ID, then stores an immutable JSON packet in private R2 (`BUCKET`). Local Node hosting uses `private/uploads/` instead. No plaintext upload is written to the public source or public asset directory.

Old image packets are retained so publication history remains restorable. A conflicting upload can leave an unreferenced encrypted object; no automatic garbage collection deletes historical art. The operator preview can open every ordinary room; the visitor endpoint still checks that the requesting visitor has reached it. Images already delivered to a browser can be saved or screenshotted.

**Export desk backup** downloads the saved live and draft configuration plus encrypted uploaded images referenced by those two states. Unsaved local edits, older publication-only images, visitor journeys, audit history and shift notes are not included. This is a portable content backup, not a complete database backup. Keep a database backup and a full R2/filesystem backup for complete recovery, and retain `ART_KEY` separately. The export deliberately never includes the key. There is no one-click import in this release; restoring the portable export requires a server/database operation. Normal editorial rollback uses Publication history.

Changing `ART_KEY` without re-encrypting all images makes existing artwork unreadable. Do not replace the key as a routine password reset.

## Standalone operator access

For anonymous Node hosting, set an independently generated `ADMIN_TOKEN` of at least 32 characters in the private runtime environment. For example, generate it locally with `openssl rand -hex 32`. Visit `/admin` and enter it. The server issues an 8-hour signed, HTTP-only, SameSite=Strict cookie; HTTPS adds Secure. The key is never saved in browser local storage. Use HTTPS and the exact `PUBLIC_ORIGIN` behind your reverse proxy. Rotating the key invalidates existing operator cookies.

For `IDENTITY_MODE=proxy`, set `ADMIN_USER_IDS` to a comma-separated allowlist of trusted proxy subject IDs. The proxy must strip client-supplied identity headers and inject its authenticated subject. Block direct access to the Node port. The Node adapter always strips Sites identity headers and ignores `x-liminal-user` unless proxy mode is explicitly selected. Never trust identity headers from arbitrary Internet clients.

Hosted Sites uses `ADMIN_EMAILS`, not the standalone token. It requires both the trusted authenticated ID and an allowlisted trusted email. All admin data, image previews and mutations enforce this role on the server. Mutations also require same-origin JSON with a custom request header. There is no default operator key or public admin bypass.

## Data and privacy

`control_state` stores live/draft content and a revision. `control_versions` stores publication snapshots. `control_audit` stores operator actions and a shortened SHA-256 operator identifier (no email or raw account ID); the UI omits that identifier. `shift_notes` stores operator-authored notes. `activity_daily` stores day/room/count aggregates, with no visitor IDs, IPs or user agents. The existing `journeys` table remains pseudonymous server-owned progress. The host may maintain its own ordinary access logs.

The gallery and visitor experience stay quiet: no analytics vendor, advertisement SDK, email collection, forced notification prompt or scoring system is added.

## Verification

`npm run check`, `npm test`, `npm run build`. Tests cover role boundaries, signed session expiry/tampering, same-origin writes, stale save races, draft isolation, pause/retirement, encrypted upload access, safe restore and aggregate counting. The desktop browser workflow has also been checked using a local test operator. Local test data is not deployed.
