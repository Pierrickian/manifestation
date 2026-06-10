export function NeedBadge({ need, subtle = false }) {
  if (!need) return null

  return (
    <span
      className={`need-badge${subtle ? ' need-badge-subtle' : ''}`}
      style={{ '--need-color': need.uiColor }}
    >
      <span aria-hidden="true" />
      {need.name} · {need.needLabel}
    </span>
  )
}
