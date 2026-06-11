export function createPromptIntent({ purpose, context = {}, constraints = [] }) {
  return {
    purpose,
    context,
    constraints
  }
}
