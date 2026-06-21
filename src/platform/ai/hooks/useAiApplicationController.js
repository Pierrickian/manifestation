import { useMemo, useRef, useState } from 'react'
import { requestAiCompletion } from '../aiProvider'
import { buildAiPrompt, buildHumanModelRefreshPrompt, buildRepairPrompt, buildRuntimeGenerationPrompt, normalizeStructuredAiResponse } from '../promptBuilder'
import { createProject, evolveProject, normalizePreloadQueue, refreshProjectHumanModel, storeProject } from '../projectModel'
import { detectCapabilities, isAutoRepairableHealthcheck, runGeneratedAppHealthcheck, selectGenerationStrategy } from '../generationPipeline'

const REQUEST_TIMEOUT_MS = 60000
const COCREATE_REQUEST_TIMEOUT_MS = 120000
const DEFAULT_REPAIR_LIMIT = 1
const DEEP_REPAIR_LIMIT = 3
const MAX_CAPABILITY_NEGOTIATION_ATTEMPTS = 2

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

function getDefaultRuntimeCapabilities(mode) {
  return mode === 'co-create'
    ? { aiGeneration: true, aiStreaming: false, online: true, offline: true }
    : { aiGeneration: false, aiStreaming: false, online: false, offline: true }
}

function normalizeForProject(payload, detectedCapabilities, mode) {
  const structured = normalizeStructuredAiResponse(payload)
  const runtimeCapabilities = {
    ...getDefaultRuntimeCapabilities(mode),
    ...(structured.capabilities?.runtimeCapabilities || {}),
    ...(structured.runtimeCapabilities || {})
  }
  return enforceModeBoundaries({
    ...structured,
    runtimeCapabilities,
    capabilities: { ...detectedCapabilities, ...(structured.capabilities || {}), runtimeCapabilities }
  }, mode)
}

function isHtmlAppResponse(response = {}) {
  return response.kind === 'html_app' && typeof response.html === 'string'
}

function hasUsableRuntimePayload(response = {}) {
  return Boolean(response.runtimePayload && typeof response.runtimePayload === 'object' && Object.keys(response.runtimePayload).length)
}

function isQuotaFailure(error) {
  const text = [error?.code, error?.message, error?.status, error?.payload?.error, error?.payload?.message]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return /openai_quota|insufficient_quota|quota|credit|billing/.test(text)
}

function formatAiError(error, fallback = 'Impossible de générer la réponse pour le moment.') {
  if (isQuotaFailure(error)) {
    return 'Quota OpenAI insuffisant : Creatia ne peut pas générer cette app tant que les crédits ou la facturation OpenAI ne sont pas rétablis.'
  }
  return error instanceof Error ? error.message : fallback
}

function mergeCapabilityRequest(current = {}, requested = {}) {
  const runtimeCapabilities = {
    ...(current.runtimeCapabilities || {}),
    ...(requested.runtimeCapabilities || {})
  }
  return {
    ...current,
    ...requested,
    runtimeCapabilities
  }
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
  const [lastPrompt, setLastPrompt] = useState('')
  const [lastRuntimePrompt, setLastRuntimePrompt] = useState('')
  const abortRef = useRef(null)
  const timeoutRef = useRef(null)
  const runtimeGenerationPendingRef = useRef(false)

  const progressText = useMemo(() => PATIENCE_IDEAS[ideaIndex % PATIENCE_IDEAS.length], [ideaIndex])

  function appendTranscript(transcript) {
    setInput((current) => `${current}${current.trim() ? '\n' : ''}${transcript}`)
    setMessage('Transcription ajoutée. Tu peux modifier le texte avant envoi.')
  }

  function getRepairLimit() {
    return hasTime ? DEEP_REPAIR_LIMIT : DEFAULT_REPAIR_LIMIT
  }

  function getRequestTimeoutMs() {
    return mode === 'co-create' ? COCREATE_REQUEST_TIMEOUT_MS : REQUEST_TIMEOUT_MS
  }

  function scheduleRequestTimeout(controller, timeoutMs = getRequestTimeoutMs()) {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      controller.abort()
    }, timeoutMs)
  }

  async function runRepairLoop({ originalRequest, initialStructured, initialHealthcheck, detectedCapabilities, selectedStrategy, controller, maxAttempts, reason = 'auto' }) {
    let finalStructured = initialStructured
    let verification = initialHealthcheck
    let attempts = 0
    let intermediateResponse = null

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
      setLastRuntimePrompt(JSON.stringify(repairRequest, null, 2))
      onDebug?.({ status: 'repair_ready', reason, attempt, maxAttempts, kind: repairRequest.kind, shortTitle: `Réparation IA ${attempt}/${maxAttempts}`, healthcheck: verification, timestamp: new Date().toISOString() })
      onDebug?.({ status: 'ai_request', kind: repairRequest.kind, shortTitle: `Réparation IA ${attempt}/${maxAttempts}`, timestamp: new Date().toISOString() })
      scheduleRequestTimeout(controller)
      const repairedPayload = await aiProvider({ ...repairRequest, signal: controller.signal })
      onDebug?.({ status: 'ai_response', kind: repairRequest.kind, shortTitle: `Réponse réparation ${attempt}/${maxAttempts}`, timestamp: new Date().toISOString() })
      const repairedStructured = normalizeForProject(repairedPayload, detectedCapabilities, mode)
      if (!isHtmlAppResponse(repairedStructured)) {
        intermediateResponse = repairedStructured
        attempts = attempt
        onDebug?.({
          status: 'repair_intermediate_response',
          reason,
          attempt,
          maxAttempts,
          responseKind: repairedStructured.kind,
          timestamp: new Date().toISOString()
        })
        break
      }
      finalStructured = repairedStructured
      verification = runGeneratedAppHealthcheck(finalStructured, { ...selectedStrategy, id: 'recovery', mode })
      attempts = attempt
      onDebug?.({ status: 'repair_checked', reason, attempt, maxAttempts, healthcheck: verification, timestamp: new Date().toISOString() })
    }

    return { finalStructured, verification, attempts, intermediateResponse }
  }

  async function requestBuilderResponse({ requestText, capabilities, strategy, controller, requestKindTitle, negotiationAttempt = 0 }) {
    const request = buildAiPrompt({ input: requestText, mode, designSystem, project, capabilities, strategy, hasTime })
    setLastRuntimePrompt(JSON.stringify(request, null, 2))
    onDebug?.({ status: 'request_ready', kind: request.kind, shortTitle: requestKindTitle, rendererType: request.metadata.rendererType, designSystem: request.metadata.designSystem?.themeName, timestamp: new Date().toISOString() })
    onDebug?.({ status: 'ai_request', kind: request.kind, shortTitle: requestKindTitle, timestamp: new Date().toISOString() })
    scheduleRequestTimeout(controller)
    const payload = await aiProvider({ ...request, signal: controller.signal })
    onDebug?.({ status: 'ai_response', kind: request.kind, shortTitle: project ? 'Projet évolué' : 'Projet généré', timestamp: new Date().toISOString() })
    const structured = normalizeForProject(payload, capabilities, mode)

    if (structured.kind === 'capability_request') {
      const negotiatedCapabilities = mergeCapabilityRequest(capabilities, structured.requestedCapabilities)
      setPipeline({ capabilities: negotiatedCapabilities, strategy })
      onDebug?.({ status: 'capability_request', kind: structured.kind, requestedCapabilities: structured.requestedCapabilities, reason: structured.reason, timestamp: new Date().toISOString() })
      if (negotiationAttempt >= MAX_CAPABILITY_NEGOTIATION_ATTEMPTS) {
        throw new Error(structured.reason || 'La négociation de capacités n’a pas abouti.')
      }
      const retryText = structured.retryPrompt?.trim() || requestText
      return requestBuilderResponse({
        requestText: retryText,
        capabilities: negotiatedCapabilities,
        strategy,
        controller,
        requestKindTitle,
        negotiationAttempt: negotiationAttempt + 1
      })
    }

    return { structured, capabilities, payload }
  }

  async function submitWithText(requestText) {
    const trimmed = requestText.trim()
    if (!trimmed) {
      setStatus('error')
      setError('Écris ou dicte une demande avant d’envoyer.')
      return
    }

    setLastPrompt(trimmed)
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    setError(null)
    setRepairError(null)
    setHealthcheck(null)
    setIdeaIndex(0)
    setMessage(progressText)
    const detectedCapabilities = detectCapabilities(trimmed)
    const selectedStrategy = selectGenerationStrategy({ input: trimmed, capabilities: detectedCapabilities, mode, hasTime })
    const requestTimeoutMs = getRequestTimeoutMs()
    setPipeline({ capabilities: detectedCapabilities, strategy: selectedStrategy })
    onDebug?.({ status: 'loading', rendererType: 'html', mode, speechEnabled, timeoutMs: requestTimeoutMs, capabilities: detectedCapabilities, strategy: selectedStrategy, hasTime, startedAt: new Date().toISOString() })

    const interval = window.setInterval(() => {
      setIdeaIndex((index) => index + 1)
    }, 9000)

    try {
      const requestShortTitle = project ? 'Évolution du projet' : 'Création du projet'
      const { structured, capabilities: negotiatedCapabilities, payload } = await requestBuilderResponse({
        requestText: trimmed,
        capabilities: detectedCapabilities,
        strategy: selectedStrategy,
        controller,
        requestKindTitle: requestShortTitle
      })

      if (structured.kind === 'clarification_request') {
        setStatus('idle')
        setMessage(structured.question || 'Creatia a besoin d’une précision avant de générer.')
        onDebug?.({ status: 'clarification_request', kind: structured.kind, question: structured.question, timestamp: new Date().toISOString() })
        return
      }

      if (structured.kind === 'generation_error') {
        throw new Error(structured.error || 'La génération a échoué.')
      }

      if (!isHtmlAppResponse(structured)) {
        throw new Error('Réponse IA intermédiaire non finalisée.')
      }

      const initialHealthcheck = runGeneratedAppHealthcheck(structured, { ...selectedStrategy, mode })
      const repairResult = await runRepairLoop({
        originalRequest: trimmed,
        initialStructured: structured,
        initialHealthcheck,
        detectedCapabilities: negotiatedCapabilities,
        selectedStrategy,
        controller,
        maxAttempts: getRepairLimit(),
        reason: 'auto'
      })
      if (!isHtmlAppResponse(repairResult.finalStructured)) {
        throw new Error('La réparation a retourné une réponse intermédiaire au lieu d’une application.')
      }
      if (repairResult.intermediateResponse) {
        setRepairError('La réparation a demandé une étape intermédiaire. Creatia conserve la dernière application HTML valide et affiche les warnings Co-Create pour une nouvelle réparation.')
      }
      if (repairResult.verification.failedCount > 0) {
        throw new Error('La génération a échoué aux vérifications HTML critiques. Creatia refuse d’afficher une UI dégradée ou du JSON brut.')
      }
      setHealthcheck({ ...repairResult.verification, repairAttempts: repairResult.attempts })
      const nextProject = storeProject(project ? evolveProject(project, trimmed, repairResult.finalStructured) : createProject({ mode, request: trimmed, response: repairResult.finalStructured, designSystem }))
      setProject(nextProject)
      setResult(repairResult.finalStructured)
      setInput('')
      setStatus('success')
      setMessage(repairResult.finalStructured.html ? (project ? 'Le projet a évolué.' : 'Le projet est prêt.') : 'La requête n’a pas abouti. Tu peux réessayer avec la même demande.')
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
        repairAttempts: repairResult.attempts,
        repairIntermediateResponse: repairResult.intermediateResponse || null
      })
      return {
        finalStructured: repairResult.finalStructured,
        project: nextProject,
        healthcheck: repairResult.verification,
        repairAttempts: repairResult.attempts,
        intermediateResponse: repairResult.intermediateResponse || null
      }
    } catch (submitError) {
      if (submitError?.name === 'AbortError') {
        setStatus('idle')
        setMessage('Génération annulée.')
        onDebug?.({ status: 'aborted', rendererType: 'html', timeoutMs: REQUEST_TIMEOUT_MS, timestamp: new Date().toISOString() })
      } else {
        setStatus('error')
        const errorMessage = formatAiError(submitError)
        setError(errorMessage)
        setMessage(isQuotaFailure(submitError) ? 'Quota OpenAI insuffisant.' : 'La génération a échoué.')
        onDebug?.({ status: 'error', rendererType: 'html', errorMessage, errorCode: submitError?.code || '', timestamp: new Date().toISOString() })
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


  async function submitPartnerSuggestion(suggestion) {
    const suggestionText = typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion)
    const wrappedPrompt = [
      'Traite cette suggestion du partenaire créatif comme une évolution à appliquer au projet Creatia actuel.',
      'Préserve ce qui fonctionne déjà, respecte le mode Co-Create, puis retourne une application complète mise à jour.',
      `Suggestion: ${suggestionText}`
    ].join('\n')
    setInput(wrappedPrompt)
    await submitWithText(wrappedPrompt)
  }

  async function submitRuntimeGeneration(runtimeRequest = {}) {
    if (mode !== 'co-create') {
      return { error: 'Runtime generation is only available in Co-Create mode.' }
    }
    if (runtimeGenerationPendingRef.current) {
      return { error: 'A runtime generation request is already pending.' }
    }

    const controller = new AbortController()
    runtimeGenerationPendingRef.current = true
    abortRef.current = controller
    try {
      const request = buildRuntimeGenerationPrompt({ runtimeRequest, project, designSystem })
      setLastRuntimePrompt(JSON.stringify(request, null, 2))
      onDebug?.({ status: 'ai_request', kind: request.kind, shortTitle: `Runtime IA · ${runtimeRequest.trigger || 'runtime_generation'}`, timestamp: new Date().toISOString() })
      scheduleRequestTimeout(controller)
      const payload = await aiProvider({ ...request, signal: controller.signal })
      onDebug?.({ status: 'ai_response', kind: request.kind, shortTitle: 'Runtime IA response', timestamp: new Date().toISOString() })
      const finalStructured = normalizeForProject(payload, project?.capabilities || {}, mode)
      if (!hasUsableRuntimePayload(finalStructured)) {
        return { error: 'Runtime generation did not return a usable runtimePayload.', finalStructured }
      }
      return {
        finalStructured,
        runtimePayload: finalStructured.runtimePayload,
        project,
        healthcheck: null,
        repairAttempts: 0
      }
    } catch (runtimeError) {
      return { error: formatAiError(runtimeError, runtimeError?.message || String(runtimeError)), errorCode: runtimeError?.code || '' }
    } finally {
      runtimeGenerationPendingRef.current = false
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      abortRef.current = null
    }
  }

  async function retry() {
    const originalRequest = lastPrompt || project?.generationHistory?.at(-1)?.request || project?.creationRequest || input
    if (!originalRequest?.trim()) {
      setStatus('error')
      setError('Aucune demande précédente à réessayer.')
      return
    }
    setMessage('Nouvel essai avec la même demande…')
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
      if (!isHtmlAppResponse(repairResult.finalStructured)) {
        throw new Error('La réparation a retourné une réponse intermédiaire au lieu d’une application.')
      }
      if (repairResult.intermediateResponse) {
        setRepairError('La réparation a demandé une étape intermédiaire. La dernière application HTML valide a été conservée.')
      }
      if (repairResult.verification.failedCount > 0) {
        throw new Error('La réparation laisse encore des erreurs HTML critiques. Creatia conserve la dernière application valide.')
      }
      const nextProject = storeProject(evolveProject(project, originalRequest, repairResult.finalStructured))
      setProject(nextProject)
      setResult(repairResult.finalStructured)
      setHealthcheck({ ...repairResult.verification, repairAttempts: (healthcheck.repairAttempts || 0) + repairResult.attempts })
      setStatus('success')
      setMessage(repairResult.intermediateResponse ? 'Réparation interrompue par une réponse intermédiaire.' : repairResult.verification.status === 'verified' ? 'Application réparée.' : 'Réparation tentée, validation encore incomplète.')
    } catch (repairFailure) {
      setStatus('success')
      setRepairError(repairFailure instanceof Error ? repairFailure.message : 'Impossible de réparer automatiquement pour le moment.')
      setMessage('La réparation a échoué.')
    } finally {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      abortRef.current = null
    }
  }


  async function rebuildHumanModel() {
    if (!project?.currentApplication) return

    const controller = new AbortController()
    abortRef.current = controller
    setStatus('refreshingHumanModel')
    setError(null)
    setRepairError(null)
    setMessage('Analyse du modèle humain…')

    try {
      const request = buildHumanModelRefreshPrompt({ project, designSystem })
      setLastRuntimePrompt(JSON.stringify(request, null, 2))
      onDebug?.({ status: 'request_ready', kind: request.kind, shortTitle: 'Rebuild Human Model', rendererType: request.metadata.rendererType, timestamp: new Date().toISOString() })
      onDebug?.({ status: 'ai_request', kind: request.kind, shortTitle: 'Rebuild Human Model', timestamp: new Date().toISOString() })
      scheduleRequestTimeout(controller)
      const payload = await aiProvider({ ...request, signal: controller.signal })
      onDebug?.({ status: 'ai_response', kind: request.kind, shortTitle: 'Human Model Rebuilt', timestamp: new Date().toISOString() })
      const structured = normalizeForProject(payload, project.capabilities || {}, mode)
      const nextProject = storeProject(refreshProjectHumanModel(project, structured))
      setProject(nextProject)
      setResult((current) => current || (nextProject.currentApplication ? { html: nextProject.currentApplication } : null))
      setStatus('success')
      setMessage('Le modèle humain a été reconstruit.')
    } catch (refreshError) {
      if (refreshError?.name === 'AbortError') {
        setStatus('idle')
        setMessage('Analyse annulée.')
        onDebug?.({ status: 'aborted', kind: 'human_model_refresh', timestamp: new Date().toISOString() })
      } else {
        setStatus('error')
        const errorMessage = formatAiError(refreshError, 'Impossible de reconstruire le modèle humain pour le moment.')
        setError(errorMessage)
        setMessage(isQuotaFailure(refreshError) ? 'Quota OpenAI insuffisant.' : 'La reconstruction a échoué.')
        onDebug?.({ status: 'error', kind: 'human_model_refresh', errorMessage, errorCode: refreshError?.code || '', timestamp: new Date().toISOString() })
      }
    } finally {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      abortRef.current = null
    }
  }

  function importProject(nextProject) {
    const migratedProject = nextProject ? {
      ...nextProject,
      preloadQueue: normalizePreloadQueue(nextProject.preloadQueue || [])
    } : nextProject
    setProject(migratedProject)
    const latestResponse = migratedProject?.generationHistory?.at(-1)?.response || null
    const fallbackHtml = migratedProject?.currentApplication || migratedProject?.lastValidApplication || ''
    const fallbackResponse = fallbackHtml ? {
      html: fallbackHtml,
      systemPrompt: migratedProject.systemPrompt,
      state: migratedProject.applicationState,
      suggestedActions: migratedProject.aiSuggestionsHistory?.at(-1)?.suggestions || [],
      continuationPlan: migratedProject.continuationPlan,
      preload: migratedProject.preloadQueue || [],
      capabilities: migratedProject.capabilities || {}
    } : null
    setResult(latestResponse?.html ? latestResponse : fallbackResponse)
    setInput('')
    setStatus('success')
    setError(null)
    setRepairError(null)
    setHealthcheck(null)
    setMessage('Projet importé. Tu peux continuer Create ou Co-Create immédiatement.')
  }


  function updateHumanModelField(field, value) {
    if (!project) return
    const nextProject = storeProject({
      ...project,
      humanModel: {
        ...(project.humanModel || {}),
        [field]: value
      },
      metadata: {
        ...(project.metadata || {}),
        updatedAt: new Date().toISOString()
      }
    })
    setProject(nextProject)
  }

  function cancel() {
    abortRef.current?.abort()
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  return { input, setInput, status, message, error, repairError, result, project, submit, submitPartnerSuggestion, submitRuntimeGeneration, retry, repair, rebuildHumanModel, updateHumanModelField, importProject, cancel, appendTranscript, speechEnabled, progressText, hasTime, setHasTime, pipeline, healthcheck, lastPrompt, lastRuntimePrompt }
}
