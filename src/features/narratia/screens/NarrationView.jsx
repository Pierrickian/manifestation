import { MilestoneTimeline } from '../components/MilestoneTimeline'
import { NarratiaLayout } from '../components/NarratiaLayout'
import { NarratorBadge } from '../components/NarratorBadge'

export function NarrationView({ storyPackage, segmentIndex, onNext, onBackToTimeline }) {
  const segment = storyPackage.segments[segmentIndex]
  const narrator = storyPackage.narrators.find((item) => item.id === segment?.narrator)
  const isLast = segmentIndex >= storyPackage.segments.length - 1

  return (
    <NarratiaLayout
      eyebrow={`Part ${segmentIndex + 1} of ${storyPackage.segments.length}`}
      title="Between two promised moments"
      intro="Read this part slowly, then move to the next connection when everyone is ready."
      footer={(
        <div className="flow-actions">
          <button className="primary-action" type="button" onClick={onNext}>{isLast ? 'Choose the ending' : 'Continue'}</button>
          <button className="ghost-action" type="button" onClick={onBackToTimeline}>See milestones</button>
        </div>
      )}
    >
      <MilestoneTimeline milestones={storyPackage.milestones} activeIndex={segment?.to ? segment.to - 1 : segmentIndex} compact />
      <article className="narratia-story-card">
        <NarratorBadge narrator={narrator || segment} />
        <p>{segment.text}</p>
      </article>
    </NarratiaLayout>
  )
}
