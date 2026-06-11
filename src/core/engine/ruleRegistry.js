export const ruleRegistry = {}

export const defaultRuleSet = []

export function getRule(ruleId) {
  return ruleRegistry[ruleId] || null
}

export function getRules(ruleIds = defaultRuleSet) {
  return ruleIds.map(getRule).filter(Boolean)
}

export function getEnabledRules(context, ruleIds = defaultRuleSet) {
  return getRules(ruleIds).filter((rule) => rule.isEnabled(context))
}
