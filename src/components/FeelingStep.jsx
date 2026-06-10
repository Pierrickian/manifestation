import { motion } from 'framer-motion'
import { STARTING_FEELINGS } from '../data/staticQuestions'

export function FeelingStep({ onChoose }) {
  return (
    <motion.section
      key="feelings"
      className="wizard-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      aria-labelledby="feeling-title"
    >
      <p className="eyebrow">Départ</p>
      <h2 id="feeling-title">Choisis le ressenti qui ressemble le plus au point de départ.</h2>
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
