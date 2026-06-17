import { useMemo, useRef, useState } from 'react'
import { requestAiCompletion } from '../aiProvider'
import { buildAiPrompt, buildRepairPrompt, normalizeStructuredAiResponse } from '../promptBuilder'
import { createProject, evolveProject, storeProject } from '../projectModel'
import { detectCapabilities, isAutoRepairableHealthcheck, runGeneratedAppHealthcheck, selectGenerationStrategy } from '../generationPipeline'

const REQUEST_TIMEOUT_MS = 60000
const DEFAULT_REPAIR_LIMIT = 1
const DEEP_REPAIR_LIMIT = 3

const PATIENCE_IDEAS = [
  'Idée : demande une mini app pour apprendre, jouer ou visualiser une notion.',
  'Astuce : tu peux préciser une ambiance, un public ou un format mobile.',
  'Exemple : quiz éducatif avec score et animations douces.',
  'Exemple : tableau de bord personnel simple et tactile.'
]

function enforceModeBoundaries(structured, mode) {
  if (mode !== 'co-create') {
    return {
      ...structured,
      suggestedActions: [],
      continuationPlan: null,
      preload: []
    }
  }

  return structured
}

function normalizeForProject(payload, detectedCapabilities, mode) {
  const structured = normalizeStructuredAiResponse(payload)
  return enforceModeBoundaries({
    ...structured,
    capabilities: { ...detectedCapabilities, ...(structured.capabilities || {}) }
  }, mode)
}

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
  const [repairError, setRepairError] = useState(null)
  const abortRef = useRef(null)
  const timeoutRef = useRef(null)

  const progressText = useMemo(() => PATIENCE_IDEAS[ideaIndex % PATIENCE_IDEAS.length], [ideaIndex])

  function appendTranscript(transcript) {
    setInput((current) => `${current}${current.trim() ? '\n' : ''}${transcript}`)
    setMessage('Transcription ajoutée. Tu peux modifier le texte avant envoi.')
  }

  function getRepairLimit() {
    return hasTime ? DEEP_REPAIR_LIMIT : DEFAULT_REPAIR_LIMIT
  }

  async function runRepairLoop({ originalRequest, initialStructured, initialHealthcheck, detectedCapabilities, selectedStrategy, controller, maxAttempts, reason = 'auto' }) {
    let finalStructured = initialStructured
    let verification = initialHealthcheck
    let attempts = 0

    while (verification.status !== 'verified' && attempts < maxAttempts && isAutoRepairableHealthcheck(verification)) {
      const attempt = attempts + 1
      const repairRequest = buildRepairPrompt({
        originalRequest,
        failedResponse: finalStructured,
        healthcheck: verification,
        mode,
        designSystem,
        capabilities: detectedCapabilities,
        strategy: selectedStrategy,
        attempt,
        maxAttempts
      })
      onDebug?.({ status: 'repair_ready', reason, attempt, maxAttempts, kind: repairRequest.kind, healthcheck: verification, timestamp: new Date().toISOString() })
      const repairedPayload = await aiProvider({ ...repairRequest, signal: controller.signal })
      finalStructured = normalizeForProject(repairedPayload, detectedCapabilities, mode)
      verification = runGeneratedAppHealthcheck(finalStructured, { ...selectedStrategy, id: 'recovery' })
      attempts = attempt
      onDebug?.({ status: 'repair_checked', reason, attempt, maxAttempts, healthcheck: verification, timestamp: new Date().toISOString() })
    }

    return { finalStructured, verification, attempts }
  }

  async function submitWithText(requestText) {
    const trimmed = requestText.trim()
    if (!trimmed) {
      setStatus('error')
      setError('Écris ou dicte une demande avant d’envoyer.')
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    setError(null)
    setRepairError(null)
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
      const structured = normalizeForProject(payload, detectedCapabilities, mode)
      const initialHealthcheck = runGeneratedAppHealthcheck(structured, selectedStrategy)
      const repairResult = await runRepairLoop({
        originalRequest: trimmed,
        initialStructured: structured,
        initialHealthcheck,
        detectedCapabilities,
        selectedStrategy,
        controller,
        maxAttempts: getRepairLimit(),
        reason: 'auto'
      })
      setHealthcheck({ ...repairResult.verification, repairAttempts: repairResult.attempts })
      const nextProject = storeProject(project ? evolveProject(project, trimmed, repairResult.finalStructured) : createProject({ mode, request: trimmed, response: repairResult.finalStructured, designSystem }))
      setProject(nextProject)
      setResult(repairResult.finalStructured)
      setInput('')
      setStatus('success')
      setMessage(project ? 'Le projet a évolué.' : 'Le projet est prêt.')
      onDebug?.({
        ...(payload.debug || {}),
        status: 'success',
        source: payload.source || payload.debug?.source || 'unknown',
        rendererType: 'html',
        mode,
        hasHtml: Boolean(repairResult.finalStructured.html),
        htmlLength: repairResult.finalStructured.html?.length || 0,
        capabilities: repairResult.finalStructured.capabilities,
        strategy: selectedStrategy,
        healthcheck: repairResult.verification,
        repairAttempts: repairResult.attempts
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

  async function submit() {
    await submitWithText(input)
  }

  async function retry() {
    const originalRequest = project?.creationRequest || input
    await submitWithText(originalRequest)
  }

  async function repair() {
    const latestHistory = project?.generationHistory?.at(-1)
    const originalRequest = latestHistory?.request || project?.creationRequest || input
    const currentResponse = latestHistory?.response || result
    if (!originalRequest || !currentResponse || !healthcheck) return

    const controller = new AbortController()
    abortRef.current = controller
    setStatus('repairing')
    setRepairError(null)
    setMessage('Réparation en cours…')
    const detectedCapabilities = { ...(pipeline?.capabilities || detectCapabilities(originalRequest)), ...(project?.capabilities || {}) }
    const selectedStrategy = pipeline?.strategy || selectGenerationStrategy({ input: originalRequest, capabilities: detectedCapabilities, mode, hasTime })

    try {
      const repairResult = await runRepairLoop({
        originalRequest,
        initialStructured: currentResponse,
        initialHealthcheck: healthcheck,
        detectedCapabilities,
        selectedStrategy,
        controller,
        maxAttempts: getRepairLimit(),
        reason: 'manual'
      })
      const nextProject = storeProject(evolveProject(project, originalRequest, repairResult.finalStructured))
      setProject(nextProject)
      setResult(repairResult.finalStructured)
      setHealthcheck({ ...repairResult.verification, repairAttempts: (healthcheck.repairAttempts || 0) + repairResult.attempts })
      setStatus('success')
      setMessage(repairResult.verification.status === 'verified' ? 'Application réparée.' : 'Réparation tentée, validation encore incomplète.')
    } catch (repairFailure) {
      setStatus('success')
      setRepairError(repairFailure instanceof Error ? repairFailure.message : 'Impossible de réparer automatiquement pour le moment.')
      setMessage('La réparation a échoué.')
    } finally {
      abortRef.current = null
    }
  }

  function cancel() { abortRef.current?.abort() }

  return { input, setInput, status, message, error, repairError, result, project, submit, retry, repair, cancel, appendTranscript, speechEnabled, progressText, hasTime, setHasTime, pipeline, healthcheck }
}
