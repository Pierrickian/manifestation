import { useState } from 'react'
import { MANIFESTATION_DESIGN_SYSTEM } from '../../platform/ai/designSystem'
import { useAiApplicationController } from '../../platform/ai/hooks/useAiApplicationController'
import { AiInputComposer } from '../../platform/ai/components/AiInputComposer'
import { AiLoadingState } from '../../platform/ai/components/AiLoadingState'
import { HtmlViewer } from '../../platform/ai/renderers/HtmlViewer'

export function HtmlAppGenerator({ onClose, onDebug, speechEnabled = true }) {
  const [isViewingHtml, setIsViewingHtml] = useState(false)
  const [mode, setMode] = useState('create')
  const controller = useAiApplicationController({ mode, designSystem: MANIFESTATION_DESIGN_SYSTEM, speechEnabled, onDebug })
  const project = controller.project
  const html = project?.currentApplication || ''
  const latestSuggestions = project?.aiSuggestionsHistory?.at(-1)?.suggestions || []
  const preloadQueue = mode === 'co-create' ? project?.preloadQueue || [] : []
  const continuationPlan = mode === 'co-create' ? project?.continuationPlan : null
  const [showHealthcheckDetails, setShowHealthcheckDetails] = useState(false)
  const isBusy = controller.status === 'loading' || controller.status === 'repairing'

  if (html && isViewingHtml) {
    return <HtmlViewer html={html} title={project?.creationRequest || 'Application créée'} onBack={() => setIsViewingHtml(false)} />
  }

  return (
    <section className="create-app-panel html-generator-panel" aria-labelledby="project-creator-title">
      <div className="create-app-aurora" aria-hidden="true" />
      <div className="create-app-header">
        <p className="eyebrow">Creatia</p>
        <h2 id="project-creator-title">Crée avec Creatia.</h2>
        <p>Parle ou écris ton idée. La plateforme crée un projet automatiquement, puis le fait évoluer avec tes demandes.</p>
      </div>

      <div className="mode-selector" aria-label="Mode de création">
        <button type="button" className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>Create</button>
        <button type="button" className={mode === 'co-create' ? 'active' : ''} onClick={() => setMode('co-create')}>Co-Create</button>
      </div>

      <label className="ai-time-option">
        <input type="checkbox" checked={controller.hasTime} onChange={(event) => controller.setHasTime(event.target.checked)} disabled={isBusy} />
        <span>I Have Time</span>
        <small>Autorise Planner, validations plus profondes, boucles de réparation et revues qualité quand l’IA le juge utile.</small>
      </label>

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
