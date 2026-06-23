# Runtime skill

## Purpose

Use this skill before changing Creatia, generated applications, runtime orchestration, runtime payloads, callbacks, HTML replacement, diagnostics, persistence, import/export, or AI runtime contracts.

## Current validated direction for Creatia

The overloaded prompt is the keystone of the system.

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

`runtimePayload` is currently the validated path.

Validated proof:

- A generated page can trigger Creatia.
- Creatia can call the AI.
- The AI can return a `runtimePayload`.
- The generated page can update itself through `applyRuntimePayload`.

This callback loop is the reference implementation until a replacement path demonstrates equal reliability.

## Responsibility split

Creatia owns:

- AI orchestration;
- trace IDs;
- diagnostics;
- persistence;
- import/export;
- runtime request execution.

The generated application owns:

- rendering;
- local state;
- user interactions;
- runtime trigger emission.

The AI owns:

- runtime payload generation;
- optional future full-page generation.

## HTML replacement policy

Complete HTML replacement remains allowed, but it is not the default strategy.

A future full-replacement path may be used only when it preserves the validated callback loop or demonstrates reliability equal to the current `runtimePayload` path.

## Failure rule

Never remove a validated working path in favor of a theoretical architecture.

Working callback loops have priority over architectural purity.
