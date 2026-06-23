# Creatia domain skills

This directory contains optional **business/domain skills** for generated applications. A domain skill describes product knowledge, interaction patterns, vocabulary, examples, tone, constraints, and domain-specific UI needs.

## Hard boundary

A domain skill **never defines the Creatia runtime API**.

A domain skill must not define, override, fork, stub, or reinterpret:

- `window.requestAiGeneration`;
- `window.applyRuntimePayload`;
- host/iframe postMessage envelopes;
- `runtime_generation` response shapes;
- `runtimePayload` projection rules;
- diagnostics, repair, persistence, import/export, or host orchestration contracts.

When a domain experience needs runtime AI, it declares the need for an existing system capability such as `CreatiaCoCreate` or `CreatiaRuntimeGenerator`. The runtime API remains owned by `system-capabilities/` and the normative versioned contract in `runtime-api/creatia-runtime/v1/`.

## What a domain skill may define

A domain skill may define:

- domain vocabulary and user-facing tone;
- domain-specific question flows or content heuristics;
- examples and anti-examples;
- accessibility, safety, or UX constraints for that domain;
- which existing system capabilities it requires.
