import { MilestoneTimeline } from '../components/MilestoneTimeline'
import { NarratiaLayout } from '../components/NarratiaLayout'

export function StoryTimeline({ storyPackage, onBegin, onReplayEnding, onHome, onNewStory }) {
  return (
    <NarratiaLayout
      eyebrow="Moments promis"
      title={storyPackage.title}
      intro="Ces moments vont arriver. La surprise se cache dans le chemin qui les relie."
      footer={(
        <div className="flow-actions">
          <button className="primary-action" type="button" onClick={onBegin}>Entrer dans le fil lumineux</button>
          {onReplayEnding ? <button className="ghost-action" type="button" onClick={onReplayEnding}>Choisir une autre fin</button> : null}
          <button className="ghost-action" type="button" onClick={onHome}>Accueil Narratia</button>
          <button className="ghost-action" type="button" onClick={onNewStory}>Nouvelle histoire</button>
        </div>
      )}
    >
      <MilestoneTimeline milestones={storyPackage.milestones} activeIndex={storyPackage.milestones.length - 1} />
    </NarratiaLayout>
  )
}
