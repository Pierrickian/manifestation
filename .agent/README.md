# Agent governance entry point

This directory is the official entry point for every AI agent, Codex session, Replit agent, or automation that changes this repository.

## Official skills location

The official project skills live in:

```txt
.agent/skills/
  architecture.md
  runtime.md
  prompting.md
  workflow.md
```

These files are the canonical governance layer for architecture, runtime direction, prompting responsibilities, and agent workflow.

## Mandatory rules for all agents

Before making any modification, every agent must:

1. Read this README.
2. Read every file in `.agent/skills/`.
3. Apply those skills even when the user prompt does not mention them.
4. Check whether the requested change introduces a new architecture, convention, responsibility split, runtime path, prompt contract, or workflow expectation.
5. Update the corresponding skill in the same change whenever such a direction evolves.

## Architecture change policy

Agents must not introduce a new architectural direction without updating the relevant skills in `.agent/skills/`.

Agents must not remove or bypass a validated implementation path in favor of a theoretical architecture that has not been demonstrated in this repo.

When runtime, prompting, or generated-application responsibilities change, update the skill that owns that topic before considering the work complete.

## Deprecated locations

Older documents in `docs/`, `replit.md`, `README.md`, or feature-local README files may still provide historical context. If they conflict with `.agent/skills/`, the `.agent/skills/` files are authoritative and must be updated first.
