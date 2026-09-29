---
name: Humanitarian Dignity & Empowerment
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#44474e'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#4a5f84'
  primary: '#001a3c'
  on-primary: '#ffffff'
  primary-container: '#192f52'
  on-primary-container: '#8397c0'
  inverse-primary: '#b2c7f2'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#3e000c'
  on-tertiary: '#ffffff'
  tertiary-container: '#650019'
  on-tertiary-container: '#ff5f72'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#b2c7f2'
  on-primary-fixed: '#011b3d'
  on-primary-fixed-variant: '#32476b'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display:
    fontFamily: IBM Plex Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 50px
  headline-lg-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 38px
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 30px
  title-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-tablet: 2rem
  margin-mobile: 1.25rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3.5rem
---

> **Public-site brand palette (current):** the tokens below are the original navy/amber system and are kept for reference only. The public site now uses the logo palette: primary green `#0C7845` (buttons, links, icons, highlights), deep green `#073D24` / `#052B19` (dark sections, footer, hero overlay), mid green `#0A5C35` (hover/darker), tints `#EAF5EE` and canvas `#F6F9F5`, ink `#16261D`, muted `#4D6157`, line `#DBE6DF`. Orange `#FF7000` is reserved for the donate buttons (`.btn-donate`, dark ink text for AA contrast). Red `#E11D48` stays for urgent/error. The old gold/amber roles are now primary green (or white/pale green on dark sections). Legacy CSS variable names (`--forest-*`, `--gold-*`) and Tailwind names (`primary`, `gold`) are kept but hold green values. The admin panel still uses navy + amber.


## Brand & Style

This design system is tailored for an esteemed humanitarian and social empowerment non-governmental organization serving the Arab world and international donor communities. Moving away from standard emerald and olive tones prevalent in the non-profit sector, this aesthetic creates differentiation through institutional prestige, profound dependability, and heartfelt warmth.

The visual direction marries **Corporate Modernism** with **Warm Editorial Elegance**, centered on dignity rather than distress:
- **Tone & Demeanor:** Dignified, transparent, empathetic, and enduring. Imagery and layouts prioritize the sovereignty and empowerment of beneficiaries rather than voyeuristic sympathy.
- **Audience:** High-net-worth philanthropists, regional institutional partners, micro-donors, and humanitarian field coordinators.
- **RTL-Native Excellence:** Engineered natively for Right-to-Left (RTL) reading flows, paying meticulous attention to bidirectional balance, natural eye scanning patterns, and harmonious Arabic typography metrics.

## Colors

The color architecture moves away from conventional non-profit greens to establish an institutional, trustworthy, and culturally rooted palette.

- **Primary (`#192f52` — Royal Deep Lapis):** A commanding, deep lapis blue conveying institutional governance, fiscal stewardship, and security. Used for critical brand anchors, primary actions, core headings, and structural framing.
- **Secondary (`#d97706` — Warm Amber Gold):** Evokes hope, dawn, vitality, and human potential. Employed for high-priority donation accelerators, milestone progress indicators, and spotlight accolades.
- **Tertiary (`#e11d48` — Crimson Coral):** Reserved strictly for urgent humanitarian crises, disaster response alerts, and immediate relief callouts.
- **Canvas & Neutral Surfaces:**
  - Base Background: `#fbfaf8` (Warm Alabaster Linen), providing comfort during prolonged reading.
  - Card & Container Surface: `#ffffff` (Pure White).
  - Subtle Framing Surfaces: `#f1f5f9` (Slate Tint) and `#f8fafc` (Muted Foundation).
- **Text Hierarchies:**
  - Text Primary: `#0f172a` (Slate 900) for contrast (exceeding WCAG AAA standards).
  - Text Secondary: `#475569` (Slate 600) for contextual metadata.
  - Text Muted: `#64748b` (Slate 500) for timestamps and field annotations.

## Typography

The typographic system relies on **IBM Plex Sans** (with its companion **IBM Plex Sans Arabic**), selected for its engineered legibility, distinct contemporary geometric skeleton, and cultural authenticity. 

- **Arabic Vertical Rhythm:** Arabic glyphs feature taller ascenders and deeper descenders than Latin letterforms. All line-height values are intentionally augmented by 15-20% relative to standard Latin typescales to prevent diacritic and loop collisions.
- **Numerals & Metrics:** Western Arabic digits (1, 2, 3) or Eastern Arabic numerals (١، ٢، ٣) maintain aligned baselines and fixed tabular spacing within financial impact reports and donation counters.
- **Weight Strategy:** Headlines employ bold (700) and semi-bold (600) weights to anchor editorial storytelling, while informational bodies sit comfortably on medium (500) and regular (400) weights to retain clarity on mobile screens.

## Layout & Spacing

The layout philosophy follows an asymmetrical, content-first grid designed to accommodate bilingual RTL-predominant views:

- **Grid Framework:** A 12-column desktop grid (max-width `1280px`), adapting to 8 columns on tablet and 4 columns on mobile viewports.
- **RTL Flipping Discipline:** Margin values, paddings, and column ordering invert across the horizontal axis (`direction: rtl`). Reading starts from top-right down to bottom-left. Interactive icons (chevrons, back navigation, progress bars) dynamically reverse orientation, except for universal metrics (e.g., media player controls, numeric timelines).
- **Rhythmic Densities:** Generous breathing room (`space-lg`, `space-xl`) between campaign narratives and donation interfaces reduces cognitive fatigue and encourages thoughtful decision-making.

## Elevation & Depth

This design system conveys depth through **tonal layering and ambient warmth**, strictly avoiding harsh artificial dropshadows:

- **Surface Layers:**
  - `Level 0 (Canvas)`: `#fbfaf8` — Base canvas.
  - `Level 1 (Cards & Static Containers)`: `#ffffff` paired with a crisp hairline border (`1px solid rgba(30, 41, 59, 0.08)`).
  - `Level 2 (Interactive Floating Elements / Modals)`: `#ffffff` supported by an ambient, warm shadow (`box-shadow: 0 12px 32px -4px rgba(25, 47, 82, 0.06), 0 4px 12px -2px rgba(25, 47, 82, 0.03)`).
- **Tactile Transitions:** Interactive elevation changes rely on subtle micro-translates (`translateY(-2px)`) coupled with soft warm amber glow highlights on active focus states.

## Shapes

The design system adopts a **Balanced Rounded** visual language (`roundedness: 2`):

- **Micro Components (Pills, Badges, Input Steppers):** Defined with standard rounded radii (`0.5rem`) or fully circular pills to indicate interactive status.
- **Cards, Donorship Containers, and Modals:** Utilize `1rem` (`rounded-lg`) for external perimeters and `0.75rem` for nested image surfaces, creating organic containment.
- **Structural Integrity:** Corners maintain smooth curvatures to complement the fluid loops and ligatures of the Arabic script without appearing juvenile.

## Components

### Buttons
- **Primary (Donation & Direct Action):** Solid `#192f52` background with `#ffffff` typography. On hover, subtly lifts with an internal warmth accent. For urgent relief campaigns, an alternate primary variant uses `#e11d48` (Crimson Coral).
- **Secondary (Direct Giving / Quick Amounts):** Solid `#d97706` background with high-contrast `#ffffff` typography.
- **Outline / Ghost:** Transparent background with `1.5px solid #192f52` and `#192f52` text. Used for secondary inquiries, annual reports, and field documentation downloads.
- **Button Icons:** Directional icons (such as trailing arrows) automatically mirror in RTL mode, appearing on the left side of the label for forward actions.

### Cards
- **Campaign / Appeal Card:** A white surface with a `1px` subtle outline (`#e2e8f0`). Features a high-resolution 16:9 imagery block, a status badge located at the top-right corner, an Arabic typography hierarchy, an integrated funding progress track, and quick-pledge action buttons.
- **Impact Metric Card:** Clean tinted container (`#f8fafc`) featuring large numerical impact figures in tabular numbers alongside descriptive context.

### Progress Bars (Campaign Completion)
- Background track set to `#e2e8f0` with height fixed to `8px` or `12px` (`rounded-full`).
- Active progress fill in `#d97706` (or `#192f52`), filling naturally from **right to left** in accordance with native RTL reading.

### Form Inputs & Donation Presets
- **Preset Amount Chips:** Border-defined pill buttons (`1px solid #cbd5e1`) with bold localized currency displays (e.g., `100 ر.س` or `50 $`). Selected state: solid `#192f52` text and outline, with a soft tint background (`rgba(25, 47, 82, 0.04)`).
- **Text & Numeric Inputs:** Minimal slate borders with generous internal padding. Currency indicators are placed in the right inset slot, following RTL numeric convention.

### Badges & Category Tags
- Pill-shaped tags using low-opacity tints of functional colors:
  - Emergency / Urgent Relief: `#ffe4e6` background with `#be123c` text.
  - Sustainable Development / Education: `#fef3c7` background with `#92400e` text.
  - Institutional / Governance: `#e0e7ff` background with `#3730a3` text.