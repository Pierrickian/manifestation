# Creatia runtime rearchitecture

This document is historical context for a full HTML replacement proposal.

The official source of truth for the current Creatia runtime operational contract is `runtime-api/creatia-runtime/v1/`. The canonical runtime governance entry point for agents remains `.agent/skills/runtime.md`, which points to that versioned API rather than redefining it.

Current validated direction, summarized without restating the contract:

- the overloaded prompt is the keystone of Creatia;
- runtime changes must begin by analyzing the prompt actually sent to the AI;
- responsibilities must remain explicit between Creatia, the generated application, and the AI;
- the validated runtime path is the v1 `runtimePayload` callback loop documented in `runtime-api/creatia-runtime/v1/`;
- complete HTML replacement remains allowed for future evolution, but is not the default v1 strategy;
- agents must never remove a validated path in favor of a theoretical architecture that has not demonstrated equal reliability.

Prompts, skills, healthchecks, tests and implementations must stay aligned with `runtime-api/creatia-runtime/v1/`. Historical full-replacement ideas in this document must not be used to override the v1 runtime contract.

Agents must read `.agent/README.md` and `.agent/skills/` before using any historical proposal from this file.
