import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { createSessionSnapshot, getWizardDiscovery } from '../logic/wizardScoring'
import { getDynamicDiscovery, getDynamicLinks, getDynamicQuestion, getReplacementAnswer } from '../services/aiClient'
import { DiscoveryCard } from './DiscoveryCard'
import { DynamicQuestionStep } from './DynamicQuestionStep'
import { FeelingStep } from './FeelingStep'
import { HistoryPanel } from './HistoryPanel'
import { NeedMap } from './NeedMap'

const MAX_PASSAGES = 4
const HISTORY_KEY = 'manifestation:paths'

function createSessionId() {
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function ManifestationWizard() {
  const [sessionId, setSessionId] = useState(createSessionId)
  const [feeling, setFeeling] = useState(null)
  const [answers, setAnswers] = useState([])
  const [currentPrompt, setCurrentPrompt] = useState(null)
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false)
  const [refreshingAnswerId, setRefreshingAnswerId] = useState(null)
  const [discoveryText, setDiscoveryText] = useState('')
  const [links, setLinks] = useState({ needLinks: [], pathLinks: [] })
  const [history, setHistory] = useState(readHistory)
  const savedSessionRef = useRef(null)

  const steps = useMemo(() => {
    const path = []

    if (feeling) {
      path.push({
        ...feeling,
        type: 'feeling',
        kicker: 'Ressenti'
      })
    }

    answers.forEach((answer, index) => {
      path.push({
        ...answer,
        type: 'dynamic-answer',
        kicker: `Passage ${index + 1}`
      })
    })

    return path
  }, [answers, feeling])

  const discovery = useMemo(() => getWizardDiscovery(steps), [steps])
  const isComplete = Boolean(feeling && answers.length >= MAX_PASSAGES)

  const aiContext = useMemo(() => ({
    sessionId,
    feeling,
    answers,
    steps,
    discovery,
    dominantNeed: discovery.dominantNeed,
    linkedNeeds: discovery.linkedNeeds,
    pathLength: answers.length
  }), [answers, discovery, feeling, sessionId, steps])

  useEffect(() => {
    let isActive = true

    async function loadQuestion() {
      if (!feeling || isComplete || currentPrompt) return

      setIsLoadingPrompt(true)
      const prompt = await getDynamicQuestion(aiContext)

      if (isActive) {
        setCurrentPrompt(prompt)
        setIsLoadingPrompt(false)
      }
    }

    loadQuestion()

    return () => {
      isActive = false
    }
  }, [aiContext, currentPrompt, feeling, isComplete])

  useEffect(() => {
    let isActive = true

    async function loadDiscovery() {
      if (!isComplete || savedSessionRef.current === sessionId) return

      const [nextDiscoveryText, nextLinks] = await Promise.all([
        getDynamicDiscovery(aiContext),
        getDynamicLinks(aiContext)
      ])

      if (!isActive) return

      setDiscoveryText(nextDiscoveryText)
      setLinks(nextLinks)

      const snapshot = createSessionSnapshot({
        sessionId,
        feeling,
        answers,
        discovery,
        links: nextLinks
      })

      const nextHistory = [snapshot, ...history].slice(0, 12)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory))
      setHistory(nextHistory)
      savedSessionRef.current = sessionId
    }

    loadDiscovery()

    return () => {
      isActive = false
    }
  }, [aiContext, answers, discovery, feeling, history, isComplete, sessionId])

  function restart() {
    setSessionId(createSessionId())
    setFeeling(null)
    setAnswers([])
    setCurrentPrompt(null)
    setRefreshingAnswerId(null)
    setDiscoveryText('')
    setLinks({ needLinks: [], pathLinks: [] })
    savedSessionRef.current = null
  }

  function chooseFeeling(nextFeeling) {
    setSessionId(createSessionId())
    setFeeling(nextFeeling)
    setAnswers([])
    setCurrentPrompt(null)
    setRefreshingAnswerId(null)
    setDiscoveryText('')
    setLinks({ needLinks: [], pathLinks: [] })
    savedSessionRef.current = null
  }

  function chooseAnswer(answer) {
    setAnswers((currentAnswers) => [
      ...currentAnswers,
      {
        ...answer,
        question: currentPrompt?.question
      }
    ])
    setCurrentPrompt(null)
    setRefreshingAnswerId(null)
  }

  async function refreshAnswer(answer, answerIndex) {
    if (!currentPrompt || currentPrompt.source !== 'ai' || refreshingAnswerId) return

    setRefreshingAnswerId(answer.id)

    try {
      const result = await getReplacementAnswer({
        ...aiContext,
        prompt: currentPrompt,
        answer,
        answerIndex
      })

      if (result.source !== 'ai' || !result.answer) {
        setCurrentPrompt((prompt) => prompt
          ? {
              ...prompt,
              debug: result.debug || prompt.debug
            }
          : prompt)
        return
      }

      setCurrentPrompt((prompt) => {
        if (!prompt) return prompt

        return {
          ...prompt,
          debug: result.debug || prompt.debug,
          answers: prompt.answers.map((currentAnswer, index) => (
            index === answerIndex
              ? {
                  ...result.answer,
                  id: result.answer.id || `${currentAnswer.id}-refresh-${Date.now()}`
                }
              : currentAnswer
          ))
        }
      })
    } catch (error) {
      setCurrentPrompt((prompt) => prompt
        ? {
            ...prompt,
            debug: {
              source: 'local',
              fallbackReason: 'answer_refresh_failed',
              errorMessage: error?.message || 'Unable to refresh answer'
            }
          }
        : prompt)
    } finally {
      setRefreshingAnswerId(null)
    }
  }

  return (
    <main className="manifestation-shell">
      <section className="wizard-hero">
        <p className="eyebrow">Manifestation</p>
        <h1>Carte intérieure vivante</h1>
        <p>
          Pars d’un ressenti, observe les besoins qui se colorent, puis laisse apparaître un chemin possible.
          Rien n’est imposé : chaque étape propose une piste à explorer.
        </p>
      </section>

      <NeedMap steps={steps} discovery={discovery} links={links} />

      <AnimatePresence mode="wait">
        {!feeling ? (
          <FeelingStep key="feeling-step" onChoose={chooseFeeling} />
        ) : !isComplete ? (
          <DynamicQuestionStep
            key={currentPrompt?.id || `loading-${answers.length}`}
            prompt={currentPrompt}
            activeNeed={discovery.dominantNeed}
            currentIndex={answers.length}
            total={MAX_PASSAGES}
            isLoading={isLoadingPrompt || !currentPrompt}
            onChoose={chooseAnswer}
            onRefreshAnswer={refreshAnswer}
            refreshingAnswerId={refreshingAnswerId}
            onBack={restart}
          />
        ) : (
          <DiscoveryCard
            key="discovery-card"
            steps={steps}
            discovery={discovery}
            discoveryText={discoveryText}
            links={links}
            onRestart={restart}
          />
        )}
      </AnimatePresence>

      <HistoryPanel history={history} />
    </main>
  )
}
