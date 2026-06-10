import { motion } from 'framer-motion'

export function ReflectionStep({ question, currentIndex, total, onChoose, onBack }) {
  return (
    <motion.section
      key={`reflection-${question.id}`}
      className="wizard-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
      aria-labelledby="reflection-title"
    >
      <p className="eyebrow">Reflet {currentIndex + 1} / {total}</p>
      <h2 id="reflection-title">{question.label}</h2>
      <p className="soft-note">{question.hint}</p>
      <div className="wizard-options">
        {question.choices.map((choice) => (
          <button type="button" className="wizard-option" key={choice.id} onClick={() => onChoose(choice)}>
            {choice.label}
          </button>
        ))}
      </div>
      <button type="button" className="ghost-action" onClick={onBack}>Revenir à la question précédente</button>
    </motion.section>
  )
}
