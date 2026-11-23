# URZ STUDIO — Web Designer Portfolio

Six separate HTML pages in `public/`: HOME, PROJECTS, ANIMA BRIDGE, GALLERY, ABOUT ME, CONTACT. ANIMA Bridge has its own independent case-study page.

## Deploy to Cloudflare Pages

Connect the **URZ-Studio/URZ_web** repository using Git integration.

| Build configuration | Value |
| --- | --- |
| Framework preset | None |
| Production branch | `main` |
| Root directory | `/` (repository root) |
| Build command | `exit 0` |
| Build output directory | `public` |

In Cloudflare dashboard: **Workers & Pages → Create application → Pages → Import an existing Git repository → URZ-Studio/URZ_web → Begin setup → Save and Deploy**. Then open **Custom domains → Set up a domain** and follow the DNS confirmation instructions. Avoid reassigning any domain already used by BEARSTORY.

## Notes

- Site is a portfolio **mockup**, not the actual ANIMA Bridge browser extension.
- Project screenshots and 9 gallery artworks are placeholders.
- Gallery: multi-file drag/drop, PNG metadata extraction, title/keyword/model/seed/English-Korean term search, albums, local backup/restore.
- **Gallery uploads only save to each visitor's browser IndexedDB; they are NOT published publicly**. To allow visitors to see artwork uploaded by the site owner requires authenticated admin publishing, object storage, database/indexing and access control.
- Contact form is an unconnected visual demo. No messages are delivered.
- No private repository code, API keys or private email addresses are bundled.
