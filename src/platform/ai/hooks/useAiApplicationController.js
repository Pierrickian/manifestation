import { useMemo, useRef, useState } from 'react'
import { requestAiCompletion } from '../aiProvider'
import { buildAiPrompt } from '../promptBuilder'

const PROGRESS_TEXT = ['Generating application...', 'Building interface...', 'Rendering HTML...']

export function useAiApplicationController({ rendererType, designSystem, speechEnabled = false, aiProvider = requestAiCompletion }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('Décris ce que tu veux créer.')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [progressIndex, setProgressIndex] = useState(0)
  const abortRef = useRef(null)

  const progressText = useMemo(() => PROGRESS_TEXT[progressIndex % PROGRESS_TEXT.length], [progressIndex])

  function appendTranscript(transcript) {
    setInput((current) => `${current}${current.trim() ? '\n' : ''}${transcript}`)
    setMessage('Transcription ajoutée. Tu peux modifier le texte avant envoi.')
  }

  async function submit() {
    const trimmed = input.trim()
    if (!trimmed) {
      setStatus('error')
      setError('Écris ou dicte une demande avant d’envoyer.')
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    setError(null)
    setResult(null)
    setMessage(progressText)

    const interval = window.setInterval(() => {
      setProgressIndex((index) => index + 1)
    }, 1400)

    try {
      const request = buildAiPrompt({ input: trimmed, rendererType, designSystem })
      const payload = await aiProvider({ ...request, signal: controller.signal })
      setResult(payload)
      setStatus('success')
      setMessage('Application générée.')
    } catch (submitError) {
      if (submitError?.name === 'AbortError') {
        setStatus('idle')
        setMessage('Génération annulée.')
      } else {
        setStatus('error')
        setError(submitError instanceof Error ? submitError.message : 'Impossible de générer la réponse IA.')
        setMessage('La génération a échoué.')
      }
    } finally {
      window.clearInterval(interval)
      abortRef.current = null
    }
  }

  function cancel() { abortRef.current?.abort() }

  return { input, setInput, status, message, error, result, submit, cancel, appendTranscript, speechEnabled, progressText }
}
