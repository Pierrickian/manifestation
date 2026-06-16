import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getEnigmiaRiddle } from '../services/aiClient'

const ANSWER_OPTIONS = ['A', 'B', 'C']

function normalizeRiddle(payload) {
  const riddle = payload?.riddle || payload
  if (!riddle?.theme || !riddle?.object || !riddle?.puzzle || !riddle?.solution) {
    throw new Error('L’énigme reçue est incomplète.')
  }

  const containers = Array.isArray(riddle.containers) ? riddle.containers : []
  const statements = Array.isArray(riddle.statements) ? riddle.statements : []
  const choices = Array.isArray(riddle.choices) ? riddle.choices : []

  if (containers.length !== 3 || statements.length !== 3 || choices.length !== 3) {
    throw new Error('L’énigme doit contenir exactement trois contenants, trois inscriptions et trois choix.')
  }

  return {
    ...riddle,
    containers,
    statements,
    choices,
    solution: String(riddle.solution).toUpperCase()
  }
}

export function EnigmiaApp({ onAiDebug }) {
  const [riddle, setRiddle] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [status, setStatus] = useState({ loading: true, error: '' })

  async function loadRiddle() {
    setStatus({ loading: true, error: '' })
    setSelectedAnswer(null)

    try {
      const payload = await getEnigmiaRiddle()
      onAiDebug?.({
        ...(payload.debug || {}),
        source: payload.source || payload.debug?.source || 'ai',
        kind: 'enigmia_riddle'
      })
      setRiddle(normalizeRiddle(payload))
      setStatus({ loading: false, error: '' })
    } catch (error) {
      onAiDebug?.({
        ...(error?.debug || error?.payload?.debug || {}),
        source: error?.debug?.source || error?.payload?.debug?.source || 'ai',
        kind: 'enigmia_riddle',
        status: error?.status || 'unknown'
      })
      setStatus({ loading: false, error: error?.userMessage || 'Impossible de générer une énigme. Réessaie dans quelques instants.' })
    }
  }

  useEffect(() => {
    loadRiddle()
  }, [])

  const isAnswered = Boolean(selectedAnswer)
  const isCorrect = selectedAnswer === riddle?.solution
  const solutionChoice = riddle?.choices.find((choice) => choice.id === riddle.solution)

  if (status.loading && !riddle) {
    return (
      <section className="wizard-card enigmia-card enigmia-loading" aria-live="polite">
        <p className="eyebrow">Enigmia</p>
        <h2>La logique cache un objet…</h2>
        <p>Une nouvelle énigme se construit avec trois contenants et une seule inscription vraie.</p>
      </section>
    )
  }

  if (status.error && !riddle) {
    return (
      <section className="wizard-card enigmia-card">
        <p className="eyebrow">Enigmia</p>
        <h2>Le mystère résiste.</h2>
        <p className="enigmia-error">{status.error}</p>
        <button type="button" className="primary-action" onClick={loadRiddle}>Relancer l’IA</button>
      </section>
    )
  }

  return (
    <section className="wizard-card enigmia-card">
      <div className="enigmia-header">
        <p className="eyebrow">Enigmia · {riddle.theme}</p>
        <h2>Où se trouve {riddle.object} ?</h2>
        <p>{riddle.puzzle}</p>
      </div>

      <div className="enigmia-statements" aria-label="Inscriptions sur les contenants">
        {riddle.statements.map((statement) => (
          <article key={statement.containerId}>
            <strong>{statement.containerName}</strong>
            <span>{statement.text}</span>
          </article>
        ))}
      </div>

      <div className="enigmia-choices" aria-label="Choix de réponse">
        {ANSWER_OPTIONS.map((optionId) => {
          const choice = riddle.choices.find((item) => item.id === optionId)
          const state = !isAnswered ? '' : optionId === riddle.solution ? ' correct' : optionId === selectedAnswer ? ' wrong' : ' muted'
          return (
            <motion.button
              type="button"
              key={optionId}
              className={`enigmia-choice${state}`}
              onClick={() => setSelectedAnswer(optionId)}
              disabled={isAnswered || status.loading}
              whileTap={{ scale: 0.98 }}
            >
              <span>{optionId}</span>
              {choice?.containerName || optionId}
            </motion.button>
          )
        })}
      </div>

      {isAnswered ? (
        <div className={`enigmia-feedback${isCorrect ? ' correct' : ' wrong'}`} role="status">
          <strong>{isCorrect ? 'Bravo, tu as trouvé !' : 'Ce n’était pas le bon contenant.'}</strong>
          <span>La bonne réponse est {riddle.solution} : {solutionChoice?.containerName || riddle.solution}.</span>
          <button type="button" className="primary-action" onClick={loadRiddle} disabled={status.loading}>{status.loading ? 'Nouvelle énigme…' : 'Énigme suivante'}</button>
        </div>
      ) : null}
    </section>
  )
}
