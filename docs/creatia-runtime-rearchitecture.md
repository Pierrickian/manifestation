# Creatia runtime rearchitecture

## Problem

The current Co-Create path asks unknown generated HTML to call back into Evolutia and apply a later response. This has led to fragile bridge, preload, continuation, fake-window and repair patches.

The new rule is simple:

Evolutia owns orchestration. Generated HTML owns rendering and local interaction only.

## V1 goal

Build one reliable loop before reintroducing patches:

1. User triggers a Co-Create continuation.
2. Evolutia collects the current project, HTML, runtime model, and intent.
3. Evolutia calls the AI from the host.
4. The AI returns a complete replacement experience.
5. Evolutia validates it.
6. Evolutia replaces the preview HTML and stores the new runtime model.

V1 favors a full HTML replacement because it is safer than DOM patching.

## Contract

The AI must return this shape:

```json
{
  "kind": "creatia_runtime_app",
  "html": "<!doctype html>...",
  "runtimeModel": {
    "version": 1,
    "state": {},
    "events": [],
    "actions": [],
    "evolutionPoints": []
  },
  "analysis": "short explanation",
  "decisions": [],
  "generatedChanges": []
}
```

## Runtime model

`runtimeModel` is the semantic source of truth for Evolutia. It explains what matters in the app, where the user is, which actions matter, and which future evolution points are safe.

The generated page may keep local state, but Evolutia should rely on `runtimeModel` for Co-Create continuation.

## Boundaries

Evolutia shell owns AI calls, import/export, persistence, trace IDs, diagnostics, history, HTML replacement and runtime model validation.

Creatia generation owns the conversion from request plus runtime model to a new experience.

Generated app owns local rendering and local interactions. It does not own AI calls, project persistence, or future arbitrary app changes.

## Why full replacement first

Full replacement avoids the unstable middle ground where the page expects `payload`, the API returns `runtimePayload`, the bridge expects `applyRuntimePayload`, generated code fakes `window.requestAiGeneration`, or DOM patches depend on unknown page structure.

In V1, if the response is valid, Evolutia replaces the HTML. If it is invalid, Evolutia keeps the previous valid app.

## Later V2

After V1 is stable, add optional patch modes:

- replace complete HTML,
- replace a named region,
- patch a button label/action,
- apply a state-only runtime model update.

Patch modes must be opt-in and declared in `runtimeModel.actions`. Unknown patches are ignored.

## Failure policy

Never fail silently.

If validation fails, keep `lastValidApplication`, show the validation error in Runtime Debug, store the raw response in diagnostics, and do not apply the invalid app.

## Implementation direction

Add a host-side method:

```js
requestRuntimeAppReplacement({ intent, currentProject, currentHtml, runtimeModel })
```

It should return:

```js
{
  ok: true,
  html,
  runtimeModel,
  diagnostics
}
```

The controller then updates the project like a normal evolution, but with a stricter runtime-app response format.

## Definition of done for V1

A minimal Co-Create app can reliably do this:

1. Show Page A.
2. User clicks Continue.
3. Evolutia calls AI.
4. AI returns Page B as complete HTML plus runtime model.
5. Evolutia replaces Page A with Page B.
6. Export/import keeps Page B and the runtime model.
7. If AI fails, Page A remains visible and the debug panel explains why.
