# Rule modules

> Agent governance: before changing rule architecture or conventions, read `.agent/README.md` and `.agent/skills/architecture.md`. The `.agent/skills/` directory is authoritative for project conventions.

Rules are independent gameplay modules. A rule should be understandable, testable, enabled, disabled, and reviewed without requiring unrelated rule changes.

Each rule lives in its own folder and exports a plain object named `rule`:

```js
export const rule = {
  id: 'needs-scoring',
  label: 'Needs scoring',
  version: 1,
  config,
  isEnabled(context) {},
  getInitialState(context) {},
  getNextStep(context, ruleState) {},
  applyAction(context, ruleState, action) {},
  getResultContribution(context, ruleState) {},
  getTrace(context, ruleState) {}
}
```

Rules must not own the whole app state. Rules should return structured steps, choices, result contributions, and trace entries. UI rendering belongs to shared gameplay components or to rule-local components when a rule needs custom presentation.

Use `config.json` inside a rule folder for tunable labels, thresholds, question lists, weights, colors, or copy when it improves reviewability. Keep behavior in JavaScript and data in JSON.

The current wizard remains in place during the first architecture step to preserve behavior. Future PRs can migrate one rule at a time into this folder.
