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

function LoadingLine({ label = 'La carte lumineuse s’ouvre...' }) {
  return (
    <div className="narratia-loading-line" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  )
}

function SegmentBlock({ segment, narrators, selectedNarratorId, isRevealed, isCurrent, isLocked, isLoading, onChooseNarrator }) {
  const possibleNarrators = narrators.filter((narrator) => VIRTUAL_CHILD_IDS.includes(narrator.id))
  const selectedNarrator = narrators.find((narrator) => narrator.id === selectedNarratorId) || narrators.find((narrator) => narrator.id === segment.narrator)
  const tone = getNarratorTone(selectedNarrator?.id)

  return (
    <li className={`narratia-path-item narratia-path-item--segment is-${tone}${isCurrent ? ' is-current' : ''}${isRevealed ? ' is-revealed' : ''}${isLoading ? ' is-loading' : ''}`}>
      <span className={`narratia-path-dot narratia-path-dot--${tone}`} aria-hidden="true" />
      <article className="narratia-reveal-card">
        <small>Entre le moment {segment.from} et le moment {segment.to}</small>
        {isLocked ? (
          <div className="narratia-next-choice narratia-next-choice--locked">
            <strong>Ce passage attend son tour.</strong>
            <p>Révèle d’abord la carte lumineuse précédente.</p>
          </div>
        ) : isLoading ? (
          <LoadingLine label="Le passage se prépare..." />
        ) : !selectedNarratorId ? (
          <div className="narratia-next-choice">
            <strong>Qui raconte ce passage ?</strong>
            <p>Choisis Mira ou Noé. Le texte apparaîtra juste après un court scintillement.</p>
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

function EndingGate({ endings, selectedEndingId, loadingEndingId, isReady, onChooseEnding, onNewStory }) {
  const selectedEnding = endings.find((ending) => ending.id === selectedEndingId)

  return (
    <li className={`narratia-path-item narratia-path-item--ending${isReady ? ' is-ready' : ''}${selectedEnding ? ' is-revealed' : ''}`}>
      <span className="narratia-path-dot narratia-path-dot--ending" aria-hidden="true" />
      <article className="narratia-reveal-card narratia-ending-gate">
        <small>Dernier espace</small>
        <strong>Quelle fin doit s’ouvrir ?</strong>
        <p>Les trois fins restent dans la même histoire. Choisis un titre pour révéler son texte ici.</p>
        <div className="narratia-ending-button-grid">
          {endings.map((ending) => (
            <button
              className={`narratia-ending-choice-button${selectedEndingId === ending.id ? ' is-active' : ''}`}
              type="button"
              key={ending.id}
              onClick={() => onChooseEnding(ending.id)}
              disabled={!isReady || Boolean(loadingEndingId)}
            >
              <strong>{ending.title}</strong>
              <small>{ending.emotion}</small>
            </button>
          ))}
        </div>
        {loadingEndingId ? <LoadingLine label="La fin s’illumine..." /> : null}
        {selectedEnding ? (
          <div className="narratia-ending-text">
            <strong>{selectedEnding.title}</strong>
            <p>{selectedEnding.text}</p>
            <button className="ghost-action" type="button" onClick={onNewStory}>Créer une nouvelle histoire</button>
          </div>
        ) : null}
      </article>
    </li>
  )
}

export function NarrationView({ storyPackage, currentSegmentIndex, revealedSegmentIds, segmentNarratorChoices, loadingSegmentId, selectedEndingId, loadingEndingId, onChooseNarrator, onChooseEnding, onBackToTimeline, onHome, onNewStory }) {
  const revealedSet = new Set(revealedSegmentIds)
  storyPackage.segments.forEach((segment) => {
    if (segmentNarratorChoices[segment.id] && loadingSegmentId !== segment.id) revealedSet.add(segment.id)
  })
  const allRevealed = storyPackage.segments.every((segment) => revealedSet.has(segment.id))
  const activeIndex = storyPackage.segments.findIndex((segment) => !revealedSet.has(segment.id))
  const currentIndex = activeIndex === -1 ? storyPackage.segments.length : activeIndex
  const endingProgress = selectedEndingId ? 1 : 0

  return (
    <NarratiaLayout
      eyebrow="Fil lumineux"
      title="Les moments promis se relient"
      intro="Lis un moment, choisis quel enfant raconte l’espace suivant, puis continue jusqu’à la fin sans quitter cette page."
      footer={(
        <div className="flow-actions">
          <button className="ghost-action" type="button" onClick={onBackToTimeline}>Revoir seulement les moments promis</button>
          <button className="ghost-action" type="button" onClick={onHome}>Accueil Narratia</button>
          <button className="ghost-action" type="button" onClick={onNewStory}>Nouvelle histoire</button>
        </div>
      )}
    >
      <ol className="narratia-story-path" style={{ '--path-progress': `${Math.min(100, ((currentIndex + 1 + endingProgress) / (storyPackage.segments.length + 2)) * 100)}%` }}>
        {storyPackage.milestones.map((milestone, index) => {
          const segment = storyPackage.segments[index]
          return (
            <Fragment key={milestone.id}>
              <MilestoneBlock milestone={milestone} index={index} isLast={index === storyPackage.milestones.length - 1} />
              {segment ? (
                <SegmentBlock
                  segment={segment}
                  narrators={storyPackage.narrators}
                  selectedNarratorId={segmentNarratorChoices[segment.id]}
                  isRevealed={revealedSet.has(segment.id)}
                  isCurrent={index === currentSegmentIndex}
                  isLocked={index > currentSegmentIndex}
                  isLoading={loadingSegmentId === segment.id}
                  onChooseNarrator={onChooseNarrator}
                />
              ) : null}
            </Fragment>
          )
        })}
        <EndingGate
          endings={storyPackage.endings}
          selectedEndingId={selectedEndingId}
          loadingEndingId={loadingEndingId}
          isReady={allRevealed}
          onChooseEnding={onChooseEnding}
          onNewStory={onNewStory}
        />
      </ol>
    </NarratiaLayout>
  )
}
