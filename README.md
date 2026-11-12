# Liminal Hacker

**Hacking the in-between, after hours.** An atmospheric personal art site for LiminalHacker.com: empty architecture, quiet systems, and a warm place to stay.

## The experience

- Nine cinematic spaces: **The atrium**, **The rooftop relay**, and **The warm machine**, plus a midnight laundromat, last platform, still-water pool, closed concourse, overnight stacks, and motel corridor. Each has original scene artwork, a different palette, writing, sound and discoveries.
- A random arrival on each load avoids the last visited space. **Stay here** pins a favourite. A direct link such as `?space=rooftop` overrides the arrival choice.
- **Enter the space** opens an immersive view with keyboard-accessible hotspots. Left/right arrows move between spaces; Escape returns to the site.
- An imagined local terminal (`~` shortcut) supports `help`, `ls`, `cat note.txt`, `whoami`, `pwd`, `scan`, `tune <MHz>`, `walk <place>`, `map`, `notebook`, `tea`, `clear`, and `exit`. This is a fictional shell, not a command runner or a network scanner.
- Tune the radio to the frequency written on each room's note. Nine physical notes, nine transmissions, and a small terminal ritual make nineteen fragments.
- A field notebook stores discoveries and personal notes locally, with JSON export. Local storage is validated and storage failure is surfaced without breaking the site.
- Optional, locally synthesized Web Audio ambience. No autoplay. Volume control under **Stay awhile**. Audio pauses in a hidden tab. No external music or audio assets.
- Responsive layouts, visible keyboard focus, semantic buttons, native modal focus management, reduced-motion support, and no jump scares or flashing effects.

## Run and host

There is **no build step, dependency, framework, CDN, or backend**. Node is only needed for the optional checks.

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Serve over HTTP(S), rather than opening `index.html` as a local file, because the scripts use native JavaScript modules.

To self-host, point Apache/Nginx's document root at `dist/`, or upload the contents of `dist/` to a static host. Set the MIME type for `.js` to JavaScript if your host does not already do so. All paths are relative, so subdirectory hosting works. No rewrites are required. Configure TLS and DNS for `liminalhacker.com` on your chosen host; this repository does not change DNS.

The `.openai/hosting.json` file identifies the separate private preview deployment. It is not needed for your own Apache/Nginx deployment.

```sh
npm run check
npm test
```

## Customize

| File | Purpose |
| --- | --- |
| `dist/themes.js` | Editable theme definitions, titles, colours, frequencies, hotspots and fragments |
| `dist/core.js` | Scene normalization, persistence validation and field-note essays |
| `dist/style.css` | Responsive layout, typography and room palettes |
| `dist/app.js` | Exploration, terminal, notebook, radio and navigation |
| `dist/audio.js` | Procedural sound layers and volume |
| `dist/assets/*.webp` | Optimized original scene art |

See **[the customization guide](docs/CUSTOMIZING.md)** for a copyable theme entry, field descriptions, and encrypted-room authoring commands. Counts and navigation update automatically from `dist/themes.js`. The original artwork briefs are in `dist/assets/ARTWORK.md`; additions are in `docs/NEW-ARTWORK.md`.

## The unlisted room

There is also an encrypted bonus room. Follow the transmissions in the new spaces and see what the terminal notices. Its artwork, name, and writing are not shipped as plaintext. AES-256-GCM protects the bundle; the visitor supplies the phrase derived from clues. This keeps the room out of casual image-directory and source browsing, but is deliberately **a puzzle, not a security boundary**. The progress gate is client-side, clues can be solved from source, phrase guesses can be tried offline, and unlocked content can be copied. The customization guide explains the limits without publishing the answer.

Secret-room decryption uses browser Web Crypto and requires HTTPS or localhost. It lasts for the current page session; the decrypted room and phrase are not saved in local storage.

## Privacy and fiction

The art, terminal, transmissions and observations are fictional. Personal notes and discoveries stay in the current browser's local storage; they do not sync across devices and disappear if site data is cleared. Export to retain them. The site has no analytics, application cookies, fonts from third parties, or remote asset requests. Hosting services may retain ordinary access logs.

Audio and images are served/generated locally after the initial asset load. This version does not install a service worker or promise offline availability. The art direction is slow, eerie and cozy: ethical curiosity, repair, and a little ambiguity.
