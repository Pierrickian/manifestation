export function ChoiceCard({ title, description, active, onClick, disabled }) {
  return (
    <button
      className={`narratia-choice${active ? ' is-active' : ''}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
    >
      <span className="narratia-choice__art" aria-hidden="true" />
      <span className="narratia-choice__copy">
        <strong>{title}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </button>
  )
}
