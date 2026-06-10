import { motion } from 'framer-motion'
import { NEED_BY_ID } from '../data/needs'

function collectNeeds(path) {
  const scores = new Map()
  path.forEach((step) => {
    step.needIds.forEach((needId) => {
      scores.set(needId, (scores.get(needId) || 0) + 1)
    })
  })
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([needId]) => NEED_BY_ID[needId])
    .filter(Boolean)
}

export function DiscoveryCard({ path, onRestart }) {
  const needs = collectNeeds(path)
  const dominantNeed = needs[0]
  const linkedNeeds = needs.slice(1, 3)

  if (!dominantNeed) return null

  return (
    <motion.section
      className="discovery-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <p className="eyebrow">Découverte</p>
      <h2>Tu sembles chercher surtout {dominantNeed.label.toLowerCase()}.</h2>
      <p>
        Besoin dominant : {dominantNeed.needs.join(', ')}.
        {linkedNeeds.length > 0 ? ` Besoins liés : ${linkedNeeds.map((need) => need.label.toLowerCase()).join(', ')}.` : ''}
      </p>
      <p className="soft-note">
        Ce n’est pas une vérité figée. C’est un chemin possible à explorer à partir de ce que tu viens de choisir.
      </p>
      <button type="button" className="primary-action" onClick={onRestart}>Explorer un autre chemin</button>
    </motion.section>
  )
}
