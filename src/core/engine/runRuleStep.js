export function getInitialRuleStates(rules, context) {
  return Object.fromEntries(rules.map((rule) => [rule.id, rule.getInitialState(context)]))
}

export function getNextRuleSteps(rules, context, ruleStates) {
  return rules
    .map((rule) => ({
      ruleId: rule.id,
      step: rule.getNextStep(context, ruleStates[rule.id])
    }))
    .filter((entry) => Boolean(entry.step))
}

export function applyRuleAction(rule, context, ruleState, action) {
  return rule.applyAction(context, ruleState, action)
}

export function collectRuleResults(rules, context, ruleStates) {
  return rules
    .map((rule) => rule.getResultContribution(context, ruleStates[rule.id]))
    .filter(Boolean)
}

export function collectRuleTrace(rules, context, ruleStates) {
  return rules.flatMap((rule) => rule.getTrace(context, ruleStates[rule.id]) || [])
}
