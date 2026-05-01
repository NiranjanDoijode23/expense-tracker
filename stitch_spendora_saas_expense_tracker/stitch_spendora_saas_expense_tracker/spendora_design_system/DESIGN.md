---
name: SpEndora Design System
colors:
  surface: '#13131b'
  surface-dim: '#13131b'
  surface-bright: '#393841'
  surface-container-lowest: '#0d0d15'
  surface-container-low: '#1b1b23'
  surface-container: '#1f1f27'
  surface-container-high: '#292932'
  surface-container-highest: '#34343d'
  on-surface: '#e4e1ed'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e4e1ed'
  inverse-on-surface: '#303038'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#2fd9f4'
  on-tertiary: '#00363e'
  tertiary-container: '#008395'
  on-tertiary-container: '#000608'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#a2eeff'
  tertiary-fixed-dim: '#2fd9f4'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e5a'
  background: '#13131b'
  on-background: '#e4e1ed'
  surface-variant: '#34343d'
typography:
  h1:
    fontFamily: Cal Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  h2:
    fontFamily: Cal Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-main:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  data-display:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is engineered for the modern financial professional who values precision, speed, and aesthetic excellence. It adopts a **Glassmorphic-Minimalist** style, characterized by deep ink-black backgrounds, translucent layering, and subtle light leaks that evoke a "Vercel-meets-Linear" editorial feel.

The brand personality is authoritative yet ethereal. It uses high-density layouts to display complex financial data without clutter, relying on transparency and blur to create a sense of depth and hierarchy. The emotional response is one of "calm control"—the interface feels light and responsive despite handling heavy analytical data.

## Colors
The palette is built on a "Dark Ink" foundation to minimize eye strain and maximize the vibrance of data visualizations. 

- **Foundation:** The deepest layer (#050508) provides the canvas for glass effects. 
- **Accents:** Indigo and Violet are used for primary actions and brand recognition, while Cyan is reserved for success states and growth indicators.
- **Glass Logic:** Borders use a highly transparent white `rgba(255,255,255,0.06)` to simulate the edge of a glass pane, catching the "light" without adding visual weight.

## Typography
This design system utilizes an editorial approach to financial data. **Cal Sans** provides a distinct, "start-up" character for headings, feeling both tight and expensive. **Inter** is the workhorse for UI elements and descriptive text, ensuring maximum legibility across all densities.

For all currency, percentages, and transaction lists, **Space Grotesk** (Monospace) is utilized to ensure tabular alignment, allowing users to scan columns of numbers with vertical precision.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid Grid**. On desktop, the main dashboard content is contained within a max-width of 1440px to prevent excessive eye travel. Internally, a 12-column grid is used with generous 24px gutters.

Spacing follows a strict 4pt rhythm. Elements that are logically grouped (e.g., an input label and its field) should use 8px spacing, while distinct sections within a glass card should use 24px padding to maintain the "premium" airy feel.

## Elevation & Depth
Depth is achieved through **Glassmorphism** rather than traditional drop shadows.

- **Layer 0 (Background):** Solid #050508.
- **Layer 1 (Standard Card):** Background #0d0d14 at 80% opacity with `backdrop-filter: blur(12px)`. 1px border `rgba(255,255,255,0.06)`.
- **Layer 2 (Elevated/Modals):** Background #141420 at 90% opacity with `backdrop-filter: blur(20px)`.
- **Interaction Depth:** On hover, cards do not use heavier shadows; instead, they utilize a `translateY(-4px)` movement and the border opacity increases to `0.12` to simulate a "lift" toward the light source.

## Shapes
The design system employs a **Rounded** aesthetic. The 0.5rem (8px) base radius ensures the UI feels modern and approachable without appearing "juvenile." Large dashboard containers and modals use a `rounded-xl` (24px) radius to soften the high-contrast dark mode environment and better frame the glass-blur effects.

## Components

### Buttons
- **Primary:** Solid Indigo gradient background. On click, scale to `0.96`.
- **Secondary:** Ghost style with the 1px white border. Fill with `rgba(255,255,255,0.03)` on hover.
- **Glass Action:** Transparent with heavy blur, used for over-image or over-chart controls.

### Cards
All cards must feature a "Light Leak" top-left corner—a subtle linear gradient from `rgba(255,255,255,0.05)` to transparent—to enhance the glass effect. Padding is fixed at 24px (`md`).

### Input Fields
Inputs are dark with #050508 backgrounds and #141420 borders. On focus, the border transitions to Primary Indigo with a 2px glow (spread: 4px, color: `rgba(99, 102, 241, 0.2)`).

### Charts & Data Visuals
Data lines use Secondary Violet and Accent Cyan. Areas under line charts should use a vertical gradient from the stroke color (at 20% opacity) to transparent.

### Hover States
Any interactive card or list item must implement a smooth `translateY(-4px)` transition over 200ms using an `ease-out` cubic-bezier curve.