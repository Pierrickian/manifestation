import { NarratiaLayout } from '../components/NarratiaLayout'

export function NarratiaIntro({ hasStory, onStart, onResume }) {
  return (
    <NarratiaLayout
      eyebrow="Narratia"
      title="Une histoire partagée avec des moments promis"
      intro="Un adulte prépare un espace doux, l’enfant choisit des ingrédients magiques, puis deux compagnons racontent certains passages."
      footer={(
        <div className="flow-actions">
          <button className="primary-action" type="button" onClick={onStart}>Commencer une nouvelle histoire</button>
          {hasStory ? <button className="ghost-action" type="button" onClick={onResume}>Revenir à l’histoire gardée</button> : null}
        </div>
      )}
    >
      <div className="narratia-promise-grid">
        <article>
          <strong>Moments promis</strong>
          <p>Les grands moments sont visibles dès le début pour imaginer comment ils vont arriver.</p>
        </article>
        <article>
          <strong>Récit partagé</strong>
          <p>Mira et Noé aident à raconter les chemins entre deux moments lumineux.</p>
        </article>
        <article>
          <strong>Choix final</strong>
          <p>L’enfant choisit une fin parmi trois possibilités avant de découvrir le texte complet.</p>
        </article>
      </div>
    </NarratiaLayout>
  )
}
