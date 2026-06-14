import { ChoiceCard } from '../components/ChoiceCard'
import { NarratiaLayout } from '../components/NarratiaLayout'

const PLACE_FEELINGS = [
  ['cozy', 'Doux et chaud'],
  ['sparkly', 'Brillant et étrange'],
  ['wide', 'Grand et aventureux'],
  ['quiet', 'Calme et secret']
]

const ENDING_FEELINGS = [
  ['happy', 'Heureuse'],
  ['mysterious', 'Mystérieuse'],
  ['funny', 'Drôle'],
  ['surprising', 'Surprenante']
]

const CATEGORY_LABELS = {
  object: 'objet',
  creature: 'créature',
  place: 'lieu',
  magic: 'magie',
  atmosphere: 'ambiance'
}

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
      eyebrow="Choix de l’enfant"
      title="Choisis ce qui doit briller dans l’histoire"
      intro="Prends quelques ingrédients préférés. Ils vont aider l’aventure à trouver sa forme."
      footer={<button className="primary-action" type="button" onClick={onSubmit} disabled={isLoading || selection.choiceIds.length < 1}>{isLoading ? 'Ouverture de l’histoire...' : 'Ouvrir l’histoire'}</button>}
    >
      <div className="narratia-fieldset">
        <strong>Qu’est-ce qui doit apparaître dans l’histoire ?</strong>
        <div className="narratia-card-grid narratia-card-grid--choices">
          {choices.map((choice) => (
            <ChoiceCard key={choice.id} title={choice.label} description={CATEGORY_LABELS[choice.category] || choice.category} active={selection.choiceIds.includes(choice.id)} onClick={() => toggleChoice(choice.id)} />
          ))}
        </div>
      </div>
      <div className="narratia-fieldset">
        <strong>Quelle ambiance pour le lieu de l’aventure ?</strong>
        <div className="narratia-chip-grid narratia-chip-grid--large">
          {PLACE_FEELINGS.map(([id, label]) => <button className={selection.placeFeeling === id ? 'is-active' : ''} type="button" key={id} onClick={() => setValue('placeFeeling', id)}>{label}</button>)}
        </div>
      </div>
      <div className="narratia-fieldset">
        <strong>Comment la fin doit-elle résonner ?</strong>
        <div className="narratia-chip-grid narratia-chip-grid--large">
          {ENDING_FEELINGS.map(([id, label]) => <button className={selection.endingFeeling === id ? 'is-active' : ''} type="button" key={id} onClick={() => setValue('endingFeeling', id)}>{label}</button>)}
        </div>
      </div>
    </NarratiaLayout>
  )
}
