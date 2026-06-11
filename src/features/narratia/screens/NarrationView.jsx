import { Fragment } from 'react'
import { NarratorBadge } from '../components/NarratorBadge'
import { NarratiaLayout } from '../components/NarratiaLayout'

const VIRTUAL_CHILD_IDS = ['virtual_child_a', 'virtual_child_b']

function getNarratorTone(narratorId) {
  if (narratorId === 'virtual_child_a') return 'girl'
  if (narratorId === 'virtual_child_b') return 'boy'
  return 'neutral'
}

function getNarratorRoleLabel(narratorId) {
  if (narratorId === 'virtual_child_a') return 'fille'
  if (narratorId === 'virtual_child_b') return 'garçon'
  return 'voix'
}

function MilestoneBlock({ milestone, index, isLast }) {
  return (
    <li className={`narratia-path-item narratia-path-item--milestone${isLast ? ' is-last' : ''}`}>
      <span className="narratia-path-dot narratia-path-dot--milestone" aria-hidden="true" />
      <article className="narratia-milestone-card">
        <small>Moment promis {index + 1}</small>
        <strong>{milestone.title}</strong>
        <p>{milestone.text}</p>
      </article>
    </li>
  )
}

function SegmentBlock({ segment, index, narrators, selectedNarratorId, isRevealed, isCurrent, isLocked, onChooseNarrator, onReveal }) {
  const possibleNarrators = narrators.filter((narrator) => VIRTUAL_CHILD_IDS.includes(narrator.id))
  const selectedNarrator = narrators.find((narrator) => narrator.id === selectedNarratorId) || narrators.find((narrator) => narrator.id === segment.narrator)
  const tone = getNarratorTone(selectedNarrator?.id)

  return (
    <li className={`narratia-path-item narratia-path-item--segment is-${tone}${isCurrent ? ' is-current' : ''}${isRevealed ? ' is-revealed' : ''}`}>
      <span className={`narratia-path-dot narratia-path-dot--${tone}`} aria-hidden="true" />
      <article className="narratia-reveal-card">
        <small>Entre le moment {segment.from} et le moment {segment.to}</small>
        {isLocked ? (
          <div className="narratia-next-choice narratia-next-choice--locked">
            <strong>Ce passage attend son tour.</strong>
            <p>Révèle d’abord la carte lumineuse précédente.</p>
          </div>
        ) : !selectedNarratorId ? (
          <div className="narratia-next-choice">
            <strong>Qui raconte ce passage ?</strong>
            <p>Choisis Mira ou Noé, puis touche la carte pour révéler la narration.</p>
            <div className="narratia-narrator-choice-grid">
              {possibleNarrators.map((narrator) => (
                <button className={`narratia-narrator-choice is-${getNarratorTone(narrator.id)}`} type="button" key={narrator.id} onClick={() => onChooseNarrator(segment.id, narrator.id)}>
                  <span aria-hidden="true" />
                  <strong>{narrator.displayName}</strong>
                  <small>{getNarratorRoleLabel(narrator.id)}</small>
                </button>
              ))}
            </div>
          </div>
        ) : !isRevealed ? (
          <button className={`narratia-reveal-button is-${tone}`} type="button" onClick={() => onReveal(segment.id)}>
            <NarratorBadge narrator={selectedNarrator} tone={tone} />
            <span>Toucher pour révéler ce que {selectedNarrator.displayName} raconte.</span>
          </button>
        ) : (
          <div className="narratia-revealed-text">
            <NarratorBadge narrator={selectedNarrator} tone={tone} />
            <p>{segment.text}</p>
          </div>
        )}
      </article>
    </li>
  )
}

function EndingGate({ isReady, onContinue }) {
  return (
    <li className={`narratia-path-item narratia-path-item--ending${isReady ? ' is-ready' : ''}`}>
      <span className="narratia-path-dot narratia-path-dot--ending" aria-hidden="true" />
      <article className="narratia-reveal-card narratia-ending-gate">
        <small>Dernier espace</small>
        <strong>Le choix de la fin attend ici.</strong>
        <p>Quand tous les passages sont révélés, l’enfant choisit une fin parmi trois chemins possibles.</p>
        <button className="primary-action" type="button" onClick={onContinue} disabled={!isReady}>Choisir la fin</button>
      </article>
    </li>
  )
}

export function NarrationView({ storyPackage, currentSegmentIndex, revealedSegmentIds, segmentNarratorChoices, onChooseNarrator, onRevealSegment, onChooseEnding, onBackToTimeline }) {
  const revealedSet = new Set(revealedSegmentIds)
  const allRevealed = storyPackage.segments.every((segment) => revealedSet.has(segment.id))
  const activeIndex = storyPackage.segments.findIndex((segment) => !revealedSet.has(segment.id))
  const currentIndex = activeIndex === -1 ? storyPackage.segments.length : activeIndex

  return (
    <NarratiaLayout
      eyebrow="Fil lumineux"
      title="Les moments promis se relient"
      intro="Lis un moment, choisis quel enfant raconte l’espace suivant, puis révèle le texte en touchant la carte."
      footer={<button className="ghost-action" type="button" onClick={onBackToTimeline}>Revoir seulement les moments promis</button>}
    >
      <ol className="narratia-story-path" style={{ '--path-progress': `${Math.min(100, ((currentIndex + 1) / (storyPackage.segments.length + 1)) * 100)}%` }}>
        {storyPackage.milestones.map((milestone, index) => {
          const segment = storyPackage.segments[index]
          return (
            <Fragment key={milestone.id}>
              <MilestoneBlock milestone={milestone} index={index} isLast={index === storyPackage.milestones.length - 1} />
              {segment ? (
                <SegmentBlock
                  segment={segment}
                  index={index}
                  narrators={storyPackage.narrators}
                  selectedNarratorId={segmentNarratorChoices[segment.id]}
                  isRevealed={revealedSet.has(segment.id)}
                  isCurrent={index === currentSegmentIndex}
                  isLocked={index > currentSegmentIndex}
                  onChooseNarrator={onChooseNarrator}
                  onReveal={onRevealSegment}
                />
              ) : null}
            </Fragment>
          )
        })}
        <EndingGate isReady={allRevealed} onContinue={onChooseEnding} />
      </ol>
    </NarratiaLayout>
  )
}
