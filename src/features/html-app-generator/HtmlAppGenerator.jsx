import { useEffect, useRef, useState } from 'react'
import { MANIFESTATION_DESIGN_SYSTEM } from '../../platform/ai/designSystem'
import { useAiApplicationController } from '../../platform/ai/hooks/useAiApplicationController'
import { AiInputComposer } from '../../platform/ai/components/AiInputComposer'
import { AiLoadingState } from '../../platform/ai/components/AiLoadingState'
import { HtmlViewer } from '../../platform/ai/renderers/HtmlViewer'
import { createProjectFromImportedHtml, exportHtmlProject, exportProjectJson, importHtmlIntoProject, normalizeImportedProject } from '../../platform/ai/projectExport'

export function HtmlAppGenerator({ onClose, onDebug, onMenuData, speechEnabled = true }) {
  const [isViewingHtml, setIsViewingHtml] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)
  const [lastExport, setLastExport] = useState(null)
  const importInputRef = useRef(null)
  const [mode, setMode] = useState('create')
  const [aiActivity, setAiActivity] = useState({ active: false, log: [] })

  function recordAiActivity(event = {}) {
    onDebug?.(event)
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
  const html = project?.currentApplication || ''
  const latestSuggestions = project?.aiSuggestionsHistory?.at(-1)?.suggestions || []
  const preloadQueue = mode === 'co-create' ? project?.preloadQueue || [] : []
  const continuationPlan = mode === 'co-create' ? project?.continuationPlan : null
  const lastAutoOpenedHtmlRef = useRef('')
  const isBusy = controller.status === 'loading' || controller.status === 'repairing' || controller.status === 'refreshingHumanModel'
  const hasUnsavedAiApp = Boolean(project?.currentApplication || controller.input.trim() || isBusy)

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
    setLastExport({ ...exportData, kind })
    setExportStatus(kind === 'html' ? 'Application téléchargée.' : 'Projet complet téléchargé.')
  }

  function handleExportHtml() {
    if (!project?.currentApplication) return
    rememberExport(exportHtmlProject(project), 'html')
  }

  function handleExportProject() {
    if (!project) return
    rememberExport(exportProjectJson(project), 'project')
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
        setExportStatus('Projet complet importé. L’application, le contexte et l’historique sont restaurés.')
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

  async function handleCopyExternalPrompt() {
    if (!project && !controller.lastPrompt) return
    const history = (project?.evolutionHistory || []).slice(-6).map((entry, index) => `${index + 1}. Demande: ${entry.userRequest || 'Non précisée'}\nAnalyse: ${entry.analysis || 'Non précisée'}\nChangements: ${(entry.generatedChanges || []).join(', ') || 'Non précisés'}`).join('\n\n')
    const prompt = [
      'Tu es une IA experte en création d’applications web autonomes.',
      'Refais une version complète, exécutable dans un navigateur, en un seul fichier avec styles et interactions intégrés.',
      `Demande initiale: ${project?.creationRequest || controller.lastPrompt || 'Non précisée'}`,
      controller.lastPrompt ? `Dernière demande utilisateur: ${controller.lastPrompt}` : '',
      project?.humanModel ? `Contexte utilisateur: ${JSON.stringify(project.humanModel, null, 2)}` : '',
      history ? `Historique utile:\n${history}` : '',
      html ? `Version actuelle à améliorer ou reconstruire:\n${html}` : '',
      'Retourne uniquement le code final complet, sans explication autour.'
    ].filter(Boolean).join('\n\n')

    try {
      await navigator.clipboard.writeText(prompt)
      setExportStatus('Brief copié. Tu peux le coller dans une autre IA.')
    } catch {
      setExportStatus('Copie automatique indisponible. Sélectionne et copie le brief manuellement depuis ton navigateur.')
    }
  }

  useEffect(() => {
    onMenuData?.({
      journal: aiActivity.log,
      steps: aiActivity.log,
      pipeline: controller.pipeline,
      healthcheck: controller.healthcheck,
      history: project?.evolutionHistory || []
    })
  }, [onMenuData, aiActivity.log, controller.pipeline, controller.healthcheck, project?.evolutionHistory])

  if (html && isViewingHtml) {
    return <HtmlViewer html={html} title={project?.creationRequest || 'Application créée'} onBack={() => setIsViewingHtml(false)} aiOverlay={<CreatiaAiOverlay activity={aiActivity} />} />
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




      <div className="project-menu import-menu">
        <button type="button" className="primary-action project-export-action" onClick={() => importInputRef.current?.click()} disabled={isBusy}>
          <span>Importer</span>
          <small>Charge un projet complet ou une application seule.</small>
        </button>
        <input ref={importInputRef} className="visually-hidden" type="file" accept=".manifestation.json,application/json,.html,text/html" onChange={handleImport} />
        {exportStatus ? <span className="project-export-status" role="status">{exportStatus}</span> : null}
      </div>

      <details className="project-menu" open={Boolean(project)}>
        <summary>Exporter</summary>
        <div className="project-menu-actions">
          <button type="button" className="ghost-action project-export-action" onClick={handleExportHtml} disabled={!project?.currentApplication}>
            <span>Application seule</span>
            <small>Pour ouvrir ailleurs. Ne garde pas l’historique de création.</small>
          </button>
          <button type="button" className="ghost-action project-export-action" onClick={handleExportProject} disabled={!project}>
            <span>Projet complet</span>
            <small>Application + contexte + historique pour continuer plus tard.</small>
          </button>
          {lastExport?.url ? <a className="ghost-action export-link" href={lastExport.url} target="_blank" rel="noreferrer">Ouvrir le téléchargement</a> : null}
        </div>
        <small>Application seule : pratique à ouvrir ailleurs. Projet complet : reprend la création avec le contexte.</small>
      </details>




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
      {html ? (
        <div className="iaview-ready-card">
          <strong>{project.creationRequest}</strong>
          <span>Projet enregistré automatiquement. Demande une évolution ou ouvre l’application.</span>
          <div className="create-app-actions"><button type="button" className="primary-action" onClick={() => setIsViewingHtml(true)}>Ouvrir l’application</button><button type="button" className="ghost-action" onClick={handleCopyExternalPrompt}>Copier un brief pour une autre IA</button></div>
        </div>
      ) : null}

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
        {project?.humanModel ? (
          <div className="human-model-help">
            <strong>Contexte utilisé par l’IA</strong>
            <p>Ces éléments aident Creatia à garder la même intention quand tu demandes une évolution.</p>
            <dl className="human-model-list">
              <div><dt>But</dt><dd>{project.humanModel.purpose || 'À préciser dans ta prochaine demande'}</dd></div>
              <div><dt>Pour qui</dt><dd>{project.humanModel.audience || 'À préciser dans ta prochaine demande'}</dd></div>
              <div><dt>Style</dt><dd>{project.humanModel.tone || 'À préciser dans ta prochaine demande'}</dd></div>
              <div><dt>Ressenti</dt><dd>{project.humanModel.emotion || 'À préciser dans ta prochaine demande'}</dd></div>
              <div><dt>Parcours</dt><dd>{project.humanModel.journey || 'À préciser dans ta prochaine demande'}</dd></div>
            </dl>
          </div>
        ) : null}
      </details>



      {mode === 'co-create' && latestSuggestions.length ? (
        <div className="ai-suggestions-card">
          <strong>Suggestions du partenaire créatif</strong>
          <div>{latestSuggestions.map((suggestion, index) => <button type="button" key={`${suggestion}-${index}`} onClick={() => controller.submitPartnerSuggestion(suggestion)} disabled={isBusy}>{suggestion}</button>)}</div>
        </div>
      ) : null}
      {mode === 'co-create' && continuationPlan ? (
        <div className="ai-suggestions-card">
          <strong>Plan de continuation</strong>
          <span>{continuationPlan.summary || continuationPlan.nextContact || 'L’IA propose une suite de collaboration.'}</span>
        </div>
      ) : null}
      {mode === 'co-create' && preloadQueue.length ? (
        <div className="ai-suggestions-card">
          <strong>Preload proposé</strong>
          <div>{preloadQueue.map((item, index) => <button type="button" key={`${item.task || 'preload'}-${index}`} onClick={() => controller.submitPartnerSuggestion(item.task || item.reason || 'Préparer le contenu suivant')} disabled={isBusy}>{item.priority || 'Soon'} · {item.task || item.reason}</button>)}</div>
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
