import { motion } from 'framer-motion'
import { NeedBadge } from './NeedBadge'

function formatList(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`
}

export function DiscoveryCard({ steps, discovery, discoveryText, links, onContinue, onBack, onRestart }) {
  const { dominantNeed, linkedNeeds } = discovery

  if (!dominantNeed) return null

  return (
    <motion.section
      key="discovery"
      className="discovery-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24 }}
      aria-labelledby="discovery-title"
    >
      <p className="eyebrow">Découverte</p>
      <h2 id="discovery-title">Ce chemin peut pointer vers {dominantNeed.needLabel.toLowerCase()}.</h2>

      <div className="discovery-highlight" style={{ '--need-color': dominantNeed.uiColor }}>
        <NeedBadge need={dominantNeed} />
        <p>{discoveryText || dominantNeed.guidance}</p>
      </div>

      <div className="path-flow" aria-label="Chemin exploré">
        {steps.map((step, index) => (
          <div className="path-flow-node" key={`${step.id}-${index}`}>
            <span>{step.kicker}</span>
            {step.question ? <em>{step.question}</em> : null}
            <strong>{step.label}</strong>
          </div>
        ))}
      </div>

      <p>
        Tu sembles peut-être chercher {formatList(dominantNeed.needs.slice(0, 3))}.{' '}
        {linkedNeeds.length > 0
          ? `Des besoins liés apparaissent aussi autour de ${formatList(linkedNeeds.map((need) => need.needLabel.toLowerCase()))}.`
          : 'Pour l’instant, le chemin reste concentré autour d’un seul besoin.'}
      </p>

      <p className="soft-note">
        Ce n’est pas une vérité absolue. C’est une piste sensible : créer, ici, c’est découvrir ce que tu crées en toi.
      </p>
      <div className="end-actions">
        <button type="button" className="primary-action" onClick={onContinue}>Continue</button>
        <button type="button" className="ghost-action" onClick={onBack}>Retour</button>
        <button type="button" className="ghost-action" onClick={onRestart}>Un autre</button>
      </div>
    </motion.section>
  )
}
