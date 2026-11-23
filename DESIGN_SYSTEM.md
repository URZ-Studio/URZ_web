# URZ STUDIO — Polar Aurora Design System

**Theme:** POLAR / AURORA / SNOW BEAR — a professional web designer portfolio with a soft Arctic aesthetic.

Direction: luminous snow-white canvas, subtle northern-light washes, sky blue 70% / blush pink 30% accents, a rounded polar bear mascot, modern flat panels with carefully controlled frosted-glass treatment. The work remains the hero; visual effects are supporting cast.

## Editable Figma tokens

The implementation is separated into `public/assets/showcase.css` (layout), `public/assets/polar.css` (theme), and `public/assets/showcase.js` (interaction). In Figma, create semantic variables for both **Light** and **Dark** modes; do not manually recolor every component.

| Semantic variable | Light | Dark | Usage |
| --- | --- | --- | --- |
| Canvas | `#F6FBFF` | `#09131F` | Page background |
| Surface / glass | `rgba(255,255,255,.74)` | `rgba(21,38,56,.72)` | Selected panels |
| Text / primary | `#172333` | `#F2F9FF` | Headings and body |
| Text / secondary | `#62768B` | `#B3C9D9` | Supporting copy |
| Border / subtle | `#D7E8F3` | `#31475B` | Outlines |
| Sky highlight | `#A6E7FF` | `#8BDEFF` | Primary interactive surface |
| Pink highlight | `#F8BAD8` | `#FFB9DA` | Small playful detail |
| Pink readable text | `#D46B9B` | `#FFC0DD` | Emphasis |
| Sky readable text | `#3B94C6` | `#9CE6FF` | Label emphasis |
| Arctic deep | `#0D192A` | `#07111E` | Dark hero / case study |

Other primitives: 18 px button radius, 24–30 px card radius, 36 px featured panel radius, thin 1 px translucent outlines, ~18–28 px glass backdrop blur only where visual hierarchy benefits. Prefer actual flat color for long reading areas.

## Components and Figma variants

- **PolarBrand**: bear-face app icon + URZ STUDIO wordmark; small and full-size variants.
- **GlassHeader**: desktop navigation, current route, mobile dropdown, light/dark.
- **PolarHero**: giant editorial display type, Aurora backdrop, ANIMA workspace preview, plush bear.
- **FrostButton**: primary sky blue, subtle secondary glass, focus/hover/pressed.
- **ArtworkCard**: distinct webapp/extension concepts. Swap with *real project screenshots* when available.
- **ArcticStage**: dark glass application/workbench in the independent ANIMA Bridge case study.
- **GalleryMasonry**: image cards, search, album chips, filters, lightbox, owner upload modal.
- **AboutIdentity**: polar gradient panel + bear illustration, experience and design process.
- **ContactTerminal**: dark arctic glass panel with real GitHub link (no fake form).
- **AuroraFooter**: deep Arctic blue and subtle light wash.

### Visual assets

- `public/assets/favicon.svg` — original soft polar-bear head, also used in navigation.
- `public/assets/polar-bear.svg` — original fluffy polar bear with pastel sky scarf.
- `public/assets/polar.css` — all new Arctic visual rules.

## Animation rules

The **Aurora** is one faint 20–24 second gradient drift, not a particle system. The bear gently floats about 10 px in a 7-second loop. Product window uses a 9-second float. Project cards rise up to 7 px on hover, and a restrained 70-second creative ticker bridges sections. Motion pauses for users with `prefers-reduced-motion`; content never relies on an animation to be readable. Keep contrast and focus rings visible in both themes.

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
