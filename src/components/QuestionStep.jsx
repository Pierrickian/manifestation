import { motion } from 'framer-motion'
import { ADAPTIVE_ANSWERS } from '../data/questions'
import { NeedBadge } from './NeedBadge'

export function QuestionStep({ feeling, activeNeed, onChoose, onBack }) {
  const answers = ADAPTIVE_ANSWERS[feeling.id] || []

  return (
    <motion.section
      key="adaptive-question"
      className="wizard-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
      aria-labelledby="question-title"
    >
      <div className="step-heading">
        <p className="eyebrow">Question adaptative</p>
        <NeedBadge need={activeNeed} subtle />
      </div>
      <h2 id="question-title">{feeling.adaptiveQuestion}</h2>
      <div className="wizard-options">
        {answers.map((answer) => (
          <button type="button" className="wizard-option" key={answer.id} onClick={() => onChoose(answer)}>
            {answer.label}
          </button>
        ))}
      </div>
      <button type="button" className="ghost-action" onClick={onBack}>Revenir au départ</button>
    </motion.section>
  )
}
