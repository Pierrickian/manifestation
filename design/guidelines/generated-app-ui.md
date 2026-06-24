# Generated app UI guidelines

## Scope

This document records the current UI contract implied by Creatia generated-app rendering. It documents current sources only and does not edit existing styles.

## Current sources

- `src/platform/ai/designSystem.js` exposes the current `Creatia` design system values sent or referenced by AI generation flows.
- `src/platform/ai/renderers/HtmlViewer.jsx` wraps generated HTML with Creatia UI guards, runtime diagnostics, callback handling, and fallback runtime content.
- `src/style.css` defines the host application shell, AI overlay, viewer behavior, and mobile-first visual language.
- `replit.md` defines the product tone: a soft exploration guide, not a rigid form or absolute verdict.

## Design system baseline

Generated UI should align with the documented Creatia baseline:

- dark background and surface colors;
- purple primary and secondary accents;
- Inter/system UI typography;
- rounded surfaces around `16px` and larger cards around `20px`–`24px`;
- compact spacing based around `12px`;
- smooth but short motion.

## Host compatibility

Generated apps are rendered in `HtmlViewer` and can receive injected guard UI. They should remain compatible with:

- the start-panel guard, which detects start/play buttons and hides intro panels after activation;
- the AI activity dot and runtime step log;
- the runtime debug button and bottom-sheet/sidebar debug panel;
- fallback runtime content rendered into a fixed panel when no generated consumer handles a runtime payload;
- host bridge callbacks through `window.requestAiGeneration` and `window.applyRuntimePayload`.

## Interaction rules

- Primary user actions should be semantic buttons or links.
- AI/runtime triggers should use recognizable trigger metadata when needed, such as `data-ai-trigger`, `data-runtime-trigger`, `data-generation-trigger`, `data-preload-trigger`, or `data-trigger`.
- Generated apps should emit intent and render local state, while Creatia owns orchestration, persistence, diagnostics, and runtime execution.
- If a runtime payload cannot be consumed by app code, the host fallback renderer may show title, narrative, choices, chips, bullets, HTML fragments, and state diagnostics.

## Product tone

Generated app copy should preserve the Manifestation tone when the app is in that product context:

- use gentle, non-absolute phrasing;
- show how the path or result was built;
- keep needs and colors subtle rather than overloaded with spiritual certainty;
- make the next action obvious on mobile.
