# URZ STUDIO — Polar Aurora Design System

**Theme:** POLAR FLAT / SNOW BEAR — a legible, considered, job-oriented web designer portfolio.

Direction: snow-white and navy surfaces with restrained sky-blue accents, sparing pale-pink details, and a small original polar-bear mascot. Use solid cards, thin borders, clear editorial typography, consistent spacing, and content-first presentation. No artificial luminous cards or constant motion.

## Editable Figma tokens

The implementation is separated into `public/assets/showcase.css` (base layout), `public/assets/polar.css` (Arctic theme and final flat-visibility overrides), and `public/assets/showcase.js` (interaction). In Figma, create semantic variables for both **Light** and **Dark** modes; do not manually recolor every component.

| Semantic variable | Light | Dark | Usage |
| --- | --- | --- | --- |
| Canvas | `#F7FAFC` | `#0F1924` | Page background |
| Surface / card | `#FFFFFF` | `#192A3B` | Flat cards |
| Text / primary | `#172637` | `#F3F8FD` | Headings and body |
| Text / secondary | `#536678` | `#B6C9D8` | Supporting copy |
| Border / subtle | `#DBE5EC` | `#364A5E` | Outlines |
| Sky highlight | `#A6E7FF` | `#8BDEFF` | Primary interactive surface |
| Pink highlight | `#F8BAD8` | `#FFB9DA` | Small playful detail |
| Pink readable text | `#D46B9B` | `#FFC0DD` | Emphasis |
| Sky readable text | `#2B719B` | `#A3E2FF` | Label emphasis |
| Arctic deep | `#0D192A` | `#07111E` | Dark hero / case study |

Primitives: 12 px button radius, 14–20 px card radius, thin 1 px solid borders, no routine shadows or backdrop blur. The only strong contrast panels are the ANIMA workspace and a dark footer. Use meaningful white space and 16px+ body type.

## Components and Figma variants

- **PolarBrand**: bear-face app icon + URZ STUDIO wordmark; small and full-size variants.
- **FlatHeader**: opaque navigation, current route, mobile dropdown, light/dark.
- **PolarHero**: legible Korean editorial headline, ANIMA workspace preview, small illustrated bear.
- **FlatButton**: solid sky-blue primary, outlined secondary, visible focus/hover/pressed.
- **ArtworkCard**: distinct webapp/extension concepts. Swap with *real project screenshots* when available.
- **ArcticStage**: dark glass application/workbench in the independent ANIMA Bridge case study.
- **GalleryMasonry**: image cards, search, album chips, filters, lightbox, owner upload modal.
- **AboutIdentity**: flat pale-blue panel + bear illustration, experience and design process.
- **ContactTerminal**: flat dark-blue panel with real GitHub link (no fake form).
- **ArcticFooter**: deep Arctic blue, no distracting motion.

### Visual assets

- `public/assets/favicon.svg` — original soft polar-bear head, also used in navigation.
- `public/assets/polar-bear.svg` — original fluffy polar bear with pastel sky scarf.
- `public/assets/polar.css` — all new Arctic visual rules.

## Animation rules

Aurora remains a color inspiration, not an animated background. Bear, 3D product preview and ticker are stationary; cards lift at most 3px on hover. Entry motion is short and optional. Respect `prefers-reduced-motion`. Typography, click targets, and contrast remain legible even with motion disabled.

## Pages (six distinct HTML files)

- `public/index.html` — Arctic hero, showcased work, independent ANIMA feature.
- `public/projects.html` — project gallery and filters.
- `public/anima-bridge.html` — independent product case study.
- `public/gallery.html` — public artwork gallery, metadata search and owner upload.
- `public/about.html` — experience, education, design values.
- `public/contact.html` — real public contact destinations only.

No external animation package or generated fake screenshots are required.

## Cloudflare continuity / do not break

Cloudflare Pages project: **urz-web**. Existing domain: **kodiakx.kro.kr**. Production branch: `main`, root directory empty, build command `exit 0`, output folder `public`.

The public gallery's Cloudflare Pages Functions, image storage and search must remain untouched while styling. **Do not delete** `functions/`, `lib/`, `public/_routes.json`, `public/assets/gallery.js`. Uploading art for visitors requires D1 binding `GALLERY_DB`, R2 binding `GALLERY_IMAGES`, and secret `ADMIN_UPLOAD_KEY` in Cloudflare. Those are cloud resources, not front-end styling variables. Actual uploads are not confirmed to work until the bindings are configured and tested.

## Design asset checklist

For the next Figma pass, replace **UI concept graphics** with actual ANIMA Bridge and BEARSTORY screenshots and publish only selected AI artwork with appropriate metadata. Keep readable hierarchy and whitespace before adding effects.
