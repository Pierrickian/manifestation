# Creatia system capabilities

This directory replaces a single generic `skills/` modeling layer for Creatia runtime architecture. It contains **structural capabilities**: reusable contracts, runtime APIs, diagnostics, repair flows, and prompt fragments owned by Creatia.

System capabilities may define or reference the Creatia runtime API because they describe host/runtime structure, not optional business behavior.

## Capability classification

| Capability | Classification | Owns or references |
| --- | --- | --- |
| `CreatiaCompatibleApp` | Compatibility contract + compatibility fragment | The minimum generated-app obligations needed to run inside Creatia, including bridge compatibility expectations and prompt fragments that keep generated apps compatible. |
| `CreatiaRuntimeGenerator` | Runtime capability + output contract | Runtime generation orchestration and the required runtime output shape, especially `runtime_generation` responses and consumable `runtimePayload` results. |
| `CreatiaDiagnoser` | System diagnostic capability | Host/runtime diagnostics, healthchecks, traces, mismatch reporting, and explanations of why a generated app or runtime exchange is not compatible. |
| `CreatiaRepairer` | System repair capability | Repair prompts and flows that correct invalid generated apps or metadata while preserving validated runtime paths. |
| `CreatiaCoCreate` | Runtime API combination + Co-Create contract + prompt fragments | The callback-driven Co-Create loop, including the host-injected API, Co-Create obligations, continuation metadata, preload descriptors, and prompt fragments that teach generated apps how to call Creatia. |

## Boundary with domain skills

A system capability can define host APIs, bridge behavior, runtime result envelopes, diagnostic contracts, repair rules, and prompt fragments. Optional product/business expertise belongs in `domain-skills/` and must consume these capabilities instead of redefining them.
