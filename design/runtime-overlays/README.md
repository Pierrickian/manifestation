# Runtime overlays

## Scope

This directory documents current Creatia runtime overlay behavior. It does not introduce new overlay styles or change existing runtime code.

## Current source

Runtime overlays are currently implemented in `src/platform/ai/renderers/HtmlViewer.jsx`, with host application overlay styling also present in `src/style.css`.

## Current overlay inventory

### Start panel guard

`HtmlViewer` injects a start-panel guard unless the generated HTML already includes one. It searches for start/play buttons, marks the nearest panel as active, sets `aria-controls`, and hides the panel shortly after activation with `aria-hidden="true"`.

### AI activity dot

The AI activity monitor injects a fixed top-right dot with a spinner. It is safe-area-aware, visually lightweight, non-interactive, and becomes visible while runtime generation is active.

### Runtime step log

When debug behavior is enabled, a fixed top-left step log can show runtime events in chronological order. It uses an `aria-live` region and compact text so runtime progress remains inspectable.

### Runtime debug button and panel

The debug button opens a runtime debug panel. On mobile, the panel behaves like a bottom sheet. At the desktop overlay breakpoint, it becomes a left-side panel. The panel can display runtime status, capability alignment, continuation plan, preload entries, timelines, AI requests, responses, raw responses, decisions, and errors.

### Runtime content fallback

When a generated app does not provide a consumer for a valid runtime payload, the host can render fallback content in a fixed bottom panel. The fallback panel can display generated title, narrative, choices, chips, bullets, HTML fragments, and payload diagnostics.

### Host AI overlay

`src/style.css` also defines `.creatia-ai-overlay`, a host-level fixed top-right AI status pill with a spinner. Inside `.html-viewer`, this overlay is offset lower to avoid the viewer header.

## Overlay compatibility guidelines

- Generated apps should avoid placing essential controls only in top-left, top-right, or bottom fixed zones without enough spacing.
- Generated apps should keep primary actions semantic so the guard can detect and manage them.
- Overlay motion should remain short; spinner animation is paused or reduced when relevant host state and reduced-motion rules apply.
- Debug UI is for inspection and should not become the primary generated-app interaction path.
