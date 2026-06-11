export function NarratorBadge({ narrator, tone = 'neutral' }) {
  return (
    <div className={`narratia-narrator is-${tone}`}>
      <span aria-hidden="true" />
      <div>
        <strong>{narrator?.displayName || narrator?.narratorDisplayName || 'Voix de l’histoire'}</strong>
        {narrator?.personality || narrator?.mood ? <small>{narrator.personality || narrator.mood}</small> : null}
      </div>
    </div>
  )
}
