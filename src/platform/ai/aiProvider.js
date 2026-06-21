const DEFAULT_ENDPOINT = '/api/ai'

function isQuotaError(status, payload = {}) {
  const text = [payload.error, payload.message, payload.code, payload.type, payload.details]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return status === 429 || /quota|credit|billing|insufficient_quota|rate limit|rate_limit|exceeded/.test(text)
}

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
    if (isQuotaError(response.status, payload)) {
      const quotaError = new Error('Quota OpenAI insuffisant : la génération ne peut pas démarrer tant que les crédits ou la facturation ne sont pas rétablis.')
      quotaError.code = 'openai_quota_exceeded'
      quotaError.status = response.status
      quotaError.payload = payload
      throw quotaError
    }

    const error = new Error(payload.message || payload.error || `La génération IA a échoué (${response.status}).`)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}
