const DEFAULT_ENDPOINT = '/api/ai'

export async function requestAiCompletion({ kind, prompt, metadata, signal, endpoint = DEFAULT_ENDPOINT }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, context: { prompt, metadata } }),
    signal
  })

  const text = await response.text()
  let payload = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { text } }

  if (!response.ok) {
    throw new Error(payload.message || payload.error || `La génération IA a échoué (${response.status}).`)
  }

  return payload
}
