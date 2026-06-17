import { useEffect, useRef, useState } from 'react'
import { MANIFESTATION_DESIGN_SYSTEM } from '../../platform/ai/designSystem'
import { useAiApplicationController } from '../../platform/ai/hooks/useAiApplicationController'
import { AiInputComposer } from '../../platform/ai/components/AiInputComposer'
import { AiLoadingState } from '../../platform/ai/components/AiLoadingState'
import { HtmlViewer } from '../../platform/ai/renderers/HtmlViewer'
import { buildHtmlExport, buildProjectExport, exportHtmlProject, exportProjectJson, normalizeImportedProject, shareExport } from '../../platform/ai/projectExport'

export function HtmlAppGenerator({ onClose, onDebug, speechEnabled = true }) {
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
  const [showHealthcheckDetails, setShowHealthcheckDetails] = useState(false)
  const isBusy = controller.status === 'loading' || controller.status === 'repairing'
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
    setExportStatus(kind === 'html' ? 'HTML exporté dans les téléchargements.' : 'Projet exporté dans les téléchargements.')
  }

  function handleExportHtml() {
    if (!project?.currentApplication) return
    rememberExport(exportHtmlProject(project), 'html')
  }

  function handleExportProject() {
    if (!project) return
    rememberExport(exportProjectJson(project), 'project')
  }

  async function shareGeneratedExport(exportData, kind) {
    try {
      const shared = await shareExport({
        blob: exportData.blob,
        filename: exportData.filename,
        title: kind === 'html' ? 'Application HTML Creatia' : 'Projet Creatia',
        text: kind === 'html' ? 'Application HTML autonome exportée depuis Creatia.' : 'Projet Creatia exporté depuis Evolutia.'
      })
      setLastExport({ ...exportData, kind })
      setExportStatus(shared ? 'Partage ouvert.' : 'Partage indisponible sur ce navigateur. Tu peux télécharger le fichier puis le partager depuis ton appareil.')
    } catch (error) {
      setExportStatus(error?.name === 'AbortError' ? 'Partage annulé.' : 'Partage indisponible. Tu peux télécharger le fichier puis le partager depuis ton appareil.')
    }
  }

  async function handleShareHtml() {
    if (!project?.currentApplication) return
    await shareGeneratedExport(buildHtmlExport(project), 'html')
  }

  async function handleShareProject() {
    if (!project) return
    await shareGeneratedExport(buildProjectExport(project), 'project')
  }

  async function handleShareLastExport() {
    if (!lastExport) return
    await shareGeneratedExport(lastExport, lastExport.kind)
  }

  async function handleImportProject(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.name.endsWith('.manifestation.json')) {
      setExportStatus('Choisis un fichier .manifestation.json exporté depuis Creatia.')
      return
    }

    try {
      const payload = JSON.parse(await file.text())
      const importedProject = normalizeImportedProject(payload)
      controller.importProject(importedProject)
      setMode(importedProject.mode || 'create')
      setExportStatus('Projet importé sans perte. Tu peux continuer la création.')
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : 'Import impossible pour ce fichier.')
    }
  }

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

      <div className="mode-selector" aria-label="Mode de création">
        <button type="button" className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>Create</button>
        <button type="button" className={mode === 'co-create' ? 'active' : ''} onClick={() => setMode('co-create')}>Co-Create</button>
      </div>

      <label className="ai-time-option">
        <input type="checkbox" checked={controller.hasTime} onChange={(event) => controller.setHasTime(event.target.checked)} disabled={isBusy} />
        <span>I Have Time</span>
        <small>Autorise Planner, validations plus profondes, boucles de réparation et revues qualité quand l’IA le juge utile.</small>
      </label>

      <details className="project-menu ai-journal-menu">
        <summary>Journal IA</summary>
        {aiActivity.log.length ? (
          <ol>
            {aiActivity.log.map((entry) => (
              <li key={entry.id} className={entry.type}>
                <span>{entry.type === 'request' ? '↗' : entry.type === 'error' ? '!' : '↙'}</span>
                <strong>{entry.title}</strong>
                <time dateTime={entry.timestamp}>{new Date(entry.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>
              </li>
            ))}
          </ol>
        ) : <small>Aucun appel IA Creatia pour le moment.</small>}
      </details>

      <details className="project-menu" open={Boolean(project)}>
        <summary>Exporter</summary>
        <div className="project-menu-actions">
          <button type="button" className="ghost-action project-export-action" onClick={handleExportHtml} disabled={!project?.currentApplication}>
            <span>Page web (.html)</span>
            <small>Jouer ou partager.</small>
          </button>
          <button type="button" className="ghost-action project-export-action project-share-action" onClick={handleShareHtml} disabled={!project?.currentApplication}>
            <span>Partager la page</span>
            <small>Même si elle est déjà téléchargée.</small>
          </button>
          <button type="button" className="ghost-action project-export-action" onClick={handleExportProject} disabled={!project}>
            <span>Projet</span>
            <small>Continuer à créer plus tard. À réimporter ici.</small>
          </button>
          <button type="button" className="ghost-action project-export-action project-share-action" onClick={handleShareProject} disabled={!project}>
            <span>Partager le projet</span>
            <small>Même s’il est déjà téléchargé.</small>
          </button>
          <button type="button" className="ghost-action project-export-action" onClick={() => importInputRef.current?.click()} disabled={isBusy}>
            <span>Importer</span>
            <small>Restaurer un projet exporté.</small>
          </button>
          {lastExport?.url ? <a className="ghost-action export-link" href={lastExport.url} target="_blank" rel="noreferrer">Ouvrir</a> : null}
          {lastExport ? <button type="button" className="ghost-action" onClick={handleShareLastExport}>Partager</button> : null}
        </div>
        <input ref={importInputRef} className="visually-hidden" type="file" accept=".manifestation.json,application/json" onChange={handleImportProject} />
        <small>L’export Projet sert à reprendre la création après Import. Export APK non implémenté.</small>
        {exportStatus ? <span className="project-export-status" role="status">{exportStatus}</span> : null}
      </details>

      {controller.pipeline ? (
        <div className="ai-pipeline-card">
          <strong>{controller.pipeline.strategy.label}</strong>
          <span>{controller.pipeline.strategy.description}</span>
          <small>Capacités détectées : {Object.entries(controller.pipeline.capabilities).filter(([, enabled]) => enabled).map(([key]) => key).join(', ') || 'standard'}</small>
        </div>
      ) : null}

      <AiInputComposer
        value={controller.input}
        onChange={controller.setInput}
        onSubmit={controller.submit}
        onTranscript={controller.appendTranscript}
        disabled={isBusy}
        speechEnabled={speechEnabled}
        statusMessage={(message) => onDebug?.({ status: 'speech', message, timestamp: new Date().toISOString() })}
        placeholder={project ? 'Ex: ajoute un minimap, change les couleurs, simplifie l’interface…' : 'Ex: un jeu de mémoire doux avec progression et sons…'}
      />

      {isBusy ? <AiLoadingState text={controller.status === 'repairing' ? 'Réparation automatique…' : controller.progressText} onCancel={controller.cancel} /> : null}
      {controller.error ? <div className="create-app-status error" role="alert"><strong>Oups</strong><span>{controller.error}</span></div> : null}
      {controller.repairError ? <div className="create-app-status error" role="alert"><strong>Réparation</strong><span>{controller.repairError}</span></div> : null}
      {html ? (
        <div className="iaview-ready-card">
          <strong>{project.creationRequest}</strong>
          <span>Projet enregistré automatiquement. {controller.healthcheck?.label || 'Application Generated'}. Demande une évolution ou ouvre l’application.</span>
          <button type="button" className="primary-action" onClick={() => setIsViewingHtml(true)}>Ouvrir l’application</button>
        </div>
      ) : null}

      {project?.humanModel ? (
        <details className="project-menu">
          <summary>Niveau humain</summary>
          <dl className="human-model-list">
            <div><dt>Objectif</dt><dd>{project.humanModel.purpose || 'À préciser'}</dd></div>
            <div><dt>Audience</dt><dd>{project.humanModel.audience || 'À préciser'}</dd></div>
            <div><dt>Ton</dt><dd>{project.humanModel.tone || 'À préciser'}</dd></div>
            <div><dt>Émotion</dt><dd>{project.humanModel.emotion || 'À préciser'}</dd></div>
            <div><dt>Parcours</dt><dd>{project.humanModel.journey || 'À préciser'}</dd></div>
          </dl>
        </details>
      ) : null}

      {project?.evolutionHistory?.length ? (
        <details className="project-menu">
          <summary>Historique d’évolution</summary>
          <ol className="evolution-history-list">
            {project.evolutionHistory.slice(-3).reverse().map((entry, index) => (
              <li key={`${entry.at || 'evolution'}-${index}`}>
                <strong>{entry.userRequest}</strong>
                {entry.analysis ? <span>{entry.analysis}</span> : null}
                {entry.decisions?.length ? <small>Décisions : {entry.decisions.join(' · ')}</small> : null}
                {entry.generatedChanges?.length ? <small>Changements : {entry.generatedChanges.join(' · ')}</small> : null}
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      {controller.healthcheck ? (
        <div className={`ai-verification-card ${controller.healthcheck.status}`}>
          <strong>{controller.healthcheck.label}</strong>
          <span>Healthcheck: {controller.healthcheck.passedCount ?? controller.healthcheck.checks.filter((check) => check.ok).length}/{controller.healthcheck.checks.length} passed</span>
          <small>Repair confidence: {controller.healthcheck.repairConfidence || 'none'}{controller.healthcheck.repairAttempts ? ` · ${controller.healthcheck.repairAttempts} repair attempt(s)` : ''}</small>
          <div className="ai-repair-actions">
            <button type="button" className="ghost-action" onClick={() => setShowHealthcheckDetails((visible) => !visible)}>
              {showHealthcheckDetails ? 'Hide Details' : 'View Details'}
            </button>
            <button type="button" className="ghost-action" onClick={controller.retry} disabled={isBusy}>Retry</button>
            <button type="button" className="primary-action" onClick={controller.repair} disabled={isBusy || controller.healthcheck.status === 'verified' || !controller.healthcheck.isRepairable}>Repair</button>
          </div>
          {showHealthcheckDetails ? (
            <ul className="ai-healthcheck-details">
              {controller.healthcheck.checks.map((check) => (
                <li key={check.id} className={check.ok ? 'passed' : 'failed'}>
                  <strong>{check.ok ? '✓' : '×'} {check.id}</strong>
                  <span>{check.message}</span>
                  {!check.ok ? <small>Expected: {check.expected} · Actual: {check.actual}</small> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

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
