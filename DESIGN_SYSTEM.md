# URZ STUDIO — Design Handoff (2026)

This is a working design foundation for a job-oriented web designer portfolio. Its visual system is intentionally editable in Figma: large editorial typography, an IDE-inspired navigation, signature product mockups, and motion that reveals real project information.

## Art direction

**Concept:** DIGITAL PLAYGROUND × PROFESSIONAL PORTFOLIO

- Clean paper-like backgrounds and deliberately oversized type
- Signal-lime for primary interaction and molten-orange for expressive emphasis
- A dark product-workbench atmosphere for ANIMA Bridge, separate from the other projects
- Distinct conceptual product previews instead of six repeated placeholder screenshots
- Avoid presenting generated UI concepts as actual app screenshots
- Light theme by default; dark theme is supported

## Design tokens

All values are defined at the top of `public/assets/showcase.css`.

| Token | Value | Use |
|---|---|---|
| Paper | `#f8f7f3` | Canvas |
| Ink | `#171b19` | Typography |
| Forest | `#174d3b` | Secondary accents |
| Signal Lime | `#b9f44b` | Call to action, marquee |
| Molten Orange | `#ff7141` | Expressive highlights |
| Dark | `#111817` | Product and closing sections |
| White | `#ffffff` | Cards |
| Radius | `26px` | Large cards |
| Content width | `1520px` max | Responsive layout |
| Typography | `Inter / Pretendard` fallbacks | Latin/Korean |

## Components suitable for a Figma library

- `SiteHeader / IDE Tabs` (default, active, mobile expanded)
- `Intro / Giant Editorial Headline`
- `Window / Product Workspace`
- `Card / Work Preview` (featured, regular, project-specific preview)
- `Section / Dark Case Study`
- `Marquee / Motion Divider`
- `Gallery / Masonry`
- `Gallery / Artwork Lightbox`
- `Dialog / Project Details`
- `Footer / Statement`

## Motion vocabulary

CSS animations and vanilla JavaScript are contained in `showcase.css` and `showcase.js`.

1. Masked, staggered headline entrance
2. Slow 3D floating product window
3. Morphing procedural artwork inside the workspace concept
4. Continuous creative-process marquee
5. IntersectionObserver-based scroll reveal
6. Hover-responsive project preview
7. Scroll progress indicator
8. Cursor-reactive ambient glow on pointer devices
9. Interactive ANIMA workbench tabs
10. Browser cross-document view transitions where supported

`prefers-reduced-motion` turns motion off. Keyboard focus remains visible. There is no CDN or animation dependency.

## Six independent static pages

- `public/index.html`
- `public/projects.html`
- `public/anima-bridge.html`
- `public/gallery.html`
- `public/about.html`
- `public/contact.html`

The gallery is an actual project with separate Cloudflare Pages Functions and data storage. **Do not replace or remove** `functions/`, `lib/`, `public/assets/gallery.js`, or `public/_routes.json` when making design revisions.

## Image and privacy policy

Illustrated product previews are editable HTML/CSS **concepts**, not screenshots. Replace them with authorized screenshots from actual applications when those are selected. Private extension source, API keys, personal pictures and private galleries are not bundled.

The gallery's public image upload requires Cloudflare production bindings `GALLERY_DB` (D1), `GALLERY_IMAGES` (R2) and secret `ADMIN_UPLOAD_KEY` to be configured. Visual redesign does not configure or bypass those services.

## Deployment continuity

Existing custom domain: `kodiakx.kro.kr`.

Cloudflare Pages: Git branch `main`; build output directory `public`; build command `exit 0`; root directory empty. No new project or domain needed.

## Next visual assets to replace in Figma

- Authentic ANIMA Bridge screenshots and representative interface states
- BEARSTORY editor screenshots
- Professional web design work samples you own and are permitted to publish
- Your chosen profile picture/portrait and public contact address, if desired
- Cover artworks from the public gallery once R2/D1 storage is connected

The current system is meant to give those assets a strong presentation, not pretend the assets already exist.
