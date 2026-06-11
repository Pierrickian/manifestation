export function selectCurrentStep(session) {
  return session?.currentStep || null
}

export function selectChoices(session) {
  return session?.choices || []
}

export function selectTrace(session) {
  return session?.trace || []
}

export function selectResults(session) {
  return session?.results || []
}
