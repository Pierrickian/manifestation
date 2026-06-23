# Architecture skill

## Purpose

Use this skill before changing project structure, module responsibilities, feature boundaries, or cross-cutting conventions.

## Product architecture

Manifestation is a React + Vite mobile-first application. It is an exploratory guide, not a rigid form and not a deterministic psychological verdict.

The UI should keep a soft, reflective tone:

- Prefer phrasing such as “tu sembles peut-être chercher…”, “ce chemin pointe vers…”, or “une piste possible serait…”.
- Always preserve visibility into how a path was built: initial feeling, answer, reflections, dominant need, related needs, and discovery.
- Keep needs and colors central without turning the app into overloaded spiritual symbolism.

## Code architecture conventions

- Keep data separate from UI.
- Keep scoring logic in `src/logic/wizardScoring.js` unless this skill is updated to validate another location.
- Prefer small readable components over monolithic files.
- Keep rule modules independent, understandable, testable, enableable, disableable, and reviewable without unrelated rule changes.
- Rule modules should return structured steps, choices, result contributions, and trace entries; shared or rule-local UI components own rendering.
- Use JSON for tunable labels, thresholds, question lists, weights, colors, or copy when that improves reviewability.
- Preserve mobile-first portrait ergonomics: large touch targets, concise text, and clear hierarchy.
- Avoid heavy infinite animations; prefer short transitions triggered by user choices.

## Creatia architecture governance

- Creatia is the generated-application system being built in this repository.
- Evolutia is the host platform around Creatia.
- The overloaded prompt is a critical architectural component, not incidental copy.
- Any runtime change must begin by analyzing the actual prompt sent to the AI before changing UI, bridge, or payload code.
- `runtimePayload` is the currently validated evolution path for live generated-application updates.
- Full HTML replacement remains allowed for future evolution and must not be removed.
- Full HTML replacement is not currently the default path.
- Never remove a validated working path in favor of a theoretical architecture.

## Responsibility governance

Creatia owns:

- AI orchestration;
- persistence;
- diagnostics;
- import/export;
- project history;
- continuation execution;
- runtime execution.

Generated applications own:

- rendering;
- local interaction;
- local UI state;
- intent emission.

AI owns:

- generation;
- runtimePayload generation;
- optional future full application generation.

When a change creates a new responsibility or moves an existing one, update this skill and any affected runtime or prompting skill in the same PR.

Do not introduce a new architectural direction only in implementation code, comments, or a transient prompt. The direction must be captured in `.agent/skills/`.

## Skill maintenance

Whenever a new architectural rule, responsibility, runtime contract, prompt contract, or evolution mechanism becomes validated, the corresponding skill must be updated in the same PR.

No architectural direction may exist only in code.
