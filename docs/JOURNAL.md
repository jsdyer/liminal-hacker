# Your journal and photo library

The journal is the personal publishing side of Liminal Hacker. It is separate from fictional scene fragments, visitors’ browser-local notebooks, and the private operator Shift notebook.

## Share a note or a longer entry

1. Open `/admin#journal` and choose **Write an entry**.
2. Add a title, date, introduction, writing and optional comma-separated topics. A URL slug is generated from the title; adjust it before first publication if desired.
3. Choose an optional cover and up to 12 gallery photos. The arrow controls reorder gallery photographs.
4. **Save entry draft** stores it privately. **Preview entry** shows the working text and selected images without publishing.
5. **Review & publish entry** shows a review, followed by a final publish button. This atomically replaces the public snapshot.

The last published version remains visible while you edit the next draft. A previously published entry keeps its original URL, even after withdrawal. **Withdraw from journal** removes the public version and keeps the draft. **Archive entry** removes it from the journal and marks the draft archived; **Restore to drafts** is reversible and does not automatically republish it.

An entry can be a short note, a technical article, a photo essay, or a mixture. Its date controls archive order, not scheduled publication. Nothing fictional is seeded into your personal journal, and no example entry is published as if it were your writing.

Supported formatting: paragraphs, headings (`#` through `###`), `**bold**`, `*italics*`, inline backticks, fenced code blocks, `-` lists, `>` quotations, and `[label](https://example.com)` links. Raw HTML is escaped. Images are attached through the photo picker, not arbitrary HTML embeds.

## Add your own photographs

Open `/admin#photos`. Choose a JPEG, PNG or WebP under 20 MB, add a title and a meaningful image description, then save. Captions are optional. The browser converts the upload to an optimized WebP, no larger than 1920 pixels on its longest side and 500 KB. Portrait proportions are preserved. The original file is not stored; keep your full-resolution originals separately.

The server removes EXIF/GPS, XMP and embedded colour-profile chunks from the converted image, encrypts the optimized bytes with the existing `ART_KEY`, and writes an immutable object to `BUCKET`. A newly uploaded image is only accessible to an authenticated operator. It becomes accessible to journal readers only while a published entry references it. Withdrawing its last published reference closes future image requests; previously downloaded copies cannot be recalled. Captions you type can still reveal a location, so include only details you want to share.

Select any photo to update its title, description or caption, download the optimized image, start an entry with it, or apply it as a location background. Caption and description changes apply immediately wherever the photo appears in the journal.

**Apply to location draft** makes a separately encrypted copy tied to the selected room. Then open Location workshop, review and publish the world draft. The existing discovery gate protects that room background. Publishing the same photo in the journal reveals the picture to journal readers, so use separate photos if the location image itself should remain a surprise.

To make a completely new location from your own photography: add the location ID in Location workshop, save the room draft, select your photograph in My photographs, apply it to that location, then return to Location workshop to finish its writing and publish.

## Reading and sharing

- `/journal`: chronological archive with search, topic filtering and pagination.
- `/journal/<slug>`: a permanent link to one published entry.
- `/journal/feed.xml`: RSS containing published entry titles, links and summaries.
- The home page shows the three newest published entries.

These pages are rendered on the server and can be read without JavaScript. The journal itself does not require discovery progress or a visitor account, but the hosting platform’s access policy still applies. The current managed preview remains owner-only. Publishing an entry does **not** change the site’s audience; an external RSS reader also cannot pass that private hosting gate. A public self-hosted installation can serve the journal to ordinary readers while operator controls remain protected.

## Persistence and backup

`journal_posts` stores separate draft and published JSON snapshots, stable URL slugs, revisions, creation/update timestamps and reversible archive state. `journal_photos` stores metadata and encrypted object references. Both use D1 on Sites and SQLite locally. No post or photo is written into the Git repository by the admin editor.

**Export journal text** downloads all drafts, published snapshots, archive state and photo metadata as JSON. It includes relative download URLs for the optimized photos; it does not embed their image bytes or the runtime key. Download the photographs separately, or back up the complete database and image store for full recovery. Keep `ART_KEY` separately and securely. The older desk export remains scoped to location configuration and its referenced uploaded artwork. Neither export is a complete database backup, and this release has no one-click import.

The source catalogue and deployment remain separate from personal content. Redeploying the application preserves journal entries, photos and all existing journeys. Browser QA uses local test data; that data is never deployed.

## Verification

The release passes all 25 automated tests, including operator authorization, draft isolation, image access after withdrawal, optimistic edit conflicts, safe Markdown, and separately encrypted photo reuse. Browser checks exercised JPEG upload and conversion, location draft reuse, writing and preview, publication, the reading page, archive search, and reversible archive. Test entries and photos were local fixtures, not deployed content.
