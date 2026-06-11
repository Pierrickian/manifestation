import { ChoiceCard } from '../components/ChoiceCard'
import { NarratiaLayout } from '../components/NarratiaLayout'

const AGE_RANGES = [
  ['2-3', '2-3 ans', 'Des images très simples, répétitives et très sécurisantes.'],
  ['4-5', '4-5 ans', 'Une aventure courte, concrète et facile à suivre.'],
  ['6-8', '6-8 ans', 'Un conte plus imagé avec des choix et des émotions nuancées.'],
  ['9-12', '9-12 ans', 'Une histoire plus ample, symbolique et maligne.']
]

const DURATIONS = [
  ['short', 'Courte', 'Une petite aventure pour le soir.'],
  ['medium', 'Moyenne', 'Une histoire plus ample avec le temps de rêver.'],
  ['long', 'Longue', 'Un rituel plus lent pour un moment sans hâte.']
]

const TONES = [
  ['funny', 'Drôle'],
  ['mysterious', 'Mystérieux'],
  ['reassuring', 'Rassurant'],
  ['adventurous', 'Aventureux'],
  ['poetic', 'Poétique'],
  ['calm', 'Calme']
]
const THEMES = [
  ['courage', 'Courage'],
  ['friendship', 'Amitié'],
  ['fear', 'Peur'],
  ['discovery', 'Découverte'],
  ['forgiveness', 'Pardon'],
  ['growing_up', 'Grandir'],
  ['secrets', 'Secrets'],
  ['helping_others', 'Aider les autres'],
  ['imagination', 'Imagination'],
  ['nature', 'Nature']
]
const INTENSITIES = [
  ['very_soft', 'Très douce', 'Une merveille calme et très rassurante.'],
  ['balanced', 'Équilibrée', 'Un peu de mystère avec une sécurité claire.'],
  ['intense_imagination', 'Imagination intense', 'Des images plus vives, sans peur dangereuse.']
]
const ENDINGS = [
  ['happy', 'Heureuse'],
  ['surprising', 'Surprenante'],
  ['emotional', 'Émouvante'],
  ['open_mystery', 'Mystère ouvert'],
  ['funny', 'Drôle']
]
const MODES = [
  ['parent_reads', 'L’adulte lit tout', 'Une voix stable porte toute l’histoire.'],
  ['mixed_narration', 'Narration partagée', 'Adulte, enfant et compagnons se relaient.'],
  ['ai_children_narrate', 'Les enfants virtuels racontent', 'Mira et Noé portent davantage le milieu.']
]

function ToggleGroup({ title, values, selected, onToggle }) {
  return (
    <div className="narratia-fieldset">
      <strong>{title}</strong>
      <div className="narratia-chip-grid">
        {values.map(([value, label]) => (
          <button className={selected.includes(value) ? 'is-active' : ''} type="button" key={value} onClick={() => onToggle(value)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ParentWizard({ configuration, onChange, onSubmit, isLoading }) {
  function setSingle(key, value) {
    onChange({ ...configuration, [key]: value })
  }

  function toggleList(key, value) {
    const current = configuration[key] || []
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    onChange({ ...configuration, [key]: next.length ? next : current })
  }

  return (
    <NarratiaLayout
      eyebrow="Réglage adulte"
      title="Choisir la météo de l’histoire"
      intro="Ces choix restent du côté adulte. L’enfant verra seulement des ingrédients de conte, simples et joueurs."
      footer={<button className="primary-action" type="button" onClick={onSubmit} disabled={isLoading}>{isLoading ? 'Préparation des choix...' : 'Inviter l’enfant'}</button>}
    >
      <div className="narratia-fieldset">
        <strong>Âge de l’enfant</strong>
        <div className="narratia-card-grid">
          {AGE_RANGES.map(([id, title, description]) => <ChoiceCard key={id} title={title} description={description} active={(configuration.ageRange || '6-8') === id} onClick={() => setSingle('ageRange', id)} />)}
        </div>
      </div>
      <div className="narratia-fieldset">
        <strong>Durée de l’histoire</strong>
        <div className="narratia-card-grid">
          {DURATIONS.map(([id, title, description]) => <ChoiceCard key={id} title={title} description={description} active={configuration.duration === id} onClick={() => setSingle('duration', id)} />)}
        </div>
      </div>
      <ToggleGroup title="Ton émotionnel" values={TONES} selected={configuration.emotionalTones} onToggle={(value) => toggleList('emotionalTones', value)} />
      <ToggleGroup title="Thèmes" values={THEMES} selected={configuration.themes} onToggle={(value) => toggleList('themes', value)} />
      <div className="narratia-fieldset">
        <strong>Intensité</strong>
        <div className="narratia-card-grid">
          {INTENSITIES.map(([id, title, description]) => <ChoiceCard key={id} title={title} description={description} active={configuration.intensity === id} onClick={() => setSingle('intensity', id)} />)}
        </div>
      </div>
      <ToggleGroup title="Styles de fin autorisés" values={ENDINGS} selected={configuration.allowedEndingStyles} onToggle={(value) => toggleList('allowedEndingStyles', value)} />
      <div className="narratia-fieldset">
        <strong>Mode de lecture</strong>
        <div className="narratia-card-grid">
          {MODES.map(([id, title, description]) => <ChoiceCard key={id} title={title} description={description} active={configuration.readingMode === id} onClick={() => setSingle('readingMode', id)} />)}
        </div>
      </div>
    </NarratiaLayout>
  )
}
