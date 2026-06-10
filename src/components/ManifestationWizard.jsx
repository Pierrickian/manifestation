import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { STARTING_FEELINGS, REFLECTION_QUESTIONS } from '../data/questions'
import { NEED_BY_ID } from '../data/needs'
import { DiscoveryCard } from './DiscoveryCard'
import { NeedMap } from './NeedMap'

function mergeNeedIds(...groups) {
  return [...new Set(groups.flat().filter(Boolean))]
}

function StepButton({ children, onClick }) {
  return (
    <button type="button" className="wizard-option" onClick={onClick}>
      {children}
    </button>
  )
}

export function ManifestationWizard() {
  const [selectedFeeling, setSelectedFeeling] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [reflectionIndex, setReflectionIndex] = useState(0)

  const path = useMemo(() => {
    const steps = []
    if (selectedFeeling) steps.push(selectedFeeling)
    if (selectedAnswer) steps.push(selectedAnswer)
    return steps
  }, [selectedAnswer, selectedFeeling])

  const activeNeed = selectedFeeling ? NEED_BY_ID[selectedFeeling.needIds[0]] : null
  const isComplete = Boolean(selectedFeeling && selectedAnswer && reflectionIndex >= REFLECTION_QUESTIONS.length)

  function restart() {
    setSelectedFeeling(null)
    setSelectedAnswer(null)
    setReflectionIndex(0)
  }

  function chooseFeeling(feeling) {
    setSelectedFeeling(feeling)
    setSelectedAnswer(null)
    setReflectionIndex(0)
  }

  function chooseAnswer(answer) {
    setSelectedAnswer({
      ...answer,
      id: `${selectedFeeling.id}-${answer.label}`,
      needIds: mergeNeedIds(answer.needIds, selectedFeeling.needIds)
    })
  }

  return (
    <main className="manifestation-shell">
      <section className="wizard-hero">
        <p className="eyebrow">Manifestation</p>
        <h1>Explore ce que tu veux faire émerger.</h1>
        <p>
          Pars d’un ressenti simple. L’app relie peu à peu état, besoin, couleur et découverte.
        </p>
      </section>

      <NeedMap path={path} />

      <AnimatePresence mode="wait">
        {!selectedFeeling ? (
          <motion.section
            key="feelings"
            className="wizard-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="eyebrow">Départ</p>
            <h2>Comment ça se manifeste maintenant ?</h2>
            <div className="wizard-options">
              {STARTING_FEELINGS.map((feeling) => (
                <StepButton key={feeling.id} onClick={() => chooseFeeling(feeling)}>
                  {feeling.label}
                </StepButton>
              ))}
            </div>
          </motion.section>
        ) : !selectedAnswer ? (
          <motion.section
            key="answers"
            className="wizard-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="eyebrow">{activeNeed?.color} · {activeNeed?.label}</p>
            <h2>{selectedFeeling.prompt}</h2>
            <div className="wizard-options">
              {selectedFeeling.answers.map((answer) => (
                <StepButton key={answer.label} onClick={() => chooseAnswer(answer)}>
                  {answer.label}
                </StepButton>
              ))}
            </div>
            <button type="button" className="ghost-action" onClick={restart}>Revenir au départ</button>
          </motion.section>
        ) : !isComplete ? (
          <motion.section
            key="reflection"
            className="wizard-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="eyebrow">Question {reflectionIndex + 1}</p>
            <h2>{REFLECTION_QUESTIONS[reflectionIndex]}</h2>
            <p className="soft-note">Garde la réponse en toi, puis continue quand quelque chose s’éclaire.</p>
            <button type="button" className="primary-action" onClick={() => setReflectionIndex((value) => value + 1)}>
              Continuer
            </button>
          </motion.section>
        ) : (
          <DiscoveryCard key="discovery" path={path} onRestart={restart} />
        )}
      </AnimatePresence>
    </main>
  )
}
