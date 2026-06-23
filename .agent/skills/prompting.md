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

## Skill maintenance

Whenever a new architectural rule, responsibility, runtime contract, prompt contract, or evolution mechanism becomes validated, update the corresponding skill in the same PR. No architectural direction may exist only in code or prompts alone.

## Callback-driven Co-Create prompting

The overloaded prompt must explicitly teach generated Co-Create apps that adaptive/evolving/interview/questionnaire/coach/teacher/dungeon/story/game-master/progressive experiences may use the primary user action itself as the AI trigger. The generated app must call the host bridge immediately after the validated answer/choice/action and must not wait for a separate AI+ button, rely only on preload, or simulate a future IA recall locally.

Runtime-generation prompts must include the traceId, trigger, currentState, concise continuationPlan, preload, and context. For adaptive interviews/questionnaires, runtime AI must return a `runtimePayload` with the next question in `statePatch.currentQuestion` or an `items` entry with `type: "question"`; it must not return raw analysis only or full HTML unless the runtime explicitly requests full replacement.
