import { ChoiceCard } from '../components/ChoiceCard'
import { NarratiaLayout } from '../components/NarratiaLayout'

const PLACE_FEELINGS = [
  ['cozy', 'Cozy and warm'],
  ['sparkly', 'Sparkly and strange'],
  ['wide', 'Wide and adventurous'],
  ['quiet', 'Quiet and secret']
]

const ENDING_FEELINGS = [
  ['happy', 'Happy'],
  ['mysterious', 'Mysterious'],
  ['funny', 'Funny'],
  ['surprising', 'Surprising']
]

export function ChildWizard({ choices, selection, onChange, onSubmit, isLoading }) {
  function toggleChoice(choiceId) {
    const current = selection.choiceIds || []
    const next = current.includes(choiceId) ? current.filter((id) => id !== choiceId) : [...current, choiceId].slice(0, 5)
    onChange({ ...selection, choiceIds: next })
  }

  function setValue(key, value) {
    onChange({ ...selection, [key]: value })
  }

  return (
    <NarratiaLayout
      eyebrow="Child choices"
      title="Pick what should sparkle in the story"
      intro="Choose a few favorite ingredients. They will help shape the adventure before the promised moments appear."
      footer={<button className="primary-action" type="button" onClick={onSubmit} disabled={isLoading || selection.choiceIds.length < 2}>{isLoading ? 'Opening the story...' : 'Open the story'}</button>}
    >
      <div className="narratia-fieldset">
        <strong>What should appear in the story?</strong>
        <div className="narratia-card-grid narratia-card-grid--choices">
          {choices.map((choice) => (
            <ChoiceCard key={choice.id} title={choice.label} description={choice.category} active={selection.choiceIds.includes(choice.id)} onClick={() => toggleChoice(choice.id)} />
          ))}
        </div>
      </div>
      <div className="narratia-fieldset">
        <strong>Where should the adventure feel like it is happening?</strong>
        <div className="narratia-chip-grid narratia-chip-grid--large">
          {PLACE_FEELINGS.map(([id, label]) => <button className={selection.placeFeeling === id ? 'is-active' : ''} type="button" key={id} onClick={() => setValue('placeFeeling', id)}>{label}</button>)}
        </div>
      </div>
      <div className="narratia-fieldset">
        <strong>How should the story feel at the end?</strong>
        <div className="narratia-chip-grid narratia-chip-grid--large">
          {ENDING_FEELINGS.map(([id, label]) => <button className={selection.endingFeeling === id ? 'is-active' : ''} type="button" key={id} onClick={() => setValue('endingFeeling', id)}>{label}</button>)}
        </div>
      </div>
    </NarratiaLayout>
  )
}
