import { motion } from 'framer-motion'
import { NeedBadge } from './NeedBadge'

function formatList(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`
}

export function DiscoveryCard({ steps, discovery, onRestart }) {
  const { dominantNeed, linkedNeeds } = discovery

  if (!dominantNeed) return null

  const linkedLabels = linkedNeeds.map((need) => need.needLabel.toLowerCase())
  const questionStep = steps.find((step) => step.type === 'adaptive-answer')
  const lastReflection = [...steps].reverse().find((step) => step.type === 'reflection')

  return (
    <motion.section
      key="discovery"
      className="discovery-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.24 }}
      aria-labelledby="discovery-title"
    >
      <p className="eyebrow">Découverte</p>
      <h2 id="discovery-title">Ce chemin pointe peut-être vers {dominantNeed.needLabel.toLowerCase()}.</h2>

      <div className="discovery-highlight" style={{ '--need-color': dominantNeed.uiColor }}>
        <NeedBadge need={dominantNeed} />
        <p>{dominantNeed.guidance}</p>
      </div>

      <p>
        Tu sembles peut-être chercher {formatList(dominantNeed.needs)}.{' '}
        {linkedLabels.length > 0
          ? `Des besoins liés apparaissent aussi autour de ${formatList(linkedLabels)}.`
          : 'Pour l’instant, le chemin reste très concentré autour d’un seul besoin.'}
      </p>

      <div className="path-recap" aria-label="Récapitulatif du chemin">
        <span>Ressenti</span>
        <strong>{steps[0]?.label}</strong>
        <span>Besoin dominant</span>
        <strong>{dominantNeed.needLabel}</strong>
        <span>Besoin lié</span>
        <strong>{linkedNeeds[0]?.needLabel || 'À découvrir'}</strong>
        <span>Question</span>
        <strong>{questionStep?.question || '—'}</strong>
        <span>Découverte</span>
        <strong>{lastReflection?.label || questionStep?.label}</strong>
      </div>

      <p className="soft-note">
        Ce n’est pas une vérité absolue. C’est une piste sensible : créer, ici, c’est découvrir ce que tu crées en toi.
      </p>
      <button type="button" className="primary-action" onClick={onRestart}>Explorer un autre chemin</button>
    </motion.section>
  )
}
