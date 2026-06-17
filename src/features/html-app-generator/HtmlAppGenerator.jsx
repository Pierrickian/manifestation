import { useState } from 'react'
import { MANIFESTATION_DESIGN_SYSTEM } from '../../platform/ai/designSystem'
import { useAiApplicationController } from '../../platform/ai/hooks/useAiApplicationController'
import { AiInputComposer } from '../../platform/ai/components/AiInputComposer'
import { AiLoadingState } from '../../platform/ai/components/AiLoadingState'
import { HtmlViewer } from '../../platform/ai/renderers/HtmlViewer'

export function HtmlAppGenerator({ onClose, onDebug, speechEnabled = true }) {
  const [isViewingHtml, setIsViewingHtml] = useState(false)
  const controller = useAiApplicationController({ rendererType: 'html', designSystem: MANIFESTATION_DESIGN_SYSTEM, speechEnabled, onDebug })
  const html = controller.result?.html || controller.result?.text || ''

  if (html && isViewingHtml) {
    return <HtmlViewer html={html} onBack={() => setIsViewingHtml(false)} />
  }

  return (
    <section className="create-app-panel html-generator-panel" aria-labelledby="iaview-title">
      <div className="create-app-aurora" aria-hidden="true" />
      <div className="create-app-header">
        <p className="eyebrow">IAview</p>
        <h2 id="iaview-title">Crée une page vivante</h2>
        <p>Décris ce que tu veux obtenir. Tu peux parler au micro, relire, corriger, puis lancer la création.</p>
      </div>

      <AiInputComposer
        value={controller.input}
        onChange={controller.setInput}
        onSubmit={controller.submit}
        onTranscript={controller.appendTranscript}
        disabled={controller.status === 'loading'}
        speechEnabled={speechEnabled}
        statusMessage={(message) => onDebug?.({ status: 'speech', message, timestamp: new Date().toISOString() })}
        placeholder="html visualisation fibonacci"
      />

      {controller.status === 'loading' ? <AiLoadingState text={controller.progressText} onCancel={controller.cancel} /> : null}
      {controller.error ? <div className="create-app-status error" role="alert"><strong>Oups</strong><span>{controller.error}</span></div> : null}
      {html ? (
        <div className="iaview-ready-card">
          <strong>Ta page est prête.</strong>
          <span>Ouvre-la en plein écran, puis reviens ici avec le bouton de retour.</span>
          <button type="button" className="primary-action" onClick={() => setIsViewingHtml(true)}>Ouvrir la page</button>
        </div>
      ) : null}

      <button type="button" className="ghost-action" onClick={onClose}>Retour</button>
    </section>
  )
}
