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

The operational API between Creatia host, generated applications, and runtime AI is documented in `runtime-api/creatia-runtime/v1/`. Keep that versioned documentation aligned with runtime bridge, prompt, healthcheck, or message-shape changes. Additive changes may stay in v1; breaking message or shape changes require a new versioned layer.

## Callback-driven Co-Create runtime contract

Some Co-Create apps are callback-driven: adaptive interviews, questionnaires, coaches, teachers, dungeons, stories, game masters, and progressive experiences should treat the validated primary user action as the AI trigger. Generated apps should call the host-injected `window.requestAiGeneration({ trigger, state, continuationPlan, preload, context })` immediately for semantic triggers such as `answer_submitted`, `choice_selected`, `question_answered`, `continue_pressed`, `next_requested`, `needs_next_step`, `runtime_generation_requested`, `ai_request`, `needs_generation`, `preload_requested`, `branch_requested`, and `content_exhausted`.

The runtime must classify direct `requestAiGeneration` calls from generated Co-Create apps as sufficient intent for `runtime_generation` unless explicitly blocked. The host bridge response must be consumable by generated apps and include `status: "ok"`, `traceId`, `payload`, `runtimePayload`, and `statePatch` on success.

Runtime metadata is operational, not decorative. Co-Create projects must persist non-empty `continuationPlan` and `preload` metadata, and runtime requests must merge project, generated-app, and request-specific metadata. Request-specific metadata can drive runtime generation even when host-level metadata is missing.
