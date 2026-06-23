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

## Responsibility governance

When a change creates a new responsibility or moves an existing one, update this skill and any affected runtime or prompting skill in the same PR.

Do not introduce a new architectural direction only in implementation code, comments, or a transient prompt. The direction must be captured in `.agent/skills/`.
