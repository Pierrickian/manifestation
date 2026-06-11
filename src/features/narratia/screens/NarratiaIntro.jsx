import { NarratiaLayout } from '../components/NarratiaLayout'

export function NarratiaIntro({ hasStory, onStart, onResume }) {
  return (
    <NarratiaLayout
      eyebrow="Narratia"
      title="A shared story with promised moments"
      intro="A grown-up sets a gentle story space, a child chooses magical ingredients, and two story companions help narrate the journey."
      footer={(
        <div className="flow-actions">
          <button className="primary-action" type="button" onClick={onStart}>Begin a new story</button>
          {hasStory ? <button className="ghost-action" type="button" onClick={onResume}>Return to saved story</button> : null}
        </div>
      )}
    >
      <div className="narratia-promise-grid">
        <article>
          <strong>Promised milestones</strong>
          <p>The important moments are revealed early so the child can imagine how they may happen.</p>
        </article>
        <article>
          <strong>Shared narration</strong>
          <p>Mira and Noe, two gentle virtual children, help tell the parts between the milestones.</p>
        </article>
        <article>
          <strong>Meaningful ending</strong>
          <p>The child chooses one of three endings before the final text is revealed.</p>
        </article>
      </div>
    </NarratiaLayout>
  )
}
