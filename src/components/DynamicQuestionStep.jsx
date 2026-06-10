import { motion } from 'framer-motion'
import { NeedBadge } from './NeedBadge'

export function DynamicQuestionStep({
  prompt,
  activeNeed,
  currentIndex,
  total,
  isLoading,
  onChoose,
  onBack
}) {
  const answers = prompt?.answers || []
  const showAiIcon = prompt?.source === 'ai'

  return (
    <motion.section
      key={prompt?.id || 'dynamic-question'}
      className="wizard-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      aria-labelledby="question-title"
    >
      <div className="step-heading">
        <div>
          <p className="eyebrow">Passage {currentIndex + 1} / {total}</p>
          <h2 id="question-title">{isLoading ? 'Le prochain passage se dessine...' : prompt?.question}</h2>
        </div>
        <NeedBadge need={activeNeed} subtle />
      </div>

      {isLoading ? (
        <div className="breathing-loader" aria-label="Chargement de la question" />
      ) : (
        <div className="wizard-options">
          {answers.map((answer) => (
            <button type="button" className="wizard-option" key={answer.id} onClick={() => onChoose(answer)}>
              <span className="wizard-option-label">{answer.label}</span>
              {showAiIcon ? (
                <span className="ai-choice-icon" aria-label="Propose par IA" title="Propose par IA">
                  AI
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      <button type="button" className="ghost-action" onClick={onBack}>
        Revenir au départ
      </button>
    </motion.section>
  )
}
