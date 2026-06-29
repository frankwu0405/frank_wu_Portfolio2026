# Frank Wu — Portfolio Redesign & Design System

A neutral, editorial, light-default redesign of the portfolio. Minimal foundation
with award-style polish (kinetic type, magnetic CTAs, scroll reveals, bento grids),
engineered so a professional **Nitori** series can slot in as the flagship work.

---

## 1. Existing information & architecture (audit)

The original site is a 6-page static HTML site (no build step):

- **index.html** — Hero intro, "What I Do" (3 service cards), Contact.
- **about.html** — Bio, skills tags, resume CTA, Contact.
- **projects.html** — 3 alternating project rows linking to case studies.
- **project1/2/3.html** — Full case studies (Smart Station, CareerCourse, One Shop).
- **assets/** — `css/style.css` (~2,180 lines), `js/script.js` (carousel, lightbox,
  mobile menu, fade-in, parallax), images, videos, PDFs, logo SVGs.

**Issues addressed:** dark + glowing-red "edgy" theme; ~2,180 lines of mostly
page-specific, hard-to-extend CSS with magic numbers; no design tokens; no
theming; heavy per-project class proliferation (`#OS_*`, `#CC_*`, `.key_change_1`…)
that makes adding new projects costly. The content and IA are solid and were
preserved — only the system and styling were rebuilt.

## 2. Direction & inspiration

Goal (per Frank): **minimal but not generic** — "Awwwards-style" polish, less edgy,
more neutral. Reference patterns adopted: content-first editorial layout, bold
variable typography, mono micro-labels/eyebrows, bento grids, generous whitespace,
restrained single accent, considered motion (reveal-on-scroll, magnetic buttons,
kinetic hero word), and a sticky in-page progress nav for long case studies.

## 3. Design system

### Theming
Light is the **default**; a navbar toggle switches to dark and persists via
`localStorage`, falling back to the OS `prefers-color-scheme`. Every color is a
token, so both modes are driven by the same components — no duplicated CSS.

### Color tokens (semantic)
| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FBFAF7` (paper) | `#0E0E0C` (ink) | Page background |
| `--surface` | `#FFFFFF` | `#17171420` | Cards / raised |
| `--surface-2` | `#F3F1EC` | `#1C1C19` | Insets / wells |
| `--text` | `#16150F` | `#F4F2EC` | Primary text |
| `--text-muted` | `#6B675C` | `#A6A299` | Secondary text |
| `--line` | `#E5E1D8` | `#2A2A26` | Hairlines / borders |
| `--accent` | `#E0552F` (ember) | `#FF6A40` | Links, highlights, focus |
| `--accent-weak` | accent @ 12% | accent @ 18% | Tinted backgrounds |

The accent is a single matured **ember** — a deliberate, grown-up nod to the old
red, used sparingly (links, eyebrow ticks, key figures, focus rings). It is one
token: change `--accent` to re-skin the whole site.

### Typography
- **Display / headings:** *Fraunces* (variable serif) — characterful, editorial.
- **Body / UI:** *Inter*.
- **Micro-labels / eyebrows / captions / meta:** *JetBrains Mono* (uppercase, tracked).
- Fluid type scale via `clamp()`: `--step--1 … --step-6`.

### Spacing, grid, radius, motion
- 4px base spacing scale `--space-1 … --space-16`.
- Max content width `--maxw: 1240px`; 12-col mental model; section rhythm via `--space`.
- Radius `--radius-sm 8 / -md 14 / -lg 22 / -pill 999`.
- Motion tokens `--ease`, `--dur`; everything respects `prefers-reduced-motion`.

### Components
Navbar (sticky, blur, theme toggle, active state), buttons (primary / ghost /
link, magnetic), eyebrow label, chip/tag, card, **bento grid**, project list rows
(hover image reveal), **case-study scaffold** (sticky side progress nav + numbered
sections), stat/metric block, figure + lightbox, carousel, marquee, footer.

### Both modes verified
All surfaces, shadows (light) / elevation-by-surface (dark), borders, and the
accent have explicit values in each theme; contrast targets WCAG AA for text.

## 4. The Nitori framework (flagship series)

Nitori is professional/client work and should read as the most senior work,
**prioritized above** the existing student projects. Implemented as a reusable
*series* pattern:

- **Projects page** leads with a **Nitori flagship band** (series intro + featured
  case studies) above an "Earlier work" section holding the 3 original projects.
- **`nitori.html`** — series overview hub (the umbrella, supports 3–5 sub-projects).
- **`nitori-case.html`** — a reusable professional case-study **template** built on
  the case-study scaffold; duplicate it per Nitori project (`nitori-1.html`…),
  fill content, and link from the hub. Designed to become the site's main content.

To promote Nitori to the home hero/featured slot, it already occupies the first
"Selected work" card on the home page and the top of Projects.

## 5. Execution approach

Single tokenized stylesheet + one vanilla JS file power all pages, so new projects
are added by copying a template and writing content — no new CSS. Build order:
backup → tokens/CSS → JS → home/about/projects → Nitori framework → port 3 case
studies → verify (paths, structure, preview). Originals preserved in
`_original_backup/`.

---
*Swap the whole accent by editing `--accent` in `:root` and `[data-theme="dark"]`.*
