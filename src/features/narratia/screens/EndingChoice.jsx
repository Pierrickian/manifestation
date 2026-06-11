import { ChoiceCard } from '../components/ChoiceCard'
import { NarratiaLayout } from '../components/NarratiaLayout'

export function EndingChoice({ endings, onChoose, onBackToStory }) {
  return (
    <NarratiaLayout
      eyebrow="Choix final"
      title="Quelle fin doit s’ouvrir ?"
      intro="On voit seulement le titre et la couleur du sentiment. Choisis une fin, puis le texte complet apparaîtra."
      footer={onBackToStory ? <button className="ghost-action" type="button" onClick={onBackToStory}>Revoir le fil de l’histoire</button> : null}
    >
      <div className="narratia-card-grid narratia-card-grid--endings">
        {endings.map((ending) => (
          <ChoiceCard key={ending.id} title={ending.title} description={ending.emotion} onClick={() => onChoose(ending.id)} />
        ))}
      </div>
    </NarratiaLayout>
  )
}
