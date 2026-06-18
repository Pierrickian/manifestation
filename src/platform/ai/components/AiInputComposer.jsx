import { useSpeechInput } from '../hooks/useSpeechInput'

export function AiInputComposer({ value, onChange, onSubmit, onRetry, canRetry = false, onTranscript, disabled, speechEnabled, statusMessage, placeholder }) {
  const speech = useSpeechInput({ enabled: speechEnabled, onTranscript, onStatus: statusMessage })

  return (
    <div className="ai-composer">
      <label className="create-app-field">
        <span>Prompt</span>
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={7} disabled={disabled} />
      </label>
      <div className="create-app-actions">
        {speechEnabled ? (
          <button type="button" className={`ghost-action create-app-mic${speech.isListening ? ' is-listening' : ''}`} onClick={speech.start} disabled={disabled}>
            {speech.isListening ? '● Écoute…' : '🎙️ Micro'}
          </button>
        ) : null}
        {canRetry ? <button type="button" className="ghost-action" onClick={onRetry} disabled={disabled}>Réessayer</button> : null}
        <button type="button" className="primary-action" onClick={onSubmit} disabled={disabled}>{disabled ? 'Génération…' : 'Générer'}</button>
      </div>
    </div>
  )
}
