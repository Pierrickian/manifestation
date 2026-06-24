# Accessibility guidelines

## Scope

This document records accessibility practices already visible in the current sources. It is documentation only and does not modify styles or runtime behavior.

## Current sources

- `src/style.css` contains global focus-visible styling, tap-highlight handling, reduced-motion overrides, large touch targets, and responsive layout rules.
- `src/platform/ai/renderers/HtmlViewer.jsx` injects runtime UI guards that add ARIA attributes, live/status regions, labels, hidden states, and debug controls inside generated app iframes.
- `replit.md` defines a mobile-first product with large touch targets, concise text, and clear hierarchy.

## Current accessibility patterns to preserve

- **Keyboard visibility:** buttons use a visible `focus-visible` outline with offset.
- **Touch ergonomics:** main choices use large minimum heights and full-width rows on mobile.
- **Motion safety:** `prefers-reduced-motion: reduce` collapses animation and transition durations.
- **Semantic status surfaces:** runtime step logs and fallback content use status-oriented ARIA attributes such as `aria-live` and `role="status"` where generated runtime feedback is injected.
- **Controlled visibility:** the generated start panel guard applies `aria-controls` to start buttons and `aria-hidden` when the intro panel is dismissed.
- **Debug discoverability:** runtime debug controls use button elements and labels rather than non-semantic clickable containers.

## Generated-app expectations

Generated applications shown through `HtmlViewer` should remain usable when the host injects overlays and guards. Generated content should therefore:

- keep primary actions as real `button`, `a`, or `[role="button"]` elements;
- avoid hiding focus outlines;
- avoid relying on continuous motion to communicate state;
- leave room for fixed host overlays at top-right, top-left, and bottom safe-area positions;
- expose important progress and generated updates as text, not only visuals.

## Review checklist

- Can a keyboard user see where focus is?
- Are primary mobile controls large enough to tap comfortably?
- Does reduced motion remain respected?
- Are runtime or AI states announced or visible as text?
- Do overlays avoid blocking the generated app's primary action path?
