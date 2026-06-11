import { NarratiaLayout } from '../components/NarratiaLayout'

export function EndingReveal({ ending, onReplay, onAlternate, onNewStory }) {
  return (
    <NarratiaLayout
      eyebrow={ending.emotion}
      title={ending.title}
      intro="The chosen ending opens now."
      footer={(
        <div className="flow-actions">
          <button className="primary-action" type="button" onClick={onReplay}>Replay this story</button>
          <button className="ghost-action" type="button" onClick={onAlternate}>Try another ending</button>
          <button className="ghost-action" type="button" onClick={onNewStory}>Create a new story</button>
        </div>
      )}
    >
      <article className="narratia-story-card narratia-story-card--ending">
        <span className="narratia-ending-art" aria-hidden="true" />
        <p>{ending.text}</p>
      </article>
    </NarratiaLayout>
  )
}
