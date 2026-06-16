import { MANIFESTATION_DESIGN_SYSTEM } from '../../platform/ai/designSystem'
import { useAiApplicationController } from '../../platform/ai/hooks/useAiApplicationController'
import { AiInputComposer } from '../../platform/ai/components/AiInputComposer'
import { AiLoadingState } from '../../platform/ai/components/AiLoadingState'
import { HtmlViewer } from '../../platform/ai/renderers/HtmlViewer'

export function HtmlAppGenerator({ onClose, speechEnabled = true }) {
  const controller = useAiApplicationController({ rendererType: 'html', designSystem: MANIFESTATION_DESIGN_SYSTEM, speechEnabled })
  const html = controller.result?.html || controller.result?.text || ''

  return (
    <section className="create-app-panel html-generator-panel" aria-labelledby="html-generator-title">
      <div className="create-app-aurora" aria-hidden="true" />
      <div className="create-app-header">
        <p className="eyebrow">AI Application Platform</p>
        <h2 id="html-generator-title">Html App Generator</h2>
        <p>Décris une application avec le préfixe <strong>html</strong>. La couche IA partagée construit le prompt, injecte le design system, puis le renderer HTML exécute le résultat.</p>
      </div>

      <AiInputComposer
        value={controller.input}
        onChange={controller.setInput}
        onSubmit={controller.submit}
        onTranscript={controller.appendTranscript}
        disabled={controller.status === 'loading'}
        speechEnabled={speechEnabled}
        statusMessage={(message) => controller.setInput((current) => current)}
        placeholder="html fibonacci visualization"
      />

      {controller.status === 'loading' ? <AiLoadingState text={controller.progressText} onCancel={controller.cancel} /> : null}
      {controller.error ? <div className="create-app-status error" role="alert"><strong>error</strong><span>{controller.error}</span></div> : null}
      {html ? <HtmlViewer html={html} /> : null}

      <button type="button" className="ghost-action" onClick={onClose}>Retour</button>
    </section>
  )
}
