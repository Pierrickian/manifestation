import { generateDiscovery as localDiscovery } from '../ai/generateDiscovery'
import { generateLinks as localLinks } from '../ai/generateLinks'
import { generateQuestion as localQuestion } from '../ai/generateQuestion'

async function requestAI(kind, context) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, context })
  })

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`)
  }

  return response.json()
}

export async function getDynamicQuestion(context) {
  try {
    const result = await requestAI('question', context)
    if (result?.question && Array.isArray(result.answers)) {
      return {
        ...result,
        source: result.source || 'ai'
      }
    }
  } catch {
    // The local engine keeps the wizard alive when the server key is absent.
  }

  return localQuestion(context)
}

export async function getDynamicDiscovery(context) {
  try {
    const result = await requestAI('discovery', context)
    if (result?.text) return result.text
  } catch {
    // Fallback stays intentionally quiet for the user.
  }

  return localDiscovery(context)
}

export async function getDynamicLinks(context) {
  try {
    const result = await requestAI('links', context)
    if (result?.needLinks || result?.pathLinks) return result
  } catch {
    // Fallback stays intentionally quiet for the user.
  }

  return localLinks(context)
}
