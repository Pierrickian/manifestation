import { motion } from 'framer-motion'
import { STARTING_FEELINGS } from '../data/questions'

export function FeelingStep({ onChoose }) {
  return (
    <motion.section
      key="feelings"
      className="wizard-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
      aria-labelledby="feeling-title"
    >
      <p className="eyebrow">Départ</p>
      <h2 id="feeling-title">Qu’est-ce qui se manifeste en toi maintenant ?</h2>
      <div className="wizard-options feeling-grid">
        {STARTING_FEELINGS.map((feeling) => (
          <button
            type="button"
            className="wizard-option feeling-option"
            key={feeling.id}
            onClick={() => onChoose(feeling)}
          >
            <strong>{feeling.label}</strong>
            <small>{feeling.description}</small>
          </button>
        ))}
      </div>
    </motion.section>
  )
}
