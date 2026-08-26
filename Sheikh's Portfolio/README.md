# Sheikh's Portfolio

A cinematic, dark-luxury personal portfolio for a Video Editor & Web Developer, built around a scroll-driven 3D cyberpunk car journey.

## Structure

```
portfolio/
├── index.html          All markup and content (sections, nav, form)
├── css/
│   └── style.css       Design tokens, layout, animation states, responsive rules
├── js/
│   ├── car.js           Three.js scene: procedural car, path, scroll-driven camera
│   └── main.js          Preloader, nav, scroll reveals, horizontal gallery, form
└── assets/
    ├── images/          Drop photo / thumbnail assets here
    └── video/            Drop project preview clips here
```

No build step is required — open `index.html` in a browser, or serve the folder with any static host (recommended, since ES module imports and fonts work more reliably over `http://` than `file://`).

```bash
# any static server works, e.g.
npx serve .
```

## What to customize

Everything editable is marked in the markup with square-bracket placeholders or clearly named elements.

| What | Where | File |
|---|---|---|
| Contact email | `.contact-email` link | `index.html` (Contact section) |
| Social links | `.social-links a` hrefs | `index.html` (Contact section) |
| Portfolio projects | `.project-card` blocks | `index.html` (Portfolio section) |
| Project preview media | Replace `.project-media` placeholder with an `<img>` or `<video>` | `index.html` |
| About photo | Replace `.about-frame` placeholder with an `<img>` | `index.html` |
| Experience timeline | `.timeline-item` blocks | `index.html` (Experience section) |
| Web dev skill tags | `.skill-tags` list | `index.html` (Skills section) |
| Colors / type scale | CSS custom properties in `:root` | `css/style.css` |
| Car journey path | `KEYFRAMES` object | `js/car.js` |

### Adding a real project video/thumbnail

Replace a placeholder block like this:

```html
<div class="project-media"><span class="frame-tag">Video Preview Placeholder</span></div>
```

with:

```html
<div class="project-media">
  <video src="assets/video/your-clip.mp4" muted loop playsinline autoplay></video>
</div>
```

(Add `object-fit: cover; width:100%; height:100%;` to `.project-media video` in `style.css` if you do this.)

## The 3D car

The car is built procedurally in `js/car.js` from basic Three.js geometry (no external `.glb`/`.fbx` needed), which keeps the initial load fast and avoids any asset licensing concerns. Its position, rotation, and the camera framing are all driven by an authored `KEYFRAMES` path, mapped to the real scroll position of each `[data-stage]` section — so the journey automatically re-syncs if you add/remove content or resize the page.

Near the bottom of the Contact section, a dedicated "ending" calculation pushes the car further into the distance and fades it out as the page is scrolled to its end.

## Performance & accessibility notes

- The car scene uses no post-processing pipeline (bloom is faked with additive-blended sprites) to keep frame times low, including on mobile.
- Pixel ratio is capped (1.5–2×) and particle count is reduced on narrow viewports.
- `prefers-reduced-motion` is respected: the car parks in a single static pose, scroll-reveal animations resolve instantly, and CSS transitions are shortened site-wide.
- All interactive elements are keyboard-focusable with a visible focus ring.
- A `<noscript>` fallback ensures content is visible even if JavaScript fails to load.

## Third-party libraries (via CDN)

- [Three.js](https://threejs.org/) r160 — 3D car scene
- [GSAP](https://gsap.com/) + ScrollTrigger — scroll-driven animation
- [Fontshare](https://fontshare.com/) — Clash Display & General Sans typefaces
