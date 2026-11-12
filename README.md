# Liminal Hacker

**Hacking the in-between, after hours.** Nineteen imagined late-night places, an encrypted unlisted room, and a little warmth inside very large empty spaces.

The first arrival is random. Refreshing brings you back to it. A compact horizontal carousel remembers places you have reached; new places remain unnamed and unpictured until a passage opens. Each discovery is selected without replacement. There is no score, streak, daily reset, missed reward, or need to keep the page open.

Default pacing: the first passage after 15 minutes, then one new passage every 60–120 minutes. Waiting does not stack several unused passages. The visitor chooses when to go through an available passage, and the next wait begins then. Previously discovered places remain freely revisitable. The old random-on-refresh behaviour has been retired.

## The night desk

Open `/admin` for a purpose-built operator workspace: aggregate discovery statistics, location editing and encrypted image uploads, rarity and release schedules, a pacing simulator, quiet timed transmissions, a discovery pause switch, clue-route/image health checks, private shift notes, draft publication and recoverable history. See [the operating guide](docs/ADMIN.md). Hosted operator access is restricted by the runtime owner email allowlist.

## Change the experience

| Change | File |
| --- | --- |
| Discovery timing | `config/journey.js` |
| Location writing, colours, sounds, clues | `content/themes.js` |
| Encrypted location artwork | `content/art/<id>.json` |
| Page sections and compact carousel | `web/index.html`, `web/style.css` |
| Exploration, terminal, notebook, interactions | `web/app.js` |
| Server-owned discovery and authorization | `worker/service.js` |
| Artwork encryption | `worker/art.js`, `scripts/art.mjs` |

Once a draft is first saved in the desk, database settings take precedence over these seed files. Use the desk for day-to-day changes.

See [customization](docs/CUSTOMIZING.md), [discovery design](docs/DISCOVERY.md), and [self-hosting](docs/SELF-HOSTING.md).

## What is here

The atrium, rooftop relay, warm machine, midnight wash, last platform, still-water room, closed concourse, overnight stacks, vacancy corridor, ferry crossing, borrowed sky, empty lanes, lower level, hill station, open lab, last screening, suspended passage, roadside light, and sleeping records.

Every location has original artwork, a palette, optional synthesized ambience, a physical note, and a radio transmission. There are 39 ordinary fragments and a separate encrypted bonus room. The local fictional terminal offers `help`, `ls`, `cat note.txt`, `scan`, `tune`, `walk`, `map`, `notebook`, `tea`, and small discoveries. It executes no real commands and makes no real network scans.

## Server and build

The browser remains plain HTML/CSS/JavaScript. The pacing feature now needs a backend; a static upload alone cannot enforce it. No npm dependencies are required. Node 24+ provides the local runtime and SQLite adapter. Production on Sites uses a Worker, D1 and private R2 artwork storage, with identity supplied by the hosting service.

```sh
# Configure .env using .env.example, including the existing artwork key.
npm run check
npm test
npm run build
npm start
```

The build creates a single Worker ES module in ignored `dist/server/index.js`. Its public file allowlist contains only the application shell and encrypted puzzle bundle. Location artwork is encrypted in source and decrypted server-side only for authorized visits. The master artwork key is a runtime secret, absent from Git and the browser. Back it up securely; a fresh random key cannot decrypt existing art.

## Privacy and limits

Hosted visits are tied to a stable site-specific account identity; the database keeps a hash of that identity, discovered location IDs, current location, next passage time, revision, and record timestamps. It stores no email, IP address, personal notebook text, or advertising identifiers. Anonymous standalone mode uses an opaque HTTP-only cookie whose progress remains on the server; deleting that cookie creates a new visitor. Authenticated identity is needed to prevent that reset. Personal notebook writing and collected fragments remain browser-local and can be exported.

New plaintext artwork is not published in Git or the public asset directory. The original nine images were public in earlier commits and cannot be made secret retroactively. Source readers can see the ordinary catalogue's names, writing, and code; they cannot get the new image bytes or runtime key from it. Screenshots, already-delivered images, account sharing, and multiple accounts remain outside the pacing guarantee. This is gentle discovery, not DRM or a place for sensitive information.

There are no analytics, externally hosted fonts, music downloads, autoplay, jump scares, or flashing effects. Hosting services can retain ordinary access logs. Artwork is AI-created; all places and transmissions are fictional.
