import { buildMessagesFromIntent } from './aiMessageBuilder'

export function createAiRequest(intent) {
  return {
    messages: buildMessagesFromIntent(intent),
    intent
  }
}
