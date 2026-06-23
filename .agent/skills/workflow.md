# Agent workflow skill

## Purpose

Use this skill at the beginning and end of every agent change.

## Discovery workflow

1. Read `.agent/README.md`.
2. Read all files in `.agent/skills/`.
3. Read `replit.md` for workspace, stack, and product instructions.
4. Search for local documentation relevant to the touched area.
5. Treat `.agent/skills/` as authoritative when older documents conflict.

## Change workflow

Before editing code or docs, classify whether the change touches:

- architecture;
- runtime behavior;
- AI prompting;
- agent workflow;
- project conventions;
- rule/module responsibilities.

If it does, update the corresponding skill in `.agent/skills/` as part of the same change.

## Review workflow

Before finishing:

- verify references point agents to `.agent/README.md` and `.agent/skills/`;
- ensure no new architectural direction exists only in code, comments, or an old document;
- run the relevant project check, at minimum `npm run build` for application changes;
- preserve validated runtime paths unless a new path has been demonstrated and documented in the skills.
