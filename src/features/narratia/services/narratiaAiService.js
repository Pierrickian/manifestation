import { buildChildChoicesPrompt, buildStoryPackagePrompt, narratiaSystemPrompt } from './narratiaPrompts'
import { defaultNarrators, localChildChoices, localStoryPackage } from './narratiaFallbacks'
import { validateChildChoices, validateStoryPackage } from '../utils/narratiaValidation'

const AI_ENDPOINT = '/api/ai'

async function requestNarratia(kind, prompt) {
  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      kind,
      context: {
        systemPrompt: narratiaSystemPrompt,
        prompt
      }
    })
  })

  const text = await response.text()
  if (!response.ok) throw new Error(`Narratia AI request failed: ${response.status}`)
  return JSON.parse(text)
}

export async function generateNarratiaChildChoices(parentConfiguration) {
  const prompt = buildChildChoicesPrompt(parentConfiguration)

  try {
    const payload = await requestNarratia('narratia_child_choices', prompt)
    const valid = validateChildChoices(payload)
    if (valid) return { ...valid, source: payload.source || 'ai', debug: payload.debug }
  } catch {
    // Local choices keep the bedtime flow usable when the AI endpoint is unavailable.
  }

  return localChildChoices(parentConfiguration)
}

export async function generateNarratiaStoryPackage({ parentConfiguration, childSelection, childChoices }) {
  const selectedChoices = childChoices.filter((choice) => childSelection.choiceIds.includes(choice.id))
  const prompt = buildStoryPackagePrompt({ parentConfiguration, childSelection, selectedChoices, narrators: defaultNarrators })

  try {
    const payload = await requestNarratia('narratia_story_package', prompt)
    const valid = validateStoryPackage(payload, { parentConfiguration, defaultNarrators })
    if (valid) return { ...valid, source: payload.source || 'ai', debug: payload.debug }
  } catch {
    // A complete local package preserves the two-call maximum and all replay features.
  }

  const fallback = localStoryPackage({ parentConfiguration, childSelection, selectedChoices })
  return validateStoryPackage(fallback, { parentConfiguration, defaultNarrators }) || fallback
}
