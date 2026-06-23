# Runtime skill

## Purpose

Use this skill before changing Creatia, generated applications, runtime orchestration, runtime payloads, callbacks, HTML replacement, diagnostics, persistence, import/export, or AI runtime contracts.

## Current validated direction for Creatia

Creatia is the application. Evolutia is the host platform around it.

The overloaded prompt is the keystone of the system and a critical architectural component.

Any runtime change must begin by analyzing the prompt actually sent to the AI, including:

- prompt builder logic;
- runtime prompt generation;
- injected system prompt;
- `runtime_generation` contract;
- what Creatia sends;
- what the generated app receives;
- what the AI returns;
- what `applyRuntimePayload` consumes.

## Validated path

`runtimePayload` is currently the validated evolution path.

Validated proof:

- A generated page can trigger Creatia.
- Creatia can call the AI.
- The AI can return a `runtimePayload`.
- The generated page can update itself through `applyRuntimePayload`.

This callback loop is the reference implementation until a replacement path demonstrates equal reliability.

## Responsibility split

Creatia owns:

- AI orchestration;
- persistence;
- diagnostics;
- import/export;
- project history;
- continuation execution;
- runtime execution.

The generated application owns:

- rendering;
- local interaction;
- local UI state;
- intent emission.

The AI owns:

- generation;
- runtimePayload generation;
- optional future full application generation.

## HTML replacement policy

Complete HTML replacement remains allowed, but it is not the default strategy.

A future full-replacement path may be used only when it preserves the validated callback loop or demonstrates reliability equal to the current `runtimePayload` path.

## Failure rule

Never remove a validated working path in favor of a theoretical architecture.

Working callback loops have priority over architectural purity.

## Skill maintenance

Whenever a new architectural rule, responsibility, runtime contract, prompt contract, or evolution mechanism becomes validated, update the corresponding skill in the same PR. No architectural direction may exist only in code.

## Operational API documentation

`runtime-api/creatia-runtime/v1/` is the official source of truth for the Creatia runtime operational contract. This skill records governance and validated direction only; it must not redefine bridge message shapes, runtime result envelopes, payload projection rules, or runtime field stability outside that versioned API documentation.

Prompts, generated-app instructions, healthchecks, tests, bridge code, and implementation diagnostics must stay aligned with `runtime-api/creatia-runtime/v1/`. Additive contract clarifications must update that v1 documentation and the aligned prompts/tests/healthchecks together. Breaking message or shape changes require a new versioned layer; do not create one unless explicitly requested and validated.

## Callback-driven Co-Create runtime contract

Some Co-Create apps are callback-driven: adaptive interviews, questionnaires, coaches, teachers, dungeons, stories, game masters, and progressive experiences should treat the validated primary user action as the AI trigger. The normative request/response shapes, bridge responsibilities, allowed aliases, metadata handling, and generated-app obligations are defined in `runtime-api/creatia-runtime/v1/`.

Keep only this governance summary here: generated apps emit intent, Creatia orchestrates runtime generation, the AI returns a consumable `runtimePayload`, and the generated app applies it without taking over host responsibilities. Do not duplicate or reinterpret the v1 runtime contract in this skill.
