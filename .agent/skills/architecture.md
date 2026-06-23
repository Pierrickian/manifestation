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
- `runtime-api/creatia-runtime/v1/` is the official source of truth for the Creatia runtime operational contract.
- `runtimePayload` is the currently validated evolution path for live generated-application updates.
- Full HTML replacement remains allowed for future evolution and must not be removed.
- Full HTML replacement is not currently the default path.
- Never remove a validated working path in favor of a theoretical architecture.

## Creatia capability layering

Creatia must not model every reusable instruction as one generic `skills/` layer. Use two explicit layers instead:

- `system-capabilities/` for structural Creatia capabilities that can own contracts, runtime APIs, diagnostics, repair behavior, compatibility fragments, and prompt fragments.
- `domain-skills/` for optional business/domain skills that may describe product knowledge and domain interaction patterns but never define the Creatia runtime API.

Classifications to preserve:

- `CreatiaCompatibleApp` is a compatibility contract plus compatibility fragment.
- `CreatiaRuntimeGenerator` is a runtime capability plus output contract.
- `CreatiaDiagnoser` is a system diagnostic capability.
- `CreatiaRepairer` is a system repair capability.
- `CreatiaCoCreate` is a combination of runtime API, Co-Create contract, and prompt fragments.

A domain skill may require these system capabilities, but it must not define, fork, stub, or reinterpret `window.requestAiGeneration`, `window.applyRuntimePayload`, host/iframe message envelopes, `runtime_generation`, `runtimePayload`, diagnostics, repair, persistence, or host orchestration.

## Protocol documentation layer

`protocols/` documents operational sequences for Creatia system capabilities such as Co-Create, runtime generation, diagnostics, and repair. Protocol documents describe actors, sequence, responsibilities, inputs/outputs, and errors, while linking back to `runtime-api/creatia-runtime/v1/` for normative message shapes and runtime API details. Protocols must not duplicate or fork exhaustive runtime shapes already owned by the versioned runtime API.

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

Do not introduce a new architectural direction only in implementation code, comments, or a transient prompt. The direction must be captured in `.agent/skills/`; runtime contract details must be captured in `runtime-api/creatia-runtime/v1/`.

## Skill maintenance

Whenever a new architectural rule, responsibility, runtime contract, prompt contract, or evolution mechanism becomes validated, the corresponding skill must be updated in the same PR.

No architectural direction may exist only in code.
