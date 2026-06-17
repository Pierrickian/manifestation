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

  if (html && isViewingHtml) {
    return <HtmlViewer html={html} title={project?.creationRequest || 'Application créée'} onBack={() => setIsViewingHtml(false)} />
  }

  return (
    <section className="create-app-panel html-generator-panel" aria-labelledby="project-creator-title">
      <div className="create-app-aurora" aria-hidden="true" />
      <div className="create-app-header">
        <p className="eyebrow">Manifestation AI</p>
        <h2 id="project-creator-title">Décris ce que tu veux.</h2>
        <p>Parle ou écris ton idée. La plateforme crée un projet automatiquement, puis le fait évoluer avec tes demandes.</p>
      </div>

      <div className="mode-selector" aria-label="Mode de création">
        <button type="button" className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>Create</button>
        <button type="button" className={mode === 'co-create' ? 'active' : ''} onClick={() => setMode('co-create')}>Co-Create</button>
      </div>

      <AiInputComposer
        value={controller.input}
        onChange={controller.setInput}
        onSubmit={controller.submit}
        onTranscript={controller.appendTranscript}
        disabled={controller.status === 'loading'}
        speechEnabled={speechEnabled}
        statusMessage={(message) => onDebug?.({ status: 'speech', message, timestamp: new Date().toISOString() })}
        placeholder={project ? 'Ex: ajoute un minimap, change les couleurs, simplifie l’interface…' : 'Ex: un jeu de mémoire doux avec progression et sons…'}
      />

      {controller.status === 'loading' ? <AiLoadingState text={controller.progressText} onCancel={controller.cancel} /> : null}
      {controller.error ? <div className="create-app-status error" role="alert"><strong>Oups</strong><span>{controller.error}</span></div> : null}
      {html ? (
        <div className="iaview-ready-card">
          <strong>{project.creationRequest}</strong>
          <span>Projet enregistré automatiquement. Demande une évolution ou ouvre l’application.</span>
          <button type="button" className="primary-action" onClick={() => setIsViewingHtml(true)}>Ouvrir l’application</button>
        </div>
      ) : null}
      {mode === 'co-create' && latestSuggestions.length ? (
        <div className="ai-suggestions-card">
          <strong>Suggestions du partenaire créatif</strong>
          <div>{latestSuggestions.map((suggestion, index) => <button type="button" key={`${suggestion}-${index}`} onClick={() => controller.setInput(String(suggestion))}>{suggestion}</button>)}</div>
        </div>
      ) : null}

      <button type="button" className="ghost-action" onClick={onClose}>Retour</button>
    </section>
  )
}
