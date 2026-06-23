# Prompting skill

## Purpose

Use this skill before changing AI prompts, prompt builders, system messages, runtime generation contracts, JSON response schemas, or fallback behavior.

## Keystone rule

The overloaded prompt is the keystone of Creatia. Runtime behavior cannot be understood only by reading UI code or generated HTML; agents must inspect the real prompt path that reaches the AI.

Before changing runtime behavior, identify:

- the system instructions injected into the AI request;
- the user/runtime intent sent by Creatia;
- the expected response schema;
- whether the response uses `runtimePayload`, full HTML, or another contract;
- the code path that consumes the response.

## Prompt governance

- Keep responsibilities explicit between Creatia, the generated application, and the AI.
- Do not ask generated applications to own secrets, persistence, host diagnostics, or arbitrary future app changes.
- Do not silently change a response format; update the runtime skill and tests or documentation that explain the contract.
- When a prompt change validates a new architecture or convention, update `.agent/skills/` in the same PR.

## Safety and fallback

If an AI response is invalid, the application should preserve the last valid user experience where possible and expose enough diagnostics for debugging.

Do not hide prompt-contract mismatches behind silent fallback behavior.
