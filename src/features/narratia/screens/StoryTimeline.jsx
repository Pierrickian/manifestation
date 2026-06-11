import { MilestoneTimeline } from '../components/MilestoneTimeline'
import { NarratiaLayout } from '../components/NarratiaLayout'

export function StoryTimeline({ storyPackage, onBegin, onReplayEnding }) {
  return (
    <NarratiaLayout
      eyebrow="Promised moments"
      title={storyPackage.title}
      intro="These moments will happen. The story lives in how everyone travels between them."
      footer={(
        <div className="flow-actions">
          <button className="primary-action" type="button" onClick={onBegin}>Begin narration</button>
          {onReplayEnding ? <button className="ghost-action" type="button" onClick={onReplayEnding}>Choose an ending again</button> : null}
        </div>
      )}
    >
      <MilestoneTimeline milestones={storyPackage.milestones} activeIndex={storyPackage.milestones.length - 1} />
    </NarratiaLayout>
  )
}
