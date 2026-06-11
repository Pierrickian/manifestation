export const requiredRuleFields = [
  'id',
  'label',
  'version',
  'isEnabled',
  'getInitialState',
  'getNextStep',
  'applyAction',
  'getResultContribution',
  'getTrace'
]

export function validateRuleContract(rule) {
  if (!rule || typeof rule !== 'object') {
    return ['Rule must be a plain object.']
  }

  return requiredRuleFields.reduce((errors, field) => {
    if (!(field in rule)) {
      return [...errors, `Rule is missing "${field}".`]
    }

    if (
      ['isEnabled', 'getInitialState', 'getNextStep', 'applyAction', 'getResultContribution', 'getTrace'].includes(field) &&
      typeof rule[field] !== 'function'
    ) {
      return [...errors, `Rule field "${field}" must be a function.`]
    }

    return errors
  }, [])
}

export function isValidRule(rule) {
  return validateRuleContract(rule).length === 0
}
