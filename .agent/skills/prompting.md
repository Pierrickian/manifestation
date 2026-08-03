# Prompting skill

## Purpose

Use this skill before changing AI prompts, prompt builders, system messages, runtime generation contracts, JSON response schemas, or fallback behavior.

## Keystone rule

Creatia is the application and Evolutia is the host platform. The overloaded prompt is a critical architectural component and the keystone of Creatia. Runtime behavior cannot be understood only by reading UI code or generated HTML; agents must inspect the real prompt path that reaches the AI.

Before changing runtime behavior, identify:

- the system instructions injected into the AI request;
- the user/runtime intent sent by Creatia;
- the expected response schema;
- whether the response uses the currently validated `runtimePayload` evolution path, full HTML, or another contract;
- the code path that consumes the response.

## Capability and domain prompt layering

Prompt assembly must distinguish structural `system-capabilities/` from optional `domain-skills/`. System capabilities may contribute runtime API instructions, contracts, compatibility fragments, diagnostic fragments, repair fragments, and Co-Create prompt fragments. Domain skills may contribute domain vocabulary, examples, tone, and business constraints only.

Domain skills must never define the Creatia runtime API, bridge functions, message envelopes, `runtime_generation` response shapes, or `runtimePayload` projection rules. If a domain skill needs live AI behavior, the prompt must bind it to an existing system capability such as `CreatiaCoCreate` or `CreatiaRuntimeGenerator` rather than letting the domain layer invent a runtime contract.


## Prompt fragments

`prompt-fragments/` contains non-canonical prompt-ready documentation snippets. Every fragment must include source references to the contracts, protocols, runtime API, design documents, or skills it derives from. A fragment can help review or prepare prompt language, but it does not become active prompt behavior until the prompt builder is explicitly changed.

Do not treat fragments as a replacement for `runtime-api/creatia-runtime/v1/`, `contracts/`, `protocols/`, or `.agent/skills/`. If a fragment reveals a durable prompt rule, update the canonical owner in the same change before relying on the fragment.

## Documentary prompt assembly recipes

`prompt-assembly/` records separate target recipes for `create`, `co-create`, `runtime-generation`, `diagnose`, and `repair`. The recipes must keep the runtime API normative, contracts authoritative for PASS/FAIL, protocols limited to sequences, and prompt fragments explicitly derived and non-canonical. `create` excludes unnecessary runtime/Co-Create blocks; `co-create` includes bridge, callback, continuation, safety, and `runtimePayload` obligations; `runtime-generation` updates the current app rather than rebuilding it by default; `diagnose` does not repair; and `repair` requires a diagnosis. This layer is not wired to the live prompt builder.

## Prompt governance

- Keep responsibilities explicit between Creatia, the generated application, and the AI.
- Full HTML replacement remains allowed, but it is not currently the default path.
- Never remove the validated `runtimePayload` path in favor of a theoretical architecture.
- Do not ask generated applications to own secrets, persistence, host diagnostics, or arbitrary future app changes.
- Do not silently change a response format; update the runtime skill and tests or documentation that explain the contract.
- When a prompt change validates a new architecture or convention, update `.agent/skills/` in the same PR.

## Safety and fallback

If an AI response is invalid, the application should preserve the last valid user experience where possible and expose enough diagnostics for debugging.

Do not hide prompt-contract mismatches behind silent fallback behavior.

## Prospective Capability Discovery

`Capability Discovery` is documented as a prospective classification step before Prompt Assembly. It is analysis/classification only, not generation: it must not produce HTML, runtimePayloads, final prompts, fake bridges, or executable runtime behavior. Its conceptual output is limited to `mode`, `requiredCapabilities`, `requiredNeeds`, and `constraints`. It must not be implemented as an execution pipeline until a future change provides tests, diagnostics, and preserves the validated `runtimePayload` path.

Prospectively, Discovery would feed `Capability Resolution` for matching structural needs to `system-capabilities/`, then `Skill Resolution` for optional matching to `domain-skills/`, before Prompt Assembly composes the resolved sources. `requiredNeeds` preserves product, domain, and interaction intent without assuming that a repository item with the same name exists. These resolution stages and their output schemas are not implemented or standardized. Until they are validated, prompt assembly may remain manual or use explicit heuristics.

## Skill maintenance

Whenever a new architectural rule, responsibility, runtime contract, prompt contract, or evolution mechanism becomes validated, update the corresponding skill in the same PR. No architectural direction may exist only in code or prompts alone.

## Callback-driven Co-Create prompting

The overloaded prompt must explicitly teach generated Co-Create apps that adaptive/evolving/interview/questionnaire/coach/teacher/dungeon/story/game-master/progressive experiences may use the primary user action itself as the AI trigger. The generated app must call the host bridge immediately after the validated answer/choice/action and must not wait for a separate AI+ button, rely only on preload, or simulate a future IA recall locally.

Runtime-generation prompts must stay aligned with the normative Creatia Runtime API v1 contract in `runtime-api/creatia-runtime/v1/`. Keep prompt wording sufficient for the AI to produce compatible requests and `runtimePayload` responses, but do not introduce prompt-only runtime shapes that diverge from the versioned API documentation.
