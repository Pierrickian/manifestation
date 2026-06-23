# Creatia Runtime Direction

The official source of truth for the Creatia runtime operational contract is now:

```txt
runtime-api/creatia-runtime/v1/
```

`.agent/skills/runtime.md` remains the governance entry point for agents, but it intentionally points to the versioned Runtime API instead of redefining bridge message shapes, runtime payload fields, or generated-application obligations.

Agents must read `.agent/README.md` and every file in `.agent/skills/` before changing runtime, prompting, architecture, or workflow behavior. When the runtime contract is involved, prompts, skills, healthchecks, tests, bridge code, and implementation diagnostics must remain aligned with `runtime-api/creatia-runtime/v1/`.

This document is kept as a compatibility pointer for older references. If this file and `runtime-api/creatia-runtime/v1/` diverge on runtime contract details, `runtime-api/creatia-runtime/v1/` is authoritative.
