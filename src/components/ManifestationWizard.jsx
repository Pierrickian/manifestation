import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { REFLECTION_QUESTIONS } from '../data/questions'
import { getWizardDiscovery } from '../logic/wizardScoring'
import { DiscoveryCard } from './DiscoveryCard'
import { FeelingStep } from './FeelingStep'
import { NeedMap } from './NeedMap'
import { QuestionStep } from './QuestionStep'
import { ReflectionStep } from './ReflectionStep'

export function ManifestationWizard() {
  const [feeling, setFeeling] = useState(null)
  const [adaptiveAnswer, setAdaptiveAnswer] = useState(null)
  const [reflectionAnswers, setReflectionAnswers] = useState([])

  const steps = useMemo(() => {
    const nextSteps = []

    if (feeling) {
      nextSteps.push({
        ...feeling,
        type: 'feeling',
        kicker: 'Ressenti'
      })
    }

    if (adaptiveAnswer) {
      nextSteps.push({
        ...adaptiveAnswer,
        type: 'adaptive-answer',
        kicker: 'Besoin pressenti',
        question: feeling.adaptiveQuestion
      })
    }

    reflectionAnswers.forEach((answer, index) => {
      nextSteps.push({
        ...answer,
        type: 'reflection',
        kicker: `Reflet ${index + 1}`,
        question: REFLECTION_QUESTIONS[index]?.label
      })
    })

    return nextSteps
  }, [adaptiveAnswer, feeling, reflectionAnswers])

  const discovery = useMemo(() => getWizardDiscovery(steps), [steps])
  const reflectionQuestion = REFLECTION_QUESTIONS[reflectionAnswers.length]
  const isComplete = Boolean(feeling && adaptiveAnswer && !reflectionQuestion)

  function restart() {
    setFeeling(null)
    setAdaptiveAnswer(null)
    setReflectionAnswers([])
  }

  function chooseFeeling(nextFeeling) {
    setFeeling(nextFeeling)
    setAdaptiveAnswer(null)
    setReflectionAnswers([])
  }

  function chooseAdaptiveAnswer(answer) {
    setAdaptiveAnswer(answer)
    setReflectionAnswers([])
  }

  function chooseReflectionAnswer(answer) {
    setReflectionAnswers((answers) => [...answers, answer])
  }

  function goBackFromReflection() {
    if (reflectionAnswers.length > 0) {
      setReflectionAnswers((answers) => answers.slice(0, -1))
      return
    }

    setAdaptiveAnswer(null)
  }

  return (
    <main className="manifestation-shell">
      <section className="wizard-hero">
        <p className="eyebrow">Manifestation</p>
        <h1>Qu’est-ce qui se manifeste en toi maintenant&nbsp;?</h1>
        <p>
          Une carte vivante pour partir d’un ressenti, révéler un besoin, puis relire le chemin qui t’a mené à une découverte.
        </p>
      </section>

      <NeedMap steps={steps} discovery={discovery} />

      <AnimatePresence mode="wait">
        {!feeling ? (
          <FeelingStep key="feeling-step" onChoose={chooseFeeling} />
        ) : !adaptiveAnswer ? (
          <QuestionStep
            key="question-step"
            feeling={feeling}
            activeNeed={discovery.dominantNeed}
            onChoose={chooseAdaptiveAnswer}
            onBack={restart}
          />
        ) : !isComplete ? (
          <ReflectionStep
            key={reflectionQuestion.id}
            question={reflectionQuestion}
            currentIndex={reflectionAnswers.length}
            total={REFLECTION_QUESTIONS.length}
            onChoose={chooseReflectionAnswer}
            onBack={goBackFromReflection}
          />
        ) : (
          <DiscoveryCard key="discovery-card" steps={steps} discovery={discovery} onRestart={restart} />
        )}
      </AnimatePresence>
    </main>
  )
}
