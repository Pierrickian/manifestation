export function createButtonAction(type, payload = {}) {
  return {
    type,
    payload,
    createdAt: new Date().toISOString()
  }
}

export function createChoiceAction(choice) {
  return createButtonAction('choice/select', { choice })
}
