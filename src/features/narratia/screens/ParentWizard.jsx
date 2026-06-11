import { ChoiceCard } from '../components/ChoiceCard'
import { NarratiaLayout } from '../components/NarratiaLayout'

const DURATIONS = [
  ['short', 'Short', 'A small bedtime-sized journey.'],
  ['medium', 'Medium', 'A fuller story with room to wander.'],
  ['long', 'Long', 'A slower ritual for an unhurried moment.']
]

const TONES = ['funny', 'mysterious', 'reassuring', 'adventurous', 'poetic', 'calm']
const THEMES = ['courage', 'friendship', 'fear', 'discovery', 'forgiveness', 'growing_up', 'secrets', 'helping_others', 'imagination', 'nature']
const INTENSITIES = [
  ['very_soft', 'Very soft', 'Gentle wonder with strong reassurance.'],
  ['balanced', 'Balanced', 'A little mystery with steady safety.'],
  ['intense_imagination', 'Intense imagination', 'More vivid images without unsafe fear.']
]
const ENDINGS = ['happy', 'surprising', 'emotional', 'open_mystery', 'funny']
const MODES = [
  ['parent_reads', 'Parent reads everything', 'One steady voice carries the story.'],
  ['mixed_narration', 'Mixed narration', 'Parent, child, and companions share turns.'],
  ['ai_children_narrate', 'AI children narrate parts', 'Mira and Noe carry more of the middle.']
]

function labelize(value) {
  return value.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase())
}

function ToggleGroup({ title, values, selected, onToggle }) {
  return (
    <div className="narratia-fieldset">
      <strong>{title}</strong>
      <div className="narratia-chip-grid">
        {values.map((value) => (
          <button className={selected.includes(value) ? 'is-active' : ''} type="button" key={value} onClick={() => onToggle(value)}>
            {labelize(value)}
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
      eyebrow="Grown-up setup"
      title="Choose the story weather"
      intro="These settings stay with the grown-up. The child will only see playful story ingredients."
      footer={<button className="primary-action" type="button" onClick={onSubmit} disabled={isLoading}>{isLoading ? 'Preparing choices...' : 'Invite the child'}</button>}
    >
      <div className="narratia-fieldset">
        <strong>Story duration</strong>
        <div className="narratia-card-grid">
          {DURATIONS.map(([id, title, description]) => <ChoiceCard key={id} title={title} description={description} active={configuration.duration === id} onClick={() => setSingle('duration', id)} />)}
        </div>
      </div>
      <ToggleGroup title="Emotional tone" values={TONES} selected={configuration.emotionalTones} onToggle={(value) => toggleList('emotionalTones', value)} />
      <ToggleGroup title="Themes" values={THEMES} selected={configuration.themes} onToggle={(value) => toggleList('themes', value)} />
      <div className="narratia-fieldset">
        <strong>Intensity</strong>
        <div className="narratia-card-grid">
          {INTENSITIES.map(([id, title, description]) => <ChoiceCard key={id} title={title} description={description} active={configuration.intensity === id} onClick={() => setSingle('intensity', id)} />)}
        </div>
      </div>
      <ToggleGroup title="Ending styles allowed" values={ENDINGS} selected={configuration.allowedEndingStyles} onToggle={(value) => toggleList('allowedEndingStyles', value)} />
      <div className="narratia-fieldset">
        <strong>Reading mode</strong>
        <div className="narratia-card-grid">
          {MODES.map(([id, title, description]) => <ChoiceCard key={id} title={title} description={description} active={configuration.readingMode === id} onClick={() => setSingle('readingMode', id)} />)}
        </div>
      </div>
    </NarratiaLayout>
  )
}
