export const sessionActionTypes = {
  setStep: 'session/set-step',
  addChoice: 'session/add-choice',
  setResults: 'session/set-results',
  setTrace: 'session/set-trace',
  reset: 'session/reset'
}

export function sessionReducer(session, action) {
  switch (action.type) {
    case sessionActionTypes.setStep:
      return {
        ...session,
        currentStep: action.step,
        updatedAt: new Date().toISOString()
      }
    case sessionActionTypes.addChoice:
      return {
        ...session,
        choices: [...session.choices, action.choice],
        updatedAt: new Date().toISOString()
      }
    case sessionActionTypes.setResults:
      return {
        ...session,
        results: action.results,
        updatedAt: new Date().toISOString()
      }
    case sessionActionTypes.setTrace:
      return {
        ...session,
        trace: action.trace,
        updatedAt: new Date().toISOString()
      }
    case sessionActionTypes.reset:
      return action.session
    default:
      return session
  }
}
