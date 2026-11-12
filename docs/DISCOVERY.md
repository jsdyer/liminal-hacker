# How the building keeps its own time

**Night Desk update:** use [`/admin`](ADMIN.md) for live location editing, weighted discovery, schedules, pause controls and publication. Once initialized, database content takes precedence over repository seed settings. Retiring a room stops new discoveries but preserves revisits.

The server decides which rooms exist for each visitor. The browser receives only the current room and remembered rooms, an approximate next-opening time, and the number still unseen. It never receives an unlock flag or decryption key that it can edit to open a new room.

## Identity

On Sites, `IDENTITY_MODE=sites` uses the trusted `oai-authenticated-user-id` supplied by the platform. Missing identity fails closed. No separate sign-in system is added; the existing private site's sign-in remains in place. The ID is hashed before it becomes the database key. A changed cookie, another browser, or cleared local storage does not reset the same account's collection.

Standalone mode supports anonymous sessions and an authenticated reverse proxy. An anonymous session cookie contains only 256 random bits, not progress or timestamps. Guessing/editing it does not grant arbitrary locations. Deleting it does create a new visitor: anonymous continuity cannot honestly be guaranteed against deliberate resets. No fingerprinting or IP binding is used. See SELF-HOSTING.md for proxy requirements.

## State and races

`journeys` contains one row per identity: current room, visited IDs, next eligible server timestamp, and a revision. Initialization uses `INSERT ... ON CONFLICT DO NOTHING`, then rereads the winning row. Discovery picks one unseen room and writes it using a single SQL update that checks both the current revision and due time. Only one simultaneous request can win. Others reread the result and receive no extra room. D1 requests use primary-first sessions.

Returning to an old room changes the current-room pointer but never reduces its timer or edits its collection. There is no public reset, owner bypass, fast-forward, or arbitrary grant endpoint. Owners can administer their own database outside the visitor application.

## Timing

Edit `config/journey.js`:

```js
export const journeyConfig = {
  firstWaitMinutes: 15,
  waitMinutes: 90,
  jitterMinutes: 30,
};
```

After the first arrival, wait 15 minutes. Subsequent waits are uniformly varied around 90 minutes by up to 30 minutes. The minimum accepted wait is one minute. To make the experience slower, increase `waitMinutes`; to make it predictable, set `jitterMinutes` to zero. Timing changes apply to newly issued deadlines. Existing stored deadlines remain unchanged.

A due passage waits for the visitor. Time away does not accumulate multiple grants. Every successful passage chooses uniformly among enabled, undiscovered rooms, so a new arrival never repeats. An account that has found every enabled room can continue revisiting. New enabled rooms are eligible on its next due passage. If all previously visited rooms are disabled, one replacement arrival is issued atomically.

## Artwork and source

Every normal image is stored as an AES-256-GCM packet with a fresh 96-bit IV and authenticated data bound to the room ID and format version. `ART_KEY` lives only in runtime secrets and ignored owner configuration. `/api/art/<id>` first checks the requesting identity's visited set, then decrypts its image. Missing/wrong keys and modified packets fail closed. Responses are private and non-cacheable; no shared CDN image response or public fallback exists.

The Worker uses an exact public-file allowlist. `/themes.js`, `/content/`, old `/assets/<room>.webp` paths, and server modules are not public routes. A query parameter, terminal command, carousel click, or manually submitted API body cannot authorize an undiscovered room.

The bonus room keeps its separate, answer-derived encryption. Its clues are an intentional puzzle, not server authorization. This system does not make rendered images uncopyable, prevent account sharing or multiple accounts, hide ordinary catalogue text in an open-source repository, or undo artwork disclosed in older Git history.
