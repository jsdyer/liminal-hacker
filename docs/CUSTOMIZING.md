# Make this place yours

Regular themes are deliberately simple to edit. Their text is in a server-side catalogue; their images are encrypted packets. The browser uses plain HTML, CSS, and JavaScript. A small server enforces discovery. Node 24+ runs the build and optional local SQLite server; no npm dependencies are required.

## Change or add a theme

Open **`content/themes.js`**. Each entry contains its name, headline, description, accent colour, image, sound preset, note, and radio transmission. The server’s location pool and fragment totals are derived from this list. Visitors only receive metadata and artwork for places they have discovered.

1. Copy one theme entry and give it a unique lowercase `id`.
2. Keep a landscape WebP in ignored `private/` or outside the repository. Around 1600 pixels wide, dark on the left with detail on the right, works well. With the existing `ART_KEY` set in ignored `.env`, run `node scripts/art.mjs seal workshop /private/workshop.webp content/art/workshop.json` (replace the ID and path). Only commit the encrypted packet.
3. Set the two lines in `heading`, the newline-separated `description`, and the hex `accent` colour.
4. Choose a `sound`: `hum`, `rain`, `fans`, `water`, `drums`, `tunnel`, `vent`, or `pages`.
5. Write a `note` and a `signal`. Put the frequency in the note so the receiver puzzle is solvable. Choose a distinct frequency from 88.0 through 108.0 with one decimal place.
6. Run `npm run check`, `npm test`, and `npm run build`, then preview with `npm start`. Publish the server, not a static upload. See SELF-HOSTING.md.

No HTML count changes or new CSS palette rules are required. The entry below illustrates the shape; replace its writing and image before using it.

```js
{
  id: "workshop",
  enabled: true,
  name: "The quiet workshop",
  level: "LEVEL 02",
  time: "03:18",
  accent: "#c8c5a0",
  sound: "fans",
  subtitle: "One small repair left to make.",
  status: "The soldering iron is cooling.",
  heading: ["A little broken.", "Still worth keeping."],
  description: "A circle of lamplight.\nA patient machine.\nSomething you can still understand.",
  hint: "Someone left a repair note.",
  frequency: 95.2,
  note: {
    title: "The next small thing",
    body: "The receiver says 95.2.\n\nThere is no deadline on the repair."
  },
  signal: {
    title: "Still repairable",
    body: "It was never beyond repair. Only beyond the time someone had for it."
  }
}
```

Hotspots default to a note, radio, and terminal. For precise placement, supply `hotspots` as in the original atrium entry; `x` and `y` are percentages. Inspect the scene on both wide and narrow screens after moving them.

Set `enabled: false` to hide a public theme. Keep at least one enabled. Keep stable IDs to preserve visitors' server-owned collections and local fragments. The optional door puzzle relies on the library, pool, and platform transmissions, so leave those enabled unless you also revise its route in `web/vault.js`. The tests catch a broken route. Timing is separately configurable in `config/journey.js`; existing deadlines stay unchanged until the next grant.

## Other edits

| What you want to change | File |
| --- | --- |
| Themes, ordinary fragments, colours, frequencies, pictures | `content/themes.js` |
| Longer field-note essays and the tea fragment | `web/core.js` |
| Homepage sections and navigation labels | `web/index.html` |
| Typography, layout, responsive rules | `web/style.css` |
| Terminal commands and interactions | `web/app.js` |
| Synthesized ambience | `web/audio.js` |
| Bonus-room puzzle | `web/vault.js` |
| Timing and new-room selection | `config/journey.js`, `worker/service.js` |
| Normal artwork encryption | `worker/art.js`, `scripts/art.mjs` |

## The encrypted room

This is a spoiler-resistant puzzle, not access control for private information. Its image, title, copy, and letter are encrypted together with AES-256-GCM. A key is derived from the visitor's three answers using PBKDF2-SHA-256 with 600,000 iterations, a random salt, and a fresh 96-bit IV. The phrase and plaintext room are not in the public source, image directory, or repository history. The public source contains the riddles and mechanism, so a determined visitor can solve the riddles, bypass the cosmetic progress gate, or try candidate phrases offline. After unlocking, they can save or screenshot the result. Do not use this system to hold sensitive data.

The route is intentionally discoverable: listen in the library, pool, and platform; keep those transmissions; make `tea`; then `knock`. The three answers are **not documented here**. The input order is shelf, water, departure. Case, spaces inside a field, underscores, and hyphens are normalized. The decrypted asset uses a temporary blob URL and stays only in the page's memory. Refreshing locks the room again. Ordinary progress remains saved.

Editing the secret room requires opening its bundle first. Keep a phrase file outside the repository containing your three solved words separated by `|`. **Do not put a production phrase in a command line, public README, environment committed to Git, test fixture, or CI log.** Use the local authoring tool:

```sh
node scripts/vault.mjs unseal \
  --input web/vault/door.json \
  --output /private/liminal/room.json \
  --phrase-file /private/liminal/phrase.txt
```

Edit the returned JSON outside the repository. It contains `scene` metadata, `letter` text, and a WebP image encoded as base64. Keep the scene ID `unlisted`. Replace `image.base64` with the base64 of your new WebP when changing the art. Then seal again:

```sh
node scripts/vault.mjs seal \
  --input /private/liminal/room.json \
  --output web/vault/door.json \
  --phrase-file /private/liminal/phrase.txt
```

Only commit the encrypted `web/vault/door.json`, never the authoring files. The tool rejects plaintext input/output and phrase paths inside the repository. Losing the phrase means you must solve the riddles or replace the bundle. Changing the phrase requires updating the clues so visitors can derive the new answers.

The encrypted door requires **HTTPS or localhost** for Web Crypto. Use HTTPS for a public deployment; localhost is sufficient for local testing. A stronger future version could validate progress and issue decryption keys on your server, but anything a visitor can see can ultimately be copied.

References: [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), [deriveKey](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey), [AES-GCM](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams).
