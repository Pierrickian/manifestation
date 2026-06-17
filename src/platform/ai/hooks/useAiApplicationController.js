import { useMemo, useRef, useState } from 'react'
import { requestAiCompletion } from '../aiProvider'
import { buildAiPrompt, buildRepairPrompt, normalizeStructuredAiResponse } from '../promptBuilder'
import { createProject, evolveProject, storeProject } from '../projectModel'
import { detectCapabilities, runGeneratedAppHealthcheck, selectGenerationStrategy } from '../generationPipeline'

const REQUEST_TIMEOUT_MS = 60000

const PATIENCE_IDEAS = [
  'Idée : demande une mini app pour apprendre, jouer ou visualiser une notion.',
  'Astuce : tu peux préciser une ambiance, un public ou un format mobile.',
  'Exemple : quiz éducatif avec score et animations douces.',
  'Exemple : tableau de bord personnel simple et tactile.'
]

export function useAiApplicationController({ mode = 'create', designSystem, speechEnabled = false, aiProvider = requestAiCompletion, onDebug } = {}) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('Décris ce que tu veux créer.')
  const [result, setResult] = useState(null)
  const [project, setProject] = useState(null)
  const [error, setError] = useState(null)
  const [ideaIndex, setIdeaIndex] = useState(0)
  const [hasTime, setHasTime] = useState(false)
  const [pipeline, setPipeline] = useState(null)
  const [healthcheck, setHealthcheck] = useState(null)
  const abortRef = useRef(null)
  const timeoutRef = useRef(null)

  const progressText = useMemo(() => PATIENCE_IDEAS[ideaIndex % PATIENCE_IDEAS.length], [ideaIndex])

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
    setHealthcheck(null)
    setIdeaIndex(0)
    setMessage(progressText)
    const detectedCapabilities = detectCapabilities(trimmed)
    const selectedStrategy = selectGenerationStrategy({ input: trimmed, capabilities: detectedCapabilities, mode, hasTime })
    setPipeline({ capabilities: detectedCapabilities, strategy: selectedStrategy })
    onDebug?.({ status: 'loading', rendererType: 'html', mode, speechEnabled, timeoutMs: REQUEST_TIMEOUT_MS, capabilities: detectedCapabilities, strategy: selectedStrategy, hasTime, startedAt: new Date().toISOString() })
    timeoutRef.current = window.setTimeout(() => {
      controller.abort()
    }, REQUEST_TIMEOUT_MS)

    const interval = window.setInterval(() => {
      setIdeaIndex((index) => index + 1)
    }, 9000)

    try {
      const request = buildAiPrompt({ input: trimmed, mode, designSystem, project, capabilities: detectedCapabilities, strategy: selectedStrategy, hasTime })
      onDebug?.({ status: 'request_ready', kind: request.kind, rendererType: request.metadata.rendererType, designSystem: request.metadata.designSystem?.themeName })
      const payload = await aiProvider({ ...request, signal: controller.signal })
      const structured = normalizeStructuredAiResponse(payload)
      structured.capabilities = { ...detectedCapabilities, ...(structured.capabilities || {}) }
      if (mode !== 'co-create') {
        structured.suggestedActions = []
        structured.continuationPlan = null
        structured.preload = []
      }
      let verification = runGeneratedAppHealthcheck(structured, selectedStrategy)
      let finalStructured = structured
      if (verification.status !== 'verified' && (hasTime || selectedStrategy.id === 'smart')) {
        const repairRequest = buildRepairPrompt({ originalRequest: trimmed, failedResponse: structured, healthcheck: verification, mode, designSystem, capabilities: detectedCapabilities, strategy: selectedStrategy })
        onDebug?.({ status: 'repair_ready', kind: repairRequest.kind, healthcheck: verification, timestamp: new Date().toISOString() })
        const repairedPayload = await aiProvider({ ...repairRequest, signal: controller.signal })
        finalStructured = normalizeStructuredAiResponse(repairedPayload)
        finalStructured.capabilities = { ...detectedCapabilities, ...(finalStructured.capabilities || {}) }
        if (mode !== 'co-create') {
          finalStructured.suggestedActions = []
          finalStructured.continuationPlan = null
          finalStructured.preload = []
        }
        verification = runGeneratedAppHealthcheck(finalStructured, { ...selectedStrategy, id: 'recovery' })
      }
      setHealthcheck(verification)
      const nextProject = storeProject(project ? evolveProject(project, trimmed, finalStructured) : createProject({ mode, request: trimmed, response: finalStructured, designSystem }))
      setProject(nextProject)
      setResult(finalStructured)
      setInput('')
      setStatus('success')
      setMessage(project ? 'Le projet a évolué.' : 'Le projet est prêt.')
      onDebug?.({
        ...(payload.debug || {}),
        status: 'success',
        source: payload.source || payload.debug?.source || 'unknown',
        rendererType: 'html',
        mode,
        hasHtml: Boolean(finalStructured.html),
        htmlLength: finalStructured.html?.length || 0,
        capabilities: finalStructured.capabilities,
        strategy: selectedStrategy,
        healthcheck: verification
      })
    } catch (submitError) {
      if (submitError?.name === 'AbortError') {
        setStatus('idle')
        setMessage('Génération annulée.')
        onDebug?.({ status: 'aborted', rendererType: 'html', timeoutMs: REQUEST_TIMEOUT_MS, timestamp: new Date().toISOString() })
      } else {
        setStatus('error')
        setError(submitError instanceof Error ? submitError.message : 'Impossible de générer la réponse pour le moment.')
        setMessage('La génération a échoué.')
        onDebug?.({ status: 'error', rendererType: 'html', errorMessage: submitError?.message || 'unknown', timestamp: new Date().toISOString() })
      }
    } finally {
      window.clearInterval(interval)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      abortRef.current = null
    }
  }

  function cancel() { abortRef.current?.abort() }

  return { input, setInput, status, message, error, result, project, submit, cancel, appendTranscript, speechEnabled, progressText, hasTime, setHasTime, pipeline, healthcheck }
}
