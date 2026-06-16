export function AiLoadingState({ text, onCancel }) {
  return (
    <div className="ai-loading-state" role="status" aria-live="polite">
      <span className="ai-spinner" aria-hidden="true" />
      <strong>{text}</strong>
      {onCancel ? <button type="button" className="ghost-action" onClick={onCancel}>Annuler</button> : null}
    </div>
  )
}
