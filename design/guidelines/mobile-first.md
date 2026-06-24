# Mobile-first guidelines

## Scope

This document records the current mobile-first UI direction from the existing repository sources. It does not change application styles.

## Current sources

- `replit.md` defines Manifestation as a React + Vite mobile-first application and calls for CSS mobile-first.
- `src/style.css` implements the mobile baseline first, then adds larger-screen refinements through media queries.
- `src/platform/ai/designSystem.js` names the active design system `Creatia` and exposes base color, spacing, radius, font, and motion values.
- `src/platform/ai/renderers/HtmlViewer.jsx` injects guarded runtime overlays into generated HTML, with fixed, safe-area-aware mobile positions and a desktop refinement at `720px`.

## Current layout principles

- Start from portrait mobile. The shell is capped at `720px`, centered, and padded with safe-area-aware top and bottom values.
- Use stacked grid layouts by default, with concise gaps and card groupings.
- Add columns only after the mobile layout is already usable. Current examples include the `680px` breakpoint for two-column feeling grids and multi-column action layouts.
- Preserve wide touch targets. Primary wizard actions currently use a `58px` minimum height and full-width mobile presentation.
- Keep text short and hierarchical. Current heading sizes use `clamp()` so they remain prominent without requiring separate desktop-first rules.

## Current visual language

- Dark, atmospheric surfaces with radial gradients, translucent panels, soft borders, blur, and layered shadows.
- Warm off-white text (`#fffaf4`) is the main app text color in CSS, while `src/platform/ai/designSystem.js` documents a pure white text token for generated design context.
- Cards and panels use rounded corners (`20px` to `24px`) and glass-like backgrounds.
- Accent colors are used sparingly, especially warm yellow for active, focus, spinner, or runtime emphasis.

## Implementation guardrails

- Do not retrofit desktop-first rules over the existing cascade.
- Prefer additive media queries after the mobile baseline.
- Keep touch actions clear: full-width buttons, visible selected states, and enough vertical space.
- Respect safe-area insets for fixed or full-height UI.
- Keep animations short and user-triggered; honor the existing reduced-motion rule.
