# Creatia Runtime Direction

This document is the architectural source of truth.

If an agent changes direction, this document must be updated in the same PR.

## Current validated direction

Creatia is the application.
Evolutia is the platform hosting Creatia.

The first objective is not arbitrary HTML replacement.
The first objective is a reliable AI callback loop.

Validated proof:
- A generated page can trigger Creatia.
- Creatia can call the AI.
- The AI can return a runtimePayload.
- The generated page can update itself through applyRuntimePayload.

This path is currently working and must be considered the reference implementation.

## Mandatory analysis before any architecture change

Agents must read and analyse:
- promptBuilder
- runtime prompt generation
- injected system prompt
- runtime_generation contract

The overloaded prompt is the keystone of the system.

Do not redesign the runtime without first understanding:
- what the generated app receives
- what Creatia sends
- what the AI returns
- what applyRuntimePayload consumes

## Responsibility split

Creatia owns:
- AI orchestration
- trace ids
- diagnostics
- persistence
- import/export
- runtime request execution

Generated app owns:
- rendering
- local state
- user interactions
- runtime trigger emission

AI owns:
- runtime payload generation
- optional future full page generation

## Accepted evolution paths

Path A (current validated path)
Runtime payload updates.

Path B (future)
Full HTML replacement.

Path B must not replace Path A until it demonstrates equal reliability.

## Failure rule

Never remove a validated working path in favor of a theoretical architecture.

Working callback loops have priority over architectural purity.
