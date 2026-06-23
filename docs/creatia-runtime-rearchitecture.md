# Creatia runtime rearchitecture

This document is historical context for a full HTML replacement proposal.

The canonical runtime governance now lives in `.agent/skills/runtime.md`.

Current validated direction:

- the overloaded prompt is the keystone of Creatia;
- runtime changes must begin by analyzing the prompt actually sent to the AI;
- responsibilities must remain explicit between Creatia, the generated application, and the AI;
- `runtimePayload` is currently the validated path;
- complete HTML replacement remains allowed, but is not the default strategy;
- agents must never remove a validated path in favor of a theoretical architecture that has not demonstrated equal reliability.

Agents must read `.agent/README.md` and `.agent/skills/` before using any historical proposal from this file.
