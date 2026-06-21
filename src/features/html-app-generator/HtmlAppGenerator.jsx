import { useEffect, useRef, useState } from 'react'
import { MANIFESTATION_DESIGN_SYSTEM } from '../../platform/ai/designSystem'
import { useAiApplicationController } from '../../platform/ai/hooks/useAiApplicationController'
import { AiInputComposer } from '../../platform/ai/components/AiInputComposer'
import { AiLoadingState } from '../../platform/ai/components/AiLoadingState'
import { HtmlViewer } from '../../platform/ai/renderers/HtmlViewer'
import { createProjectFromImportedHtml, exportHtmlProject, exportProjectJson, importHtmlIntoProject, normalizeImportedProject } from '../../platform/ai/projectExport'

function deriveRuntimePayload(finalStructured = {}) {
  if (finalStructured?.runtimePayload && typeof finalStructured.runtimePayload === 'object' && Object.keys(finalStructured.runtimePayload).length) {
    return finalStructured.runtimePayload
  }
  const state = finalStructured?.state && typeof finalStructured.state === 'object' ? finalStructured.state : {}
  const firstArray = (...values) => values.find((value) => Array.isArray(value) && value.length) || []
  const normalizeChoice = (item, index) => {
    if (typeof item === 'string') return { key: item, label: item }
    if (item && typeof item === 'object') return item
    return { key: `choice-${index}`, label: `Choix ${index + 1}`, desc: '', quotes: [] }
  }
  const choices = firstArray(state.choices, state.items).map(normalizeChoice)
  const statePatch = state.statePatch && typeof state.statePatch === 'object' ? state.statePatch : {}
  const page = state.page && typeof state.page === 'object' ? state.page : finalStructured?.page && typeof finalStructured.page === 'object' ? finalStructured.page : null
  const screen = state.screen && typeof state.screen === 'object' ? state.screen : finalStructured?.screen && typeof finalStructured.screen === 'object' ? finalStructured.screen : null
  const route = state.route || finalStructured?.route || state.currentRoute || finalStructured?.currentRoute || ''
  return {
    ...(page ? { page } : {}),
    ...(screen ? { screen } : {}),
    ...(route ? { route } : {}),
    ...(state.title || finalStructured?.title ? { title: state.title || finalStructured.title } : {}),
    ...(state.text || state.summary || state.description || finalStructured?.text || finalStructured?.summary || finalStructured?.description ? { text: state.text || state.summary || state.description || finalStructured.text || finalStructured.summary || finalStructured.description } : {}),
    ...(state.htmlFragment || finalStructured?.htmlFragment ? { htmlFragment: state.htmlFragment || finalStructured.htmlFragment } : {}),
    choices,
    items: firstArray(state.items),
    statePatch: { ...statePatch, loading: false, isLoading: false, pending: false }
  }
}


function createCoCreateTraceId() {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
  return `co-create-${stamp}-${Math.random().toString(16).slice(2, 8)}`
}

function validateRuntimeGenerationResult(finalStructured, runtimePayload) {
  const errors = []
  const warnings = []
  const keys = finalStructured && typeof finalStructured === 'object' ? Object.keys(finalStructured) : []
  const payloadKeys = runtimePayload && typeof runtimePayload === 'object' ? Object.keys(runtimePayload) : []
  if (!finalStructured || typeof finalStructured !== 'object') errors.push('finalStructured missing')
  if (finalStructured?.kind === 'runtime_generation' && !finalStructured.runtimePayload && !finalStructured.payload) errors.push('runtimePayload missing')
  if (!runtimePayload || typeof runtimePayload !== 'object' || !payloadKeys.length) errors.push('runtimePayload missing or empty')
  if (finalStructured?.runtimePayload && !finalStructured?.payload) warnings.push('runtimePayload present; payload will be synthesized for app')
  if (finalStructured?.html && !runtimePayload) warnings.push('html present but runtimePayload missing')
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    expectedSchema: 'runtime_generation response with runtimePayload or payload object, returned to the app as payload + runtimePayload',
    receivedSchema: { keys, payloadKeys, kind: finalStructured?.kind || 'unknown' }
  }
}

function getSuggestionLabel(suggestion) {
  if (typeof suggestion === 'string') return suggestion
  if (suggestion && typeof suggestion === 'object') {
    return suggestion.label || suggestion.title || suggestion.action || suggestion.target || suggestion.prompt || JSON.stringify(suggestion)
  }
  return String(suggestion || 'Suggestion')
}

export function HtmlAppGenerator({ onClose, onDebug, onMenuData, speechEnabled = true }) {
  const [isViewingHtml, setIsViewingHtml] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)
  const [lastExport, setLastExport] = useState(null)
  const [activeTransferInfo, setActiveTransferInfo] = useState(null)
  const importInputRef = useRef(null)
  const [mode, setMode] = useState('create')
  const [runtimeDebugEnabled, setRuntimeDebugEnabled] = useState(true)
  const [aiActivity, setAiActivity] = useState({ active: false, log: [] })
  const [runtimeTrace, setRuntimeTrace] = useState({ currentTraceId: '', timeline: [], rawResponses: [] })

  function recordRuntimeTrace(event = {}) {
    const traceId = event.traceId || event.detail?.traceId || runtimeTrace.currentTraceId || ''
    setRuntimeTrace((current) => ({
      currentTraceId: traceId || current.currentTraceId,
      timeline: [{ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, traceId: traceId || current.currentTraceId, timestamp: event.timestamp || new Date().toISOString(), step: event.step || event.status || 'runtime_event', status: event.status || 'info', durationMs: event.durationMs ?? null, message: event.message || event.shortTitle || '', detail: event.detail || event }, ...current.timeline].slice(0, 80),
      rawResponses: event.rawResponse ? [{ traceId: traceId || current.currentTraceId, timestamp: event.timestamp || new Date().toISOString(), ...event.rawResponse }, ...current.rawResponses].slice(0, 10) : current.rawResponses
    }))
  }

  function recordAiActivity(event = {}) {
    onDebug?.(event)
    if (event.traceId || event.status?.startsWith?.('runtime_')) recordRuntimeTrace(event)
    const status = event.status || 'info'
    const isRequest = status === 'ai_request' || status === 'request'
    const isResponse = status === 'ai_response' || status === 'response' || status === 'success' || status === 'error' || status === 'aborted'
    const title = event.shortTitle || event.title || event.kind || event.message || (isRequest ? 'Requête IA' : 'Réponse IA')

    if (!isRequest && !isResponse) return

    setAiActivity((current) => ({
      active: isRequest ? true : isResponse ? false : current.active,
      log: [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: isRequest ? 'request' : status === 'error' ? 'error' : 'response',
          title,
          timestamp: event.timestamp || event.startedAt || new Date().toISOString()
        },
        ...current.log
      ].slice(0, 18)
    }))
  }

  useEffect(() => {
    function handleGeneratedHtmlMessage(event) {
      if (event.data?.source !== 'creatia-generated-html' || event.data?.type !== 'ai-activity') return
      recordAiActivity(event.data)
    }

    window.addEventListener('message', handleGeneratedHtmlMessage)
    return () => window.removeEventListener('message', handleGeneratedHtmlMessage)
  }, [])

  const controller = useAiApplicationController({ mode, designSystem: MANIFESTATION_DESIGN_SYSTEM, speechEnabled, onDebug: recordAiActivity })
  const project = controller.project
  const html = project?.currentApplication || project?.lastValidApplication || ''
  const latestSuggestions = project?.aiSuggestionsHistory?.at(-1)?.suggestions || []
  const continuationPlan = mode === 'co-create' ? project?.continuationPlan : null
  const runtimeContext = {
    mode,
    capabilities: project?.capabilities || {},
    runtimeCapabilities: project?.capabilities?.runtimeCapabilities || {},
    continuationPlan: project?.continuationPlan || null,
    preload: project?.preloadQueue || [],
    debugEnabled: runtimeDebugEnabled
  }
  const lastAutoOpenedHtmlRef = useRef('')
  const isBusy = controller.status === 'loading' || controller.status === 'repairing' || controller.status === 'refreshingHumanModel'
  const hasUnsavedAiApp = Boolean(project?.currentApplication || controller.input.trim() || isBusy)

  useEffect(() => {
    function handleRuntimeGenerationRequest(event) {
      if (event.data?.source !== 'creatia-generated-html' || event.data?.type !== 'ai-runtime-generation') return
      if (mode !== 'co-create') return
      console.log('[AI RUNTIME HOST]', 'AI request reception', event.data.request || {})
      const traceId = event.data.request?.traceId || event.data.request?.context?.traceId || event.data.traceId || createCoCreateTraceId()
      const requestId = event.data.request?.requestId || traceId
      const runtimeRequest = { ...(event.data.request || {}), requestId, traceId, context: { ...(event.data.request?.context || {}), traceId } }
      sendRuntimeHostLog(event.source, requestId, traceId, 'host_request_received', 'Host Creatia: requête runtime reçue depuis l’iframe.', { traceId, trigger: runtimeRequest.trigger || 'runtime_generation' })
      sendRuntimeHostLog(event.source, requestId, traceId, 'host_trigger_detected', 'Host Creatia: trigger, preload et continuationPlan détectés.', { traceId, trigger: runtimeRequest.trigger, preloadEntries: runtimeRequest.preload?.length || 0, hasContinuationPlan: Boolean(runtimeRequest.continuationPlan) })
      console.log('[AI RUNTIME HOST]', '[TRACE ' + traceId + '] AI request dispatch to controller')
      sendRuntimeHostLog(event.source, requestId, traceId, 'host_dispatch_controller', 'Host Creatia: envoi au contrôleur IA runtime.', { traceId, mode })
      controller.submitRuntimeGeneration(runtimeRequest)
        .then((runtimeResult) => {
          console.log('[AI RUNTIME HOST]', 'AI response reception')
          sendRuntimeHostLog(event.source, requestId, traceId, 'host_response_received', 'Host Creatia: réponse IA runtime reçue.', { hasError: Boolean(runtimeResult?.error) })
          if (runtimeResult?.error) {
            sendRuntimeHostLog(event.source, requestId, traceId, 'host_response_error', 'Host Creatia: réponse runtime en erreur.', { error: runtimeResult.error })
            event.source?.postMessage({ source: 'creatia-host', type: 'ai-runtime-generation-result', requestId, traceId, ok: false, responseType: 'generation_error', payload: { error: runtimeResult.error } }, '*')
            return
          }
          const finalStructured = runtimeResult?.finalStructured || null
          const runtimePayload = runtimeResult?.runtimePayload || deriveRuntimePayload(finalStructured)
          const hasRuntimePayload = Boolean(runtimePayload && typeof runtimePayload === 'object' && Object.keys(runtimePayload).length)
          const validation = validateRuntimeGenerationResult(finalStructured, runtimePayload)
          sendRuntimeHostLog(event.source, requestId, traceId, 'host_validation_completed', validation.ok ? 'Host Creatia: réponse runtime validée.' : validation.errors.join('; '), { traceId, validation })
          if (!validation.ok) {
            sendRuntimeHostLog(event.source, requestId, traceId, 'host_payload_missing', 'Host Creatia: runtimePayload manquant ou inutilisable.', { traceId, validation })
            event.source?.postMessage({ source: 'creatia-host', type: 'ai-runtime-generation-result', requestId, traceId, ok: false, responseType: 'generation_error', payload: { error: validation.errors.join('; ') || 'Runtime generation did not return a usable runtimePayload.', traceId }, finalStructured, diagnostics: { traceId, validation } }, '*')
            return
          }
          sendRuntimeHostLog(event.source, requestId, traceId, 'host_payload_posted', 'Host Creatia: payload runtime renvoyé à l’iframe.', { traceId, payloadKeys: Object.keys(runtimePayload || {}) })
          recordRuntimeTrace({ traceId, step: 'host_raw_response_captured', message: 'Host Creatia: réponse brute/normalisée capturée.', rawResponse: { rawAI: runtimeResult?.rawPayload || null, normalized: finalStructured, returnedToApp: { status: 'ok', payload: runtimePayload, runtimePayload }, validation } })
          event.source?.postMessage({
            source: 'creatia-host',
            type: 'ai-runtime-generation-result',
            requestId,
            ok: true,
            traceId,
            status: 'ok',
            responseType: 'runtime_generation',
            payload: runtimePayload,
            legacyPayload: { status: 'completed' },
            runtimePayload,
            finalStructured,
            projectPatch: {
              projectId: runtimeResult?.project?.id || project?.id || null,
              currentApplicationUpdated: Boolean(runtimeResult?.project?.currentApplication),
              lastValidApplicationUpdated: Boolean(runtimeResult?.project?.lastValidApplication),
              continuationPlanUpdated: Boolean(runtimeResult?.project?.continuationPlan),
              preloadUpdated: Boolean(runtimeResult?.project?.preloadQueue?.length),
              generationHistoryIndex: Math.max(0, (runtimeResult?.project?.generationHistory?.length || 1) - 1)
            },
            diagnostics: {
              healthcheck: runtimeResult?.healthcheck || null,
              repairAttempts: runtimeResult?.repairAttempts || 0,
              traceId,
              validation,
              hasRuntimePayload,
              hasFinalStructured: Boolean(finalStructured)
            }
          }, '*')
        })
        .catch((error) => {
          console.log('[AI RUNTIME HOST]', 'AI failures', error?.message || error)
          sendRuntimeHostLog(event.source, requestId, traceId, 'host_failure', 'Host Creatia: échec de génération runtime.', { error: error?.message || String(error) })
          event.source?.postMessage({ source: 'creatia-host', type: 'ai-runtime-generation-result', requestId, traceId, ok: false, responseType: 'generation_error', payload: { error: error?.message || String(error) } }, '*')
        })
    }

    window.addEventListener('message', handleRuntimeGenerationRequest)
    return () => window.removeEventListener('message', handleRuntimeGenerationRequest)
  }, [controller, mode])

  useEffect(() => {
    if (!hasUnsavedAiApp) return undefined

    function confirmBeforeLeaving(event) {
      event.preventDefault()
      event.returnValue = 'Êtes-vous sûr de vouloir quitter ? Votre app Creatia en cours pourrait être perdue.'
      return event.returnValue
    }

    window.addEventListener('beforeunload', confirmBeforeLeaving)
    return () => window.removeEventListener('beforeunload', confirmBeforeLeaving)
  }, [hasUnsavedAiApp])

  function rememberExport(exportData, kind) {
    setLastExport({ ...exportData, kind, content: exportData.html || exportData.json || '' })
    setExportStatus(kind === 'html' ? 'Application téléchargée.' : 'Projet complet téléchargé.')
  }

  function handleExportHtml() {
    if (!project?.currentApplication && !project?.lastValidApplication) return
    rememberExport(exportHtmlProject(project), 'html')
  }

  function handleExportProject() {
    if (!project) return
    rememberExport(exportProjectJson(project), 'project')
  }


  async function handleCopyLastExport() {
    if (!lastExport?.content) {
      setExportStatus('Aucun téléchargement récent à copier.')
      return
    }

    try {
      await navigator.clipboard.writeText(lastExport.content)
      setExportStatus(lastExport.kind === 'html' ? 'HTML exporté copié.' : 'JSON projet exporté copié.')
    } catch {
      setExportStatus('Copie automatique indisponible. Ouvre le téléchargement puis copie son contenu manuellement.')
    }
  }

  function sendRuntimeHostLog(target, requestId, traceId, step, message, detail = {}) {
    recordRuntimeTrace({ traceId, step, message, detail, timestamp: new Date().toISOString() })
    target?.postMessage({
      source: 'creatia-host',
      type: 'creatia-runtime-host-log',
      requestId,
      traceId,
      step,
      message,
      detail,
      timestamp: new Date().toISOString()
    }, '*')
  }


  async function handleImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const isProjectFile = file.name.endsWith('.manifestation.json') || file.type === 'application/json' || /^\s*[{[]/.test(text)
      if (isProjectFile) {
        const importedProject = normalizeImportedProject(JSON.parse(text))
        controller.importProject(importedProject)
        setMode(importedProject.mode || 'create')
        setExportStatus('Projet importé. L’application, le contexte et l’historique sont restaurés.')
        return
      }

      const updatedProject = project ? importHtmlIntoProject(project, text) : createProjectFromImportedHtml(text, { mode, designSystem: MANIFESTATION_DESIGN_SYSTEM })
      controller.importProject(updatedProject)
      setMode(updatedProject.mode || 'create')
      setExportStatus(project ? 'Application importée. Elle remplace celle du projet.' : 'Application importée. Un projet a été créé pour pouvoir la faire évoluer.')
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : 'Import impossible pour ce fichier.')
    }
  }


  useEffect(() => {
    if (!html || lastAutoOpenedHtmlRef.current === html) return
    lastAutoOpenedHtmlRef.current = html
    setIsViewingHtml(true)
  }, [html])

  useEffect(() => {
    if (!controller.result?.html) return
    setIsViewingHtml(true)
  }, [controller.result?.html])


  async function handleCopyRuntimeTrace() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(runtimeTrace, null, 2))
      setExportStatus('Debug Runtime copié.')
    } catch {
      setExportStatus('Copie du Debug Runtime indisponible.')
    }
  }

  async function handleCopyRuntimePrompt() {
    if (!controller.lastRuntimePrompt) {
      setExportStatus('Aucun prompt runtime disponible pour le moment.')
      return
    }

    try {
      await navigator.clipboard.writeText(controller.lastRuntimePrompt)
      setExportStatus('Prompt runtime copié.')
    } catch {
      setExportStatus('Copie automatique indisponible. Sélectionne et copie le prompt runtime manuellement depuis ton navigateur.')
    }
  }


  useEffect(() => {
    onMenuData?.({
      journal: (project?.generationHistory || []).map((entry, index) => ({
        id: `${entry.at || 'prompt'}-${index}`,
        title: entry.request || 'Demande utilisateur',
        timestamp: entry.at || new Date().toISOString()
      })).reverse(),
      steps: aiActivity.log,
      pipeline: controller.pipeline,
      healthcheck: controller.healthcheck,
      healthcheckActions: { retry: controller.retry, repair: controller.repair, copyPrompt: handleCopyRuntimePrompt, canRepair: Boolean(controller.healthcheck?.isRepairable), canCopyPrompt: Boolean(controller.lastRuntimePrompt), isBusy },
      history: project?.evolutionHistory || []
    })
  }, [onMenuData, aiActivity.log, controller.pipeline, controller.healthcheck, controller.lastRuntimePrompt, project?.generationHistory, project?.evolutionHistory, isBusy])

  if (html && isViewingHtml) {
    return <HtmlViewer html={html} title={project?.creationRequest || 'Application créée'} onBack={() => setIsViewingHtml(false)} aiOverlay={<CreatiaAiOverlay activity={aiActivity} />} runtimeContext={runtimeContext} />
  }

  return (
    <section className="create-app-panel html-generator-panel" aria-labelledby="project-creator-title">
      <div className="create-app-aurora" aria-hidden="true" />
      <div className="create-app-header">
        <p className="eyebrow">Creatia</p>
        <h2 id="project-creator-title">Crée avec Creatia.</h2>
        <p>Parle ou écris ton idée. La plateforme crée un projet automatiquement, puis le fait évoluer avec tes demandes.</p>
      </div>

      <CreatiaAiOverlay activity={aiActivity} />

      {html ? (
        <div className="iaview-ready-card quick-open-card">
          <strong>{project.creationRequest}</strong>
          <span>Application prête.</span>
          <div className="create-app-actions"><button type="button" className="primary-action" onClick={() => setIsViewingHtml(true)}>Ouvrir l’application</button><button type="button" className="ghost-action" onClick={handleCopyRuntimePrompt} disabled={!controller.lastRuntimePrompt}>Copy Runtime Prompt</button></div>
        </div>
      ) : null}

      {controller.lastRuntimePrompt ? (
        <button type="button" className="ghost-action" onClick={handleCopyRuntimePrompt}>Copy Runtime Prompt</button>
      ) : null}

      <div className="project-menu transfer-actions">
        <div className="transfer-actions-row">
          <div className="transfer-action-pair"><button type="button" className="primary-action slim-action" onClick={() => importInputRef.current?.click()} disabled={isBusy}>Importer</button><button type="button" className="info-action" onClick={() => setActiveTransferInfo((current) => current === 'import' ? null : 'import')} aria-expanded={activeTransferInfo === 'import'} aria-label="Information importer">i</button></div>
          <div className="transfer-action-pair"><button type="button" className="ghost-action slim-action" onClick={handleExportHtml} disabled={!project?.currentApplication && !project?.lastValidApplication}>Exporter app</button><button type="button" className="info-action" onClick={() => setActiveTransferInfo((current) => current === 'app' ? null : 'app')} aria-expanded={activeTransferInfo === 'app'} aria-label="Information exporter app">i</button></div>
          <div className="transfer-action-pair"><button type="button" className="ghost-action slim-action" onClick={handleExportProject} disabled={!project}>Exporter projet</button><button type="button" className="info-action" onClick={() => setActiveTransferInfo((current) => current === 'project' ? null : 'project')} aria-expanded={activeTransferInfo === 'project'} aria-label="Information exporter projet">i</button></div>
        </div>
        <input ref={importInputRef} className="visually-hidden" type="file" accept=".manifestation.json,application/json,.html,text/html" onChange={handleImport} />
        {activeTransferInfo === 'import' ? <small>Importer charge un projet Creatia ou une app seule déjà exportée.</small> : null}
        {activeTransferInfo === 'app' ? <small>Exporter app télécharge seulement l’application à ouvrir ailleurs, sans historique de création.</small> : null}
        {activeTransferInfo === 'project' ? <small>Exporter projet télécharge l’application avec le contexte et l’historique pour continuer dans Creatia.</small> : null}
        {lastExport?.url ? <button type="button" className="ghost-action export-link" onClick={handleCopyLastExport}>Copier le téléchargement</button> : null}
        {lastExport?.url ? <a className="ghost-action export-link" href={lastExport.url} target="_blank" rel="noreferrer">Ouvrir le téléchargement</a> : null}
        {exportStatus ? <span className="project-export-status" role="status">{exportStatus}</span> : null}
      </div>

      <AiInputComposer
        value={controller.input}
        onChange={controller.setInput}
        onSubmit={controller.submit}
        onRetry={controller.retry}
        canRetry={Boolean(controller.lastPrompt) && !isBusy}
        onTranscript={controller.appendTranscript}
        disabled={isBusy}
        speechEnabled={speechEnabled}
        statusMessage={(message) => onDebug?.({ status: 'speech', message, timestamp: new Date().toISOString() })}
        placeholder={project ? 'Ex: ajoute un minimap, change les couleurs, simplifie l’interface…' : 'Ex: un jeu de mémoire doux avec progression et sons…'}
      />

      {isBusy ? <AiLoadingState text={controller.status === 'repairing' ? 'Réparation automatique…' : controller.status === 'refreshingHumanModel' ? 'Reconstruction du modèle humain…' : controller.progressText} onCancel={controller.cancel} /> : null}

      {project?.metadata?.requiresHumanModelRefresh ? (
        <div className="create-app-status warning human-model-refresh-warning" role="alert">
          <strong>Modèle humain à vérifier</strong>
          <span>Une application seule a remplacé le projet actif. Le contexte de création peut ne plus correspondre. Demande à l’IA de relire l’application pour reconstruire ce contexte.</span>
          <button type="button" className="primary-action" onClick={controller.rebuildHumanModel} disabled={isBusy}>Reconstruire le contexte</button>
        </div>
      ) : null}

      {controller.error ? <div className="create-app-status error" role="alert"><strong>Oups</strong><span>{controller.error}</span>{controller.lastPrompt ? <button type="button" className="ghost-action" onClick={controller.retry} disabled={isBusy}>Réessayer la même demande</button> : null}</div> : null}
      {controller.repairError ? <div className="create-app-status error" role="alert"><strong>Réparation</strong><span>{controller.repairError}</span></div> : null}
      <details className="project-menu advanced-options">
        <summary>Options avancées</summary>
        <label className="ai-time-option">
          <input type="checkbox" checked={mode === 'co-create'} onChange={(event) => setMode(event.target.checked ? 'co-create' : 'create')} disabled={isBusy} />
          <span>Co-création</span>
          <small>L’IA peut proposer des suites et préparer des améliorations. Désactivé par défaut.</small>
        </label>
        <label className="ai-time-option">
          <input type="checkbox" checked={controller.hasTime} onChange={(event) => controller.setHasTime(event.target.checked)} disabled={isBusy} />
          <span>Analyse approfondie</span>
          <small>Autorise des contrôles plus longs quand c’est utile.</small>
        </label>
        <label className="ai-time-option">
          <input type="checkbox" checked={runtimeDebugEnabled} onChange={(event) => setRuntimeDebugEnabled(event.target.checked)} />
          <span>Debug runtime dans l’iframe</span>
          <small>Affiche par défaut les étapes numérotées du bridge host↔runtime et les logs utiles dans l’app générée.</small>
        </label>
        {project?.humanModel ? (
          <div className="human-model-help">
            <strong>Contexte utilisé par l’IA</strong>
            <p>Ces éléments aident Creatia à garder la même intention quand tu demandes une évolution.</p>
            <div className="human-model-editor">
              {[
                ['purpose', 'But'],
                ['audience', 'Pour qui'],
                ['tone', 'Style'],
                ['emotion', 'Ressenti'],
                ['journey', 'Parcours']
              ].map(([field, label]) => (
                <label key={field} className="human-model-field">
                  <span>{label}</span>
                  <input type="text" value={project.humanModel[field] || ''} onChange={(event) => controller.updateHumanModelField(field, event.target.value)} placeholder="À préciser" disabled={isBusy} />
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </details>




      {mode === 'co-create' ? (
        <details className="project-menu runtime-debug-panel" open={runtimeDebugEnabled}>
          <summary>Debug Runtime</summary>
          <div className="runtime-debug-summary">
            <strong>Trace ID courant</strong>
            <code>{runtimeTrace.currentTraceId || 'aucune demande Co-Create'}</code>
            <button type="button" className="ghost-action slim-action" onClick={handleCopyRuntimeTrace}>Copier le debug runtime</button>
          </div>
          <ol className="runtime-debug-timeline">
            {runtimeTrace.timeline.slice(0, 20).map((entry, index) => (
              <li key={entry.id}>
                <strong>{runtimeTrace.timeline.length - index}. {entry.step}</strong>
                <span>{entry.timestamp} · {entry.status}{entry.durationMs != null ? ` · ${entry.durationMs}ms` : ''}</span>
                <small>{entry.traceId || 'no-trace'} · {entry.message}</small>
              </li>
            ))}
          </ol>
          {runtimeTrace.rawResponses.length ? (
            <details>
              <summary>Réponses brutes capturées</summary>
              {runtimeTrace.rawResponses.slice(0, 5).map((entry, index) => (
                <pre key={`${entry.traceId}-${index}`}>{JSON.stringify(entry, null, 2)}</pre>
              ))}
            </details>
          ) : <small>Aucune réponse brute capturée.</small>}
        </details>
      ) : null}

      {mode === 'co-create' && latestSuggestions.length ? (
        <div className="ai-suggestions-card">
          <strong>Suggestions du partenaire créatif</strong>
          <div>{latestSuggestions.map((suggestion, index) => {
            const label = getSuggestionLabel(suggestion)
            return <button type="button" key={`${label}-${index}`} onClick={() => controller.submitPartnerSuggestion(suggestion)} disabled={isBusy}>{label}</button>
          })}</div>
        </div>
      ) : null}
      {mode === 'co-create' && continuationPlan ? (
        <div className="ai-suggestions-card">
          <strong>Plan de collaboration</strong>
          <span>{continuationPlan.summary || continuationPlan.nextContact || 'L’IA propose une suite de collaboration.'}</span>
        </div>
      ) : null}

      <button type="button" className="ghost-action" onClick={onClose}>Retour</button>
    </section>
  )
}

function CreatiaAiOverlay({ activity }) {
  return (
    <div className={`creatia-ai-overlay${activity.active ? ' is-active' : ''}`} role="status" aria-live="polite" aria-label={activity.active ? 'IA Creatia consultée' : 'IA Creatia en attente'}>
      <span className="creatia-ai-spinner" aria-hidden="true" />
      <span>{activity.active ? 'IA…' : 'IA prête'}</span>
    </div>
  )
}
