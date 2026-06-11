import { NarratiaLayout } from '../components/NarratiaLayout'

export function EndingReveal({ ending, onReplay, onAlternate, onNewStory }) {
  return (
    <NarratiaLayout
      eyebrow={ending.emotion}
      title={ending.title}
      intro="La fin choisie se révèle maintenant."
      footer={(
        <div className="flow-actions">
          <button className="primary-action" type="button" onClick={onReplay}>Rejouer cette histoire</button>
          <button className="ghost-action" type="button" onClick={onAlternate}>Essayer une autre fin</button>
          <button className="ghost-action" type="button" onClick={onNewStory}>Créer une nouvelle histoire</button>
        </div>
      )}
    >
      <article className="narratia-story-card narratia-story-card--ending narratia-reveal-card is-revealed">
        <span className="narratia-ending-art" aria-hidden="true" />
        <p>{ending.text}</p>
      </article>
    </NarratiaLayout>
  )
}
