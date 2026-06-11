export function MilestoneTimeline({ milestones, activeIndex = 0, compact = false }) {
  return (
    <ol className={`narratia-timeline${compact ? ' narratia-timeline--compact' : ''}`}>
      {milestones.map((milestone, index) => (
        <li className={index <= activeIndex ? 'is-awake' : ''} key={milestone.id}>
          <span className="narratia-timeline__node" aria-hidden="true" />
          <div>
            <strong>{milestone.title}</strong>
            <p>{milestone.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
