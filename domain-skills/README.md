# Creatia domain skills

`domain-skills/` is the documentary home for optional **business/domain skills** that may later guide generated applications. A domain skill describes domain knowledge, vocabulary, interaction patterns, examples, tone, safety constraints, and domain-specific UX expectations.

## Current status

This directory is intentionally exploratory. The repository may already contain product features or domain candidates, but they are not automatically reusable domain skills.

See `inventory.md` for the current distinction between:

- existing features;
- existing business/domain areas;
- domain skills actually extracted;
- hypothetical future domain skills.

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

## Candidate documents

Candidate documents in `candidates/` are **not active skills**. They are draft descriptions that can help decide whether a domain deserves extraction into a reusable skill later.
