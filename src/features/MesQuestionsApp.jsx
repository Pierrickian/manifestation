import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AGE_OPTIONS, MES_QUESTIONS_SUBJECTS, QUESTION_COUNT_OPTIONS } from './mes-questions-data'
import { getMesQuestionsQuiz } from '../services/aiClient'

function normalizeQuestions(payload, expectedCount) {
  const questions = payload?.questions
  if (!Array.isArray(questions) || questions.length !== expectedCount) {
    throw new Error(`L’IA a renvoyé ${questions?.length ?? 0} question(s) au lieu de ${expectedCount}.`)
  }

  return questions.map((question, index) => {
    if (!question?.id || !question.subject || !question.question || !Array.isArray(question.answers) || question.answers.length !== 3 || !question.correctAnswerId) {
      throw new Error(`La question ${index + 1} est incomplète.`)
    }
    if (!question.answers.some((answer) => answer.id === question.correctAnswerId && answer.text)) {
      throw new Error(`La bonne réponse de la question ${index + 1} est invalide.`)
    }
    return question
  })
}

export function MesQuestionsApp() {
  const [screen, setScreen] = useState('splash')
  const [age, setAge] = useState(7)
  const [questionCount, setQuestionCount] = useState(5)
  const [subjects, setSubjects] = useState(['mathematiques'])
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState({ loading: false, error: '' })

  const currentQuestion = questions[currentIndex]
  const currentAnswerId = currentQuestion ? answers[currentQuestion.id] : null
  const isAnswered = Boolean(currentAnswerId)
  const score = useMemo(() => questions.reduce((total, question) => total + (answers[question.id] === question.correctAnswerId ? 1 : 0), 0), [answers, questions])

  function toggleSubject(subjectId) {
    setSubjects((current) => current.includes(subjectId)
      ? current.filter((id) => id !== subjectId)
      : [...current, subjectId])
  }

  async function generateQuiz() {
    if (!subjects.length) {
      setStatus({ loading: false, error: 'Choisis au moins une matière pour lancer le quiz.' })
      return
    }

    setStatus({ loading: true, error: '' })
    setQuestions([])
    setAnswers({})
    setCurrentIndex(0)

    try {
      const payload = await getMesQuestionsQuiz({ age, questionCount, subjects })
      const nextQuestions = normalizeQuestions(payload, questionCount)
      setQuestions(nextQuestions)
      setScreen('game')
    } catch (error) {
      setStatus({ loading: false, error: error?.message || 'Impossible de préparer les questions.' })
      return
    }

    setStatus({ loading: false, error: '' })
  }

  function answerQuestion(answerId) {
    if (!currentQuestion || answers[currentQuestion.id]) return
    setAnswers((current) => ({ ...current, [currentQuestion.id]: answerId }))
  }

  function restart() {
    setScreen('config')
    setQuestions([])
    setAnswers({})
    setCurrentIndex(0)
    setStatus({ loading: false, error: '' })
  }

  if (screen === 'splash') {
    return (
      <motion.button type="button" className="mes-splash" onClick={() => setScreen('config')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <span className="mes-splash-stars">✦ ✧ ✨ ✧ ✦</span>
        <motion.span className="mes-splash-title" initial={{ y: 24, scale: 0.92, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ duration: 0.7 }}>Mes Questions</motion.span>
        <span className="mes-splash-subtitle">Tape n’importe où pour commencer l’aventure quiz.</span>
      </motion.button>
    )
  }

  if (screen === 'config') {
    return (
      <section className="wizard-card mes-card">
        <p className="eyebrow">Quiz magique</p>
        <h2>Prépare tes questions</h2>
        <label className="mes-picker-label">Âge</label>
        <select className="mes-wheel" value={age} onChange={(event) => setAge(Number(event.target.value))}>{AGE_OPTIONS.map((value) => <option key={value} value={value}>{value} ans</option>)}</select>
        <label className="mes-picker-label">Nombre de questions</label>
        <div className="mes-counts">{QUESTION_COUNT_OPTIONS.map((value) => <button type="button" key={value} className={value === questionCount ? 'active' : ''} onClick={() => setQuestionCount(value)}>{value}</button>)}</div>
        <label className="mes-picker-label">Matières</label>
        <div className="mes-subjects">{MES_QUESTIONS_SUBJECTS.map((subject) => <button type="button" key={subject.id} className={subjects.includes(subject.id) ? 'active' : ''} onClick={() => toggleSubject(subject.id)}><span>{subject.icon}</span>{subject.label}</button>)}</div>
        {status.error ? <p className="mes-error">{status.error}</p> : null}
        <button type="button" className="primary-action" onClick={generateQuiz} disabled={status.loading}>{status.loading ? 'La magie prépare les questions…' : 'Générer le quiz'}</button>
      </section>
    )
  }

  if (!currentQuestion) {
    return <section className="wizard-card mes-card"><h2>Aucune question</h2><p>Relance la génération pour créer une nouvelle partie.</p><button type="button" className="primary-action" onClick={restart}>Recommencer</button></section>
  }

  if (screen === 'score') {
    const percent = Math.round((score / questions.length) * 100)
    return (
      <section className="wizard-card mes-card">
        <p className="eyebrow">Score final</p>
        <h2>{score} / {questions.length} — {percent}%</h2>
        <div className="mes-review">{questions.map((question) => {
          const given = question.answers.find((answer) => answer.id === answers[question.id])
          const correct = question.answers.find((answer) => answer.id === question.correctAnswerId)
          return <article key={question.id}><strong>{given?.id === question.correctAnswerId ? '✅' : '🌱'} {question.subject}</strong><p>{question.question}</p><small>Réponse donnée : {given?.text || '—'}<br />Bonne réponse : {correct?.text}</small></article>
        })}</div>
        <button type="button" className="primary-action" onClick={restart}>Recommencer une partie</button>
      </section>
    )
  }

  const correctAnswer = currentQuestion.answers.find((answer) => answer.id === currentQuestion.correctAnswerId)

  return (
    <section className="wizard-card mes-card">
      <p className="eyebrow">Question {currentIndex + 1} / {questions.length} · {currentQuestion.subject}</p>
      <h2>{currentQuestion.question}</h2>
      <div className="mes-answers">
        <AnimatePresence>
          {currentQuestion.answers.map((answer) => {
            const state = !isAnswered ? '' : answer.id === currentQuestion.correctAnswerId ? ' correct' : answer.id === currentAnswerId ? ' wrong' : ' invalid'
            return <motion.button type="button" key={answer.id} className={`mes-answer${state}`} onClick={() => answerQuestion(answer.id)} disabled={isAnswered} whileTap={{ scale: 0.98 }} animate={isAnswered ? { scale: answer.id === currentQuestion.correctAnswerId ? 1.03 : 0.98 } : { scale: 1 }}>{answer.text}</motion.button>
          })}
        </AnimatePresence>
      </div>
      {isAnswered ? <p className="mes-feedback">{currentAnswerId === currentQuestion.correctAnswerId ? 'Bravo, étoile brillante ! C’est la bonne réponse.' : `Presque ! La bonne réponse était : ${correctAnswer?.text}. On apprend en essayant.`}</p> : null}
      <div className="mes-nav"><button type="button" className="ghost-action" onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))} disabled={currentIndex === 0}>Retour</button><button type="button" className="ghost-action" onClick={restart}>Accueil</button><button type="button" className="primary-action" onClick={() => currentIndex === questions.length - 1 ? setScreen('score') : setCurrentIndex((value) => value + 1)} disabled={!isAnswered}>Suivant</button></div>
    </section>
  )
}
