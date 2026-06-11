export function NarratorBadge({ narrator }) {
  return (
    <div className="narratia-narrator">
      <span aria-hidden="true" />
      <div>
        <strong>{narrator?.displayName || narrator?.narratorDisplayName || 'Story voice'}</strong>
        {narrator?.personality || narrator?.mood ? <small>{narrator.personality || narrator.mood}</small> : null}
      </div>
    </div>
  )
}
