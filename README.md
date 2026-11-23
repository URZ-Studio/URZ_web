# URZ STUDIO — Web Designer Portfolio

Portfolio pages are six independent HTML files in `public/`:
HOME, PROJECTS, ANIMA BRIDGE, GALLERY, ABOUT ME and CONTACT.

## Live public gallery (Cloudflare Pages + R2 + D1)

The owner uploads AI artwork from `gallery.html` after entering an admin secret.
Cloudflare R2 stores original images; Cloudflare D1 stores searchable prompts, model, seed, tags and albums. Visitors see the same artworks, publicly, on every device and browser. One artwork can belong to more than one album. The gallery supports bulk PNG/JPEG/WebP/AVIF/GIF uploads and keyword searches with a built-in Korean/English AI-art vocabulary, and images appear immediately on the public site after saving.

### Cloudflare configuration (once only — keep the existing custom domain)

1. Cloudflare dashboard → **R2 Object Storage** → create a private bucket, e.g. `urz-gallery-images`. R2 requires account/billing setup on some plans. Do not enable a public bucket URL: images are served by the Pages Function.
2. Dashboard → **D1 SQL Database** → create e.g. `urz-gallery-db`. Tables are initialized automatically on the first API request. There is no SQL migration or copy-pasting required.
3. **Workers & Pages → existing URZ_web Pages project → Settings → Bindings**: add **R2 bucket** with binding name `GALLERY_IMAGES` referring to bucket above; add **D1 database** with binding name `GALLERY_DB` referring to database above. These names are required, including capitals.
4. Same Pages project → **Settings → Variables and Secrets** (or **Environment variables** in older UI) → create an encrypted **Secret** named `ADMIN_UPLOAD_KEY` with a long random password of at least **24 characters**. Never put the secret in GitHub. It is required for posting, editing and deleting.
5. **Redeploy** the production branch `main` from the Pages deployment tab to activate the bindings. Do not replace, remove or re-add the custom domain; keep existing DNS.
6. Open your existing public domain’s `/gallery.html`, select **작가 로그인**, enter the secret, then **＋ 작품 게시하기** → choose files. A new browser or visitor sees the same published art on `/gallery.html` without signing in.

### Git integration

Root directory `/`, framework preset `None`, build output `public`, build command `exit 0` (or an empty build command if permitted). The `functions/` directory at repository root is deployed by Cloudflare Pages. Helpers in `lib/` are bundled privately into Functions and are not under the public output directory.

### Limitations / safeguards

- One image max 25 MB. PNG `tEXt` / `iTXt` / `zTXt` metadata is parsed in the browser, and common WebP/JPEG generation metadata is read where supported. Model/prompt/negative/seed/LoRA can be searched and displayed; bilingual search is a **built-in dictionary**, not a full AI translator.
- Visitor access is READ ONLY. Admin authentication is a server-side secret checked on the Pages Function; token is held only for the current browser tab session, not written into GitHub or visitor responses. Use a strong random secret and do not share it.
- Original image files and embedded generation metadata are publicly accessible to viewers and may expose private prompt information. Check files before publishing. The gallery does not automatically remove EXIF.
- Images are stored in R2 and metadata in D1; they incur any applicable Cloudflare charges according to your plan, and should be backed up separately. A Git revert does not restore deleted R2 objects.
- If the Cloudflare bindings are not set, the gallery intentionally displays a configuration error instead of silently saving images only in the current browser.
- The rest of the site and Contact form are presentation/mockup pages; the form does not send messages. ANIMA Bridge is an independent showcase page; no extension source, keys, private generated images or model files are published by this repo.

### API

- `GET /api/gallery` public searchable paginated artworks; `GET /api/gallery?id=UUID` direct link.
- `GET /api/gallery/image/:id` public original image.
- `GET /api/albums` public albums.
- `GET /api/admin/check` tests the owner bearer token.
- `POST /api/gallery`, `PATCH /api/gallery/:id`, `DELETE /api/gallery/:id`, `POST /api/albums`, `DELETE /api/albums/:id` require `Authorization: Bearer <ADMIN_UPLOAD_KEY>`.

Do not enable unrestricted writes or expose the admin key as a browser config variable.
