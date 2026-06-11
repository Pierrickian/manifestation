export function createSessionId(prefix = 'session') {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createSession({ ruleSet = [], initialContext = {} } = {}) {
  return {
    id: createSessionId(),
    ruleSet,
    currentStep: null,
    choices: [],
    results: [],
    trace: [],
    context: initialContext,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}
