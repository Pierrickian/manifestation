import { ChoiceCard } from '../components/ChoiceCard'
import { NarratiaLayout } from '../components/NarratiaLayout'

export function EndingChoice({ endings, onChoose }) {
  return (
    <NarratiaLayout
      eyebrow="Final choice"
      title="Which ending should open?"
      intro="Only the title and feeling are visible for now. Pick one, then the full ending will be revealed."
    >
      <div className="narratia-card-grid narratia-card-grid--endings">
        {endings.map((ending) => (
          <ChoiceCard key={ending.id} title={ending.title} description={ending.emotion} onClick={() => onChoose(ending.id)} />
        ))}
      </div>
    </NarratiaLayout>
  )
}
