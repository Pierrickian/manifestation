import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { createSessionSnapshot, getWizardDiscovery } from '../logic/wizardScoring'
import { getDynamicDiscovery, getDynamicLinks, getDynamicQuestion, getFlowWords, getReplacementAnswer, getSliderSuggestion } from '../services/aiClient'
import { NEGATIVE_EMOTIONS, OPPOSITE_POSITIVE_EMOTIONS, POSITIVE_EMOTIONS } from '../data/staticQuestions'
import { DiscoveryCard } from './DiscoveryCard'
import { DynamicQuestionStep } from './DynamicQuestionStep'
import { FeelingStep } from './FeelingStep'
import { HistoryPanel } from './HistoryPanel'
import { NeedMap } from './NeedMap'
import { NarratiaApp } from '../features/narratia/NarratiaApp'
import { MesQuestionsApp } from '../features/MesQuestionsApp'
import { EnigmiaApp } from '../features/EnigmiaApp'
import { CreateYourApp } from '../features/create-your-app/CreateYourApp'
import { HtmlAppGenerator } from '../features/html-app-generator/HtmlAppGenerator'
import { CREATIA_RULE_ID, DEFAULT_RULE_ID, ENIGMIA_RULE_ID, FLOW_RULE_ID, MES_QUESTIONS_RULE_ID, NARRATIA_RULE_ID, RECONCILIATION_RULE_ID, getRules, hasRule, isGuidedJourneyRule } from '../core/engine/ruleRegistry'
import { getInitialRuleIdFromUrl, readRuleUrlState, useRuleUrlSync } from '../hooks/useRuleUrlSync'

const PHASE_PASSAGES = {
  1: 4,
  2: 3,
  3: 3
}
const HISTORY_KEY = 'manifestation:paths'
const AI_SETTINGS_KEY = 'manifestation:ai-settings'
const BEING_SETTINGS_KEY = 'manifestation:being-settings'
const RULE_SETTINGS_KEY = 'manifestation:rule'
const WIZARD_RULES = getRules()
const CREATE_YOUR_APP_CONFIG = {
  repo: 'Pierrickian/manifestation',
  mode: 'issue',
  defaultTitle: 'Proposition de nouvelle app'
}
const DEFAULT_AI_SETTINGS = {
  intensity: 28,
  grounding: 35,
  focus: 58,
  register: 76
}

const DEFAULT_BEING_SETTINGS = {
  commitment: 34,
  openness: 58,
  sensitivity: 54,
  autonomy: 62
}

const AI_SLIDERS = [
  {
    id: 'intensity',
    label: 'Presence',
    left: 'Douce',
    right: 'Secouante'
  },
  {
    id: 'grounding',
    label: 'Ancrage',
    left: 'Terre a terre',
    right: 'Spirituel'
  },
  {
    id: 'focus',
    label: 'Axe',
    left: 'Besoin',
    right: 'Emotion'
  },
  {
    id: 'register',
    label: 'Langage',
    left: 'Vulgaire',
    right: 'Bien eleve'
  }
]

const BEING_SLIDERS = [
  {
    id: 'commitment',
    label: 'Position',
    left: 'Insaisissable',
    right: 'Engage'
  },
  {
    id: 'openness',
    label: 'Ouverture',
    left: 'Prudent',
    right: 'Curieux'
  },
  {
    id: 'sensitivity',
    label: 'Sensibilite',
    left: 'Robuste',
    right: 'Sensible'
  },
  {
    id: 'autonomy',
    label: 'Autonomie',
    left: 'Accompagne',
    right: 'Souverain'
  }
]

const AI_SLIDER_CONFIG_KEY = 'manifestation:ai-slider-configs'
const BEING_SLIDER_CONFIG_KEY = 'manifestation:being-slider-configs'
const FLOW_CONCLUSION_COUNT = 12
const INITIAL_FLOW_WORDS = ['sens', 'corps', 'choix', 'lien', 'limite', 'appui', 'route', 'envie', 'place', 'souffle', 'clarte', 'pas'].map((word, index) => ({
  id: `initial-flow-${index}-${word}`,
  word,
  question: `Qu est-ce que "${word}" ouvre pour toi ?`,
  x: 14 + ((index * 17) % 74),
  y: 12 + ((index * 23) % 76),
  size: 0.88 + ((index % 5) * 0.08),
  duration: 7 + (index % 6),
  delay: -1 * (index % 5)
}))

function readSliderConfigs(key, fallback) {
  try {
    const savedConfigs = JSON.parse(localStorage.getItem(key) || '[]')
    return fallback.map((slider) => ({
      ...slider,
      ...(savedConfigs.find((savedSlider) => savedSlider.id === slider.id) || {})
    }))
  } catch {
    return fallback
  }
}

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

function readAiSettings() {
  try {
    return {
      ...DEFAULT_AI_SETTINGS,
      ...JSON.parse(localStorage.getItem(AI_SETTINGS_KEY) || '{}')
    }
  } catch {
    return DEFAULT_AI_SETTINGS
  }
}

function readBeingSettings() {
  try {
    return {
      ...DEFAULT_BEING_SETTINGS,
      ...JSON.parse(localStorage.getItem(BEING_SETTINGS_KEY) || '{}')
    }
  } catch {
    return DEFAULT_BEING_SETTINGS
  }
}

function readStoredRuleId() {
  try {
    const ruleId = localStorage.getItem(RULE_SETTINGS_KEY) || DEFAULT_RULE_ID
    return hasRule(ruleId) ? ruleId : DEFAULT_RULE_ID
  } catch {
    return DEFAULT_RULE_ID
  }
}

function readActiveRuleId() {
  return getInitialRuleIdFromUrl({
    fallbackRuleId: readStoredRuleId(),
    isKnownRule: hasRule
  })
}

function readInitialPortalView() {
  if (typeof window === 'undefined') return 'home'
  const { ruleId } = readRuleUrlState(window.location)
  if (ruleId === CREATIA_RULE_ID) return 'html-app-generator'
  return ruleId && hasRule(ruleId) ? 'app' : 'home'
}

function getPhaseTotal(ruleId, phase) {
  if (ruleId === RECONCILIATION_RULE_ID) return 2
  return PHASE_PASSAGES[phase]
}

function getPhaseChoice(ruleId, phase, phaseChoices, reconciliation) {
  if (ruleId === RECONCILIATION_RULE_ID) {
    return {
      id: 'reconciliation-guidance',
      label: reconciliation?.positiveEmotion?.label || 'vibration positive',
      ruleId,
      positiveEmotion: reconciliation?.positiveEmotion || null,
      negativeEmotion: reconciliation?.negativeEmotion || null,
      phase
    }
  }

  return phaseChoices[phase] || null
}

function getReconciliationPromptStep(reconciliation) {
  if (!reconciliation?.polarity) return 'polarity'
  if (reconciliation.polarity === 'positive' && !reconciliation.positiveEmotion) return 'positive-emotion'
  if (reconciliation.polarity === 'negative' && !reconciliation.negativeEmotion) return 'negative-emotion'
  if (reconciliation.polarity === 'negative' && !reconciliation.positiveEmotion) return 'opposite-positive-emotion'
  return null
}

function createFeelingFromEmotion(reconciliation) {
  const positiveEmotion = reconciliation?.positiveEmotion
  const negativeEmotion = reconciliation?.negativeEmotion

  return {
    id: `reconciliation-${positiveEmotion?.id || 'positive'}`,
    label: positiveEmotion?.label || 'Vibration positive',
    description: negativeEmotion
      ? `Reanimer ${positiveEmotion?.label || 'une vibration positive'} face a ${negativeEmotion.label}.`
      : `Retrouver ${positiveEmotion?.label || 'une vibration positive'} longtemps moins presente.`,
    scores: positiveEmotion?.scores || { green: 2, red: 1 },
    seedQuestion: `Qu est-ce que ${positiveEmotion?.label || 'cette vibration positive'} commence a rendre possible ?`,
    reconciliation
  }
}

function getPhaseAnswers(answers, phase) {
  return answers.filter((answer) => (answer.phase || 1) === phase)
}

function getPhaseChoiceTone(phase, settings) {
  const commitment = Number(settings?.commitment ?? DEFAULT_BEING_SETTINGS.commitment)
  const openness = Number(settings?.openness ?? DEFAULT_BEING_SETTINGS.openness)
  const autonomy = Number(settings?.autonomy ?? DEFAULT_BEING_SETTINGS.autonomy)

  if (phase === 2) {
    if (openness > 66) return 'une exploration plus large'
    if (autonomy > 66) return 'une piste choisie par toi'
    return 'un pas discret vers une prise de conscience'
  }

  if (commitment > 66) return 'un engagement clair et vivable'
  if (commitment < 40) return 'un constat leger, sans obligation'
  return 'une decision souple et concrete'
}

function createOrientationChoices({ phase, discovery, answers, beingSettings }) {
  const dominantNeed = discovery?.dominantNeed
  const linkedNeeds = discovery?.linkedNeeds || []
  const primaryId = dominantNeed?.id || 'red'
  const secondaryId = linkedNeeds[0]?.id || 'blue'
  const commitment = Number(beingSettings?.commitment ?? DEFAULT_BEING_SETTINGS.commitment)
  const openness = Number(beingSettings?.openness ?? DEFAULT_BEING_SETTINGS.openness)
  const sensitivity = Number(beingSettings?.sensitivity ?? DEFAULT_BEING_SETTINGS.sensitivity)
  const recentLabels = answers.slice(-3).map((answer) => answer.label).join(' / ')

  const phaseTwo = {
    violet: ['Voir clair', 'Trouver sens', 'Relier idees'],
    indigo: ['Suivre intuition', 'Voir route', 'Changer angle'],
    blue: ['Dire vrai', 'Reprendre espace', 'Nommer limite'],
    green: ['Chercher lien', 'Recevoir aide', 'Ouvrir coeur'],
    yellow: ['Reprendre valeur', 'Oser place', 'Calmer doute'],
    orange: ['Raviver envie', 'Explorer neuf', 'Creer jeu'],
    red: ['Trouver appui', 'Stabiliser pas', 'Baisser pression']
  }

  const phaseThree = {
    violet: ['Clarifier choix', 'Acter sens', 'Garder cap'],
    indigo: ['Choisir route', 'Tester vision', 'Suivre signal'],
    blue: ['Poser limite', 'Dire demande', 'Liberer geste'],
    green: ['Demander soutien', 'Nourrir lien', 'Recevoir mieux'],
    yellow: ['Prendre place', 'Valider valeur', 'Cesser comparaison'],
    orange: ['Lancer essai', 'Changer rituel', 'Creer mouvement'],
    red: ['Faire pas', 'Chercher support', 'Tenir base']
  }

  const labels = phase === 2 ? phaseTwo : phaseThree
  const candidateLabels = [
    ...(labels[primaryId] || labels.red),
    ...(labels[secondaryId] || []),
    sensitivity > 66 ? 'Rester doux' : null,
    openness > 66 ? 'Ouvrir champ' : null,
    commitment > 66 && phase === 3 ? 'Assumer choix' : null,
    commitment < 40 && phase === 3 ? 'Constater juste' : null
  ].filter(Boolean)

  const uniqueLabels = [...new Set(candidateLabels)].slice(0, 3)

  return uniqueLabels.map((label, index) => ({
    id: `phase-${phase}-orientation-${index}-${label.toLowerCase().replace(/\s+/g, '-')}`,
    label,
    description: getPhaseChoiceTone(phase, beingSettings),
    phase,
    needId: index === 0 ? primaryId : secondaryId,
    scores: {
      [index === 0 ? primaryId : secondaryId]: phase === 3 ? 2 : 1
    },
    seed: recentLabels
  }))
}

function getDebugRows(prompt, externalDebug = null) {
  if (externalDebug) {
    return Object.entries(externalDebug).map(([label, value]) => [label, String(value ?? 'none')])
  }

  const answers = prompt?.answers || []

  return prompt?.debug
    ? [
        ['source', prompt.source || 'unknown'],
        ['debug.source', prompt.debug.source || 'unknown'],
        ['hasOpenAIKey', String(prompt.debug.hasOpenAIKey ?? 'unknown')],
        ['fallbackReason', prompt.debug.fallbackReason || 'none'],
        ['endpoint', prompt.debug.endpoint || 'unknown'],
        ['kind', prompt.debug.kind || 'unknown'],
        ['model', prompt.debug.model || 'unknown'],
        ['finishReason', prompt.debug.finishReason || 'unknown'],
        ['errorName', prompt.debug.errorName || 'none'],
        ['errorMessage', prompt.debug.errorMessage || 'none'],
        ['invalidPayloadKeys', prompt.debug.invalidPayloadKeys || 'none'],
        ['retryCount', String(prompt.debug.retryCount ?? 'unknown')],
        ['timestamp', prompt.debug.timestamp || 'unknown'],
        ['questionId', prompt.id || 'none'],
        ['answerIds', answers.map((answer) => answer.id).join(', ') || 'none']
      ]
    : []
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
  const [aiSettings, setAiSettings] = useState(readAiSettings)
  const [beingSettings, setBeingSettings] = useState(readBeingSettings)
  const [aiSliders, setAiSliders] = useState(() => readSliderConfigs(AI_SLIDER_CONFIG_KEY, AI_SLIDERS))
  const [beingSliders, setBeingSliders] = useState(() => readSliderConfigs(BEING_SLIDER_CONFIG_KEY, BEING_SLIDERS))
  const [refreshingSettingId, setRefreshingSettingId] = useState(null)
  const [activeRuleId, setActiveRuleId] = useState(readActiveRuleId)
  const [reconciliation, setReconciliation] = useState({ polarity: null, positiveEmotion: null, negativeEmotion: null })
  const [phaseZeroPrompt, setPhaseZeroPrompt] = useState(null)
  const [isLoadingPhaseZeroPrompt, setIsLoadingPhaseZeroPrompt] = useState(false)
  const [refreshingPhaseZeroId, setRefreshingPhaseZeroId] = useState(null)
  const [phase, setPhase] = useState(1)
  const [phaseChoices, setPhaseChoices] = useState({})
  const [extraPassages, setExtraPassages] = useState(0)
  const [flowWords, setFlowWords] = useState([])
  const [selectedFlowWords, setSelectedFlowWords] = useState([])
  const [flowConclusion, setFlowConclusion] = useState('')
  const [flowBatch, setFlowBatch] = useState(0)
  const [mesQuestionsDebug, setMesQuestionsDebug] = useState(null)
  const [enigmiaDebug, setEnigmiaDebug] = useState(null)
  const [htmlGeneratorDebug, setHtmlGeneratorDebug] = useState(null)
  const [creatiaMenu, setCreatiaMenu] = useState({})
  const [hasConfiguredApp, setHasConfiguredApp] = useState(false)
  const [showAiDebug, setShowAiDebug] = useState(false)
  const [portalView, setPortalView] = useState(readInitialPortalView)
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
  const currentPhaseAnswers = useMemo(() => getPhaseAnswers(answers, phase), [answers, phase])
  const currentPhaseTotal = getPhaseTotal(activeRuleId, phase) + (phase === 3 ? extraPassages : 0)
  const phaseZeroStep = activeRuleId === RECONCILIATION_RULE_ID ? getReconciliationPromptStep(reconciliation) : null
  const needsPhaseZero = activeRuleId === RECONCILIATION_RULE_ID && Boolean(phaseZeroStep)
  const isFlowRule = activeRuleId === FLOW_RULE_ID
  const isNarratiaRule = activeRuleId === NARRATIA_RULE_ID
  const isMesQuestionsRule = activeRuleId === MES_QUESTIONS_RULE_ID
  const isEnigmiaRule = activeRuleId === ENIGMIA_RULE_ID
  const needsAppSetup = [DEFAULT_RULE_ID, RECONCILIATION_RULE_ID, FLOW_RULE_ID].includes(activeRuleId) && !hasConfiguredApp && !feeling && !selectedFlowWords.length
  const isPhaseDone = Boolean(feeling && currentPhaseAnswers.length >= currentPhaseTotal)
  const needsPhaseChoice = isGuidedJourneyRule(activeRuleId) && isPhaseDone && phase < 3
  const isComplete = Boolean(feeling && phase === 3 && isPhaseDone)
  const orientationChoices = useMemo(() => createOrientationChoices({
    phase: phase + 1,
    discovery,
    answers,
    beingSettings
  }), [answers, beingSettings, discovery, phase])

  const aiContext = useMemo(() => ({
    sessionId,
    ruleId: activeRuleId,
    feeling,
    answers,
    phase,
    phaseIndex: currentPhaseAnswers.length,
    phaseChoice: getPhaseChoice(activeRuleId, phase, phaseChoices, reconciliation),
    phaseChoices,
    phaseZeroStep,
    reconciliation,
    previousQuestions: answers.map((answer) => answer.question).filter(Boolean),
    steps,
    discovery,
    dominantNeed: discovery.dominantNeed,
    linkedNeeds: discovery.linkedNeeds,
    pathLength: answers.length,
    selectedWords: selectedFlowWords,
    flowBatch,
    aiSettings,
    beingSettings
  }), [activeRuleId, aiSettings, answers, beingSettings, currentPhaseAnswers.length, discovery, feeling, flowBatch, phase, phaseChoices, phaseZeroStep, reconciliation, selectedFlowWords, sessionId, steps])

  function updateAiSetting(id, value) {
    setAiSettings((currentSettings) => {
      const nextSettings = {
        ...currentSettings,
        [id]: Number(value)
      }

      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(nextSettings))
      return nextSettings
    })
  }

  function updateBeingSetting(id, value) {
    setBeingSettings((currentSettings) => {
      const nextSettings = {
        ...currentSettings,
        [id]: Number(value)
      }

      localStorage.setItem(BEING_SETTINGS_KEY, JSON.stringify(nextSettings))
      return nextSettings
    })
  }

  function resetJourney() {
    setSessionId(createSessionId())
    setFeeling(null)
    setAnswers([])
    setCurrentPrompt(null)
    setRefreshingAnswerId(null)
    setDiscoveryText('')
    setLinks({ needLinks: [], pathLinks: [] })
    setPhase(1)
    setPhaseChoices({})
    setExtraPassages(0)
    setFlowWords([])
    setSelectedFlowWords([])
    setFlowConclusion('')
    setFlowBatch(0)
    setReconciliation({ polarity: null, positiveEmotion: null, negativeEmotion: null })
    setPhaseZeroPrompt(null)
    setIsLoadingPhaseZeroPrompt(false)
    setRefreshingPhaseZeroId(null)
    savedSessionRef.current = null
  }

  function resetFlow() {
    setSessionId(createSessionId())
    setFlowWords([])
    setSelectedFlowWords([])
    setFlowConclusion('')
    setFlowBatch((currentBatch) => currentBatch + 1)
  }

  function chooseRule(ruleId) {
    if (!hasRule(ruleId)) return

    setActiveRuleId(ruleId)
    localStorage.setItem(RULE_SETTINGS_KEY, ruleId)
    resetJourney()
    setHasConfiguredApp(false)
    setPortalView(ruleId === CREATIA_RULE_ID ? 'html-app-generator' : 'app')
  }

  function goHome() {
    resetJourney()
    setHasConfiguredApp(false)
    setPortalView('home')
  }

  function openCreateYourApp() {
    resetJourney()
    setHasConfiguredApp(false)
    setPortalView('create-app')
  }

  const { selectRuleFromUi } = useRuleUrlSync({
    activeRuleId,
    onRuleChange: chooseRule,
    isKnownRule: hasRule
  })

  useEffect(() => {
    try {
      localStorage.setItem(RULE_SETTINGS_KEY, activeRuleId)
    } catch {
      // Ignore unavailable storage; URL state remains the source of truth for shared links.
    }
  }, [activeRuleId])

  useEffect(() => {
    let isActive = true

    async function loadQuestion() {
      if (isFlowRule || !feeling || isComplete || needsPhaseChoice || isPhaseDone || currentPrompt) return

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
  }, [aiContext, currentPrompt, feeling, isComplete, isFlowRule, isPhaseDone, needsPhaseChoice])

  useEffect(() => {
    let isActive = true

    async function loadFlowBuffer() {
      if (!isFlowRule || flowConclusion || flowWords.length > 8) return

      const result = await getFlowWords({
        ...aiContext,
        batch: flowBatch,
        selectedWords: selectedFlowWords
      })

      if (!isActive) return

      setFlowWords((currentWords) => {
        const knownIds = new Set(currentWords.map((word) => word.id))
        const nextWords = (result.words || []).filter((word) => !knownIds.has(word.id))
        return [...currentWords, ...nextWords].slice(-24)
      })

      if (result.conclusion && selectedFlowWords.length >= FLOW_CONCLUSION_COUNT) {
        setFlowConclusion(result.conclusion)
      }
    }

    loadFlowBuffer()

    return () => {
      isActive = false
    }
  }, [aiContext, flowBatch, flowConclusion, flowWords.length, isFlowRule, selectedFlowWords])

  useEffect(() => {
    if (!isFlowRule || flowConclusion || selectedFlowWords.length < FLOW_CONCLUSION_COUNT) return

    setFlowConclusion(`Une piste se dessine: tu sembles tourner autour de ${selectedFlowWords.slice(-3).map((item) => item.word).join(', ')}.`)
  }, [flowConclusion, isFlowRule, selectedFlowWords])

  useEffect(() => {
    let isActive = true

    async function loadPhaseZeroQuestion() {
      if (!needsPhaseZero || phaseZeroStep === 'polarity' || phaseZeroPrompt) return

      setIsLoadingPhaseZeroPrompt(true)
      const prompt = await getDynamicQuestion({
        ...aiContext,
        phase: 0,
        phaseZeroStep
      })

      if (isActive) {
        setPhaseZeroPrompt(prompt)
        setIsLoadingPhaseZeroPrompt(false)
      }
    }

    loadPhaseZeroQuestion()

    return () => {
      isActive = false
    }
  }, [aiContext, needsPhaseZero, phaseZeroPrompt, phaseZeroStep])

  useEffect(() => {
    if (activeRuleId !== RECONCILIATION_RULE_ID || !isPhaseDone || phase >= 3) return

    setPhase((currentPhase) => currentPhase + 1)
    setCurrentPrompt(null)
    setRefreshingAnswerId(null)
  }, [activeRuleId, isPhaseDone, phase])

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
    resetJourney()
  }

  function chooseFeeling(nextFeeling) {
    setSessionId(createSessionId())
    setFeeling(nextFeeling)
    setAnswers([])
    setCurrentPrompt(null)
    setRefreshingAnswerId(null)
    setDiscoveryText('')
    setLinks({ needLinks: [], pathLinks: [] })
    setPhase(1)
    setPhaseChoices({})
    setExtraPassages(0)
    setFlowWords([])
    setSelectedFlowWords([])
    setFlowConclusion('')
    setFlowBatch(0)
    setPhaseZeroPrompt(null)
    setRefreshingPhaseZeroId(null)
    savedSessionRef.current = null
  }

  async function refreshSetting(group, slider) {
    if (refreshingSettingId) return

    const storageKey = group === 'ai' ? AI_SLIDER_CONFIG_KEY : BEING_SLIDER_CONFIG_KEY
    const setSliders = group === 'ai' ? setAiSliders : setBeingSliders
    const settingUpdater = group === 'ai' ? updateAiSetting : updateBeingSetting

    setRefreshingSettingId(`${group}:${slider.id}`)

    try {
      const result = await getSliderSuggestion({
        ...aiContext,
        group,
        slider,
        refreshCount: Date.now()
      })
      const nextSlider = result.slider
      const boundedValue = Math.max(0, Math.min(100, Number(nextSlider.value ?? 50)))

      setSliders((currentSliders) => {
        const updatedSliders = currentSliders.map((currentSlider) => (
          currentSlider.id === slider.id
            ? {
                ...currentSlider,
                label: nextSlider.label || currentSlider.label,
                left: nextSlider.left || currentSlider.left,
                right: nextSlider.right || currentSlider.right
              }
            : currentSlider
        ))

        localStorage.setItem(storageKey, JSON.stringify(updatedSliders))
        return updatedSliders
      })

      settingUpdater(slider.id, boundedValue)
    } finally {
      setRefreshingSettingId(null)
    }
  }

  function chooseFlowWord(word) {
    setSelectedFlowWords((currentWords) => [
      ...currentWords,
      {
        ...word,
        chosenAt: Date.now()
      }
    ])
    setFlowWords((currentWords) => currentWords.filter((currentWord) => currentWord.id !== word.id))

    if (flowWords.length < 10) {
      setFlowBatch((currentBatch) => currentBatch + 1)
    }
  }

  function continueFlow() {
    setFlowConclusion('')
    setFlowBatch((currentBatch) => currentBatch + 1)
  }

  function continueJourney() {
    setDiscoveryText('')
    setLinks({ needLinks: [], pathLinks: [] })
    setExtraPassages((currentExtraPassages) => currentExtraPassages + 1)
    setCurrentPrompt(null)
    savedSessionRef.current = null
  }

  function chooseReconciliationPolarity(polarity) {
    setReconciliation({ polarity, positiveEmotion: null, negativeEmotion: null })
    setPhaseZeroPrompt(null)
    setRefreshingPhaseZeroId(null)
  }

  function chooseReconciliationEmotion(emotion) {
    const nextReconciliation = reconciliation.polarity === 'negative' && !reconciliation.negativeEmotion
      ? {
          ...reconciliation,
          negativeEmotion: emotion
        }
      : {
          ...reconciliation,
          positiveEmotion: emotion
        }

    setReconciliation(nextReconciliation)

    if (nextReconciliation.positiveEmotion) {
      chooseFeeling(createFeelingFromEmotion(nextReconciliation))
    } else {
      setPhaseZeroPrompt(null)
      setRefreshingPhaseZeroId(null)
    }
  }

  async function refreshPhaseZeroAnswer(answer, answerIndex) {
    if (!phaseZeroPrompt || refreshingPhaseZeroId) return

    setRefreshingPhaseZeroId(answer.id)

    try {
      const result = await getReplacementAnswer({
        ...aiContext,
        phase: 0,
        phaseZeroStep,
        prompt: phaseZeroPrompt,
        answer,
        answerIndex
      })

      if (result.source !== 'ai' || !result.answer) {
        rotateLocalPhaseZeroAnswer(answerIndex)
        return
      }

      setPhaseZeroPrompt((prompt) => prompt
        ? {
            ...prompt,
            debug: result.debug || prompt.debug,
            source: result.source || prompt.source,
            answers: prompt.answers.map((currentAnswer, index) => (
              index === answerIndex
                ? {
                    ...result.answer,
                    id: result.answer.id || `${currentAnswer.id}-refresh-${Date.now()}`
                  }
                : currentAnswer
            ))
          }
        : prompt)
    } catch {
      rotateLocalPhaseZeroAnswer(answerIndex)
    } finally {
      setRefreshingPhaseZeroId(null)
    }
  }

  function rotateLocalPhaseZeroAnswer(answerIndex) {
    const fallbackBank = phaseZeroStep === 'negative-emotion'
      ? NEGATIVE_EMOTIONS
      : phaseZeroStep === 'opposite-positive-emotion'
        ? OPPOSITE_POSITIVE_EMOTIONS[reconciliation.negativeEmotion?.id] || OPPOSITE_POSITIVE_EMOTIONS.agitation
        : POSITIVE_EMOTIONS

    setPhaseZeroPrompt((prompt) => {
      if (!prompt) return prompt

      const usedLabels = new Set(prompt.answers.map((answer) => answer.label))
      const replacement = fallbackBank.find((candidate) => !usedLabels.has(candidate.label)) || fallbackBank[(answerIndex + 1) % fallbackBank.length]

      return {
        ...prompt,
        answers: prompt.answers.map((currentAnswer, index) => (
          index === answerIndex
            ? {
                ...replacement,
                id: `${phaseZeroStep}-${replacement.id}-${Date.now()}`
              }
            : currentAnswer
        ))
      }
    })
  }

  function chooseAnswer(answer) {
    setAnswers((currentAnswers) => [
      ...currentAnswers,
      {
        ...answer,
        phase,
        phaseChoice: phaseChoices[phase] || null,
        question: currentPrompt?.question
      }
    ])
    setCurrentPrompt(null)
    setRefreshingAnswerId(null)
  }

  function chooseOrientation(choice) {
    setPhaseChoices((currentChoices) => ({
      ...currentChoices,
      [choice.phase]: choice
    }))
    setPhase(choice.phase)
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
      <WizardMenu
        onHome={goHome}
        showAiDebug={showAiDebug}
        onShowAiDebugChange={setShowAiDebug}
        creatiaMenu={portalView === 'html-app-generator' ? creatiaMenu : null}
      />

      {portalView === 'home' ? (
        <>
          <section className="wizard-hero">
            <h1>Evolutia</h1>
          </section>

          <AppChooser
            rules={WIZARD_RULES}
            activeRuleId={activeRuleId}
            onRuleChange={selectRuleFromUi}
            onCreateYourApp={openCreateYourApp}
          />
        </>
      ) : portalView === 'html-app-generator' ? (
        <>
          <HtmlAppGenerator onClose={goHome} onDebug={setHtmlGeneratorDebug} onMenuData={setCreatiaMenu} speechEnabled />
          {showAiDebug ? <AiDebugFooter debugRows={getDebugRows(null, htmlGeneratorDebug)} /> : null}
        </>
      ) : portalView === 'create-app' ? (
        <CreateYourApp
          config={CREATE_YOUR_APP_CONFIG}
          targetOptions={WIZARD_RULES.map((rule) => ({
            id: rule.id,
            label: rule.label,
            description: rule.description
          }))}
          context={{ source: 'portal' }}
          onClose={goHome}
        />
      ) : (
        <>
      {!isFlowRule && !isNarratiaRule && !isMesQuestionsRule && !isEnigmiaRule ? <NeedMap steps={steps} discovery={discovery} links={links} /> : null}

      {isEnigmiaRule ? <EnigmiaApp onAiDebug={setEnigmiaDebug} /> : isMesQuestionsRule ? <MesQuestionsApp onAiDebug={setMesQuestionsDebug} /> : isNarratiaRule ? <NarratiaApp /> : (
      <AnimatePresence mode="wait">
        {needsAppSetup ? (
          <AppSetupStep
            key={`app-setup-${activeRuleId}`}
            aiSliders={aiSliders}
            aiSettings={aiSettings}
            beingSliders={beingSliders}
            beingSettings={beingSettings}
            onAiSettingChange={updateAiSetting}
            onBeingSettingChange={updateBeingSetting}
            onRefreshSetting={refreshSetting}
            refreshingSettingId={refreshingSettingId}
            onStart={() => setHasConfiguredApp(true)}
          />
        ) : isFlowRule ? (
          <FlowStep
            key="flow-step"
            words={flowWords}
            selectedWords={selectedFlowWords}
            conclusion={flowConclusion}
            onChooseWord={chooseFlowWord}
            onContinue={continueFlow}
            onBack={resetJourney}
            onReset={resetFlow}
          />
        ) : needsPhaseZero ? (
          <ReconciliationStep
            key={`reconciliation-${phaseZeroStep}`}
            step={phaseZeroStep}
            prompt={phaseZeroPrompt}
            isLoading={isLoadingPhaseZeroPrompt}
            refreshingAnswerId={refreshingPhaseZeroId}
            onChoosePolarity={chooseReconciliationPolarity}
            onChooseEmotion={chooseReconciliationEmotion}
            onRefreshAnswer={refreshPhaseZeroAnswer}
            onBack={restart}
          />
        ) : !feeling ? (
          <FeelingStep key="feeling-step" onChoose={chooseFeeling} />
        ) : needsPhaseChoice ? (
          <PhaseBridge
            key={`phase-bridge-${phase}`}
            phase={phase}
            nextPhase={phase + 1}
            steps={steps}
            choices={orientationChoices}
            onChoose={chooseOrientation}
            onBack={restart}
          />
        ) : !isComplete ? (
          <DynamicQuestionStep
            key={currentPrompt?.id || `loading-${answers.length}`}
            prompt={currentPrompt}
            activeNeed={discovery.dominantNeed}
            currentIndex={currentPhaseAnswers.length}
            total={currentPhaseTotal}
            phase={phase}
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
            onContinue={continueJourney}
            onBack={resetJourney}
            onRestart={restart}
          />
        )}
      </AnimatePresence>
      )}

      {!isFlowRule && !isNarratiaRule && !isMesQuestionsRule && !isEnigmiaRule ? <HistoryPanel history={history} /> : null}

        </>
      )}

      {showAiDebug ? <AiDebugFooter debugRows={getDebugRows(currentPrompt, isEnigmiaRule ? enigmiaDebug : isMesQuestionsRule ? mesQuestionsDebug : null)} /> : null}
    </main>
  )
}

function FlowStep({ words, selectedWords, conclusion, onChooseWord, onContinue, onBack, onReset }) {
  const selectedIds = new Set(selectedWords.map((item) => item.id))
  const visibleWords = (words.length ? words : INITIAL_FLOW_WORDS).filter((item) => !selectedIds.has(item.id))

  return (
    <section className="flow-stage" aria-labelledby="flow-title">
      <div className="flow-hud">
        <div>
          <p className="eyebrow">Flow</p>
          <h2 id="flow-title">Attrape les mots qui t appellent.</h2>
        </div>
        <strong>{selectedWords.length}</strong>
      </div>

      <div className="flow-sky" aria-label="Mots en mouvement">
        {visibleWords.map((item) => (
          <button
            type="button"
            className="flow-word"
            key={item.id}
            onClick={() => onChooseWord(item)}
            style={{
              '--flow-x': `${item.x ?? 50}%`,
              '--flow-y': `${item.y ?? 50}%`,
              '--flow-size': item.size ?? 1,
              '--flow-duration': `${item.duration ?? 9}s`,
              '--flow-delay': `${item.delay ?? 0}s`
            }}
            title={item.question}
          >
            {item.word}
          </button>
        ))}
      </div>

      <div className="flow-trail" aria-label="Mots choisis">
        {selectedWords.slice(-8).map((item) => (
          <span key={`${item.id}-${item.chosenAt}`}>{item.word}</span>
        ))}
      </div>

      {conclusion ? (
        <div className="flow-conclusion" role="dialog" aria-modal="true" aria-labelledby="flow-conclusion-title">
          <p className="eyebrow">Conclusion</p>
          <h2 id="flow-conclusion-title">{conclusion}</h2>
          <div className="flow-actions">
            <button type="button" className="primary-action" onClick={onContinue}>Continue</button>
            <button type="button" className="ghost-action" onClick={onBack}>Retour</button>
            <button type="button" className="ghost-action" onClick={onReset}>Un autre</button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function PhaseBridge({ phase, nextPhase, steps, choices, onChoose, onBack }) {
  return (
    <section className="wizard-card phase-bridge" aria-labelledby="phase-bridge-title">
      <p className="eyebrow">Synthese</p>
      <h2 id="phase-bridge-title">Choisis l'orientation de la phase {nextPhase}.</h2>

      <div className="path-flow compact" aria-label="Synthese des reponses">
        {steps.map((step, index) => (
          <div className="path-flow-node" key={`${step.id}-${index}`}>
            <span>{step.kicker}</span>
            {step.question ? <em>{step.question}</em> : null}
            <strong>{step.label}</strong>
          </div>
        ))}
      </div>

      <div className="wizard-options orientation-options">
        {choices.map((choice) => (
          <button type="button" className="wizard-option orientation-option" key={choice.id} onClick={() => onChoose(choice)}>
            <span className="wizard-option-label">{choice.label}</span>
            <small>{choice.description}</small>
          </button>
        ))}
      </div>

      <button type="button" className="ghost-action" onClick={onBack}>
        Revenir au depart
      </button>
    </section>
  )
}

function ReconciliationStep({
  step,
  prompt,
  isLoading,
  refreshingAnswerId,
  onChoosePolarity,
  onChooseEmotion,
  onRefreshAnswer,
  onBack
}) {
  const titles = {
    polarity: 'Choisis la porte d entree emotionnelle.',
    'positive-emotion': 'Quelle emotion positive n as-tu pas ressentie depuis longtemps ?',
    'negative-emotion': 'Quelle emotion negative te submerge le plus ?',
    'opposite-positive-emotion': 'Quelle vibration positive opposee veut etre reanimee ?'
  }
  const answers = prompt?.answers || []

  return (
    <section className="wizard-card" aria-labelledby="reconciliation-title">
      <p className="eyebrow">Phase 0</p>
      <h2 id="reconciliation-title">{titles[step]}</h2>

      {step === 'polarity' ? (
        <div className="wizard-options feeling-grid">
          <button type="button" className="wizard-option feeling-option" onClick={() => onChoosePolarity('positive')}>
            <strong>Positif</strong>
            <small>Retrouver une emotion positive longtemps absente.</small>
          </button>
          <button type="button" className="wizard-option feeling-option" onClick={() => onChoosePolarity('negative')}>
            <strong>Negatif</strong>
            <small>Partir de l emotion qui submerge pour trouver son oppose positif.</small>
          </button>
        </div>
      ) : isLoading || !prompt ? (
        <div className="breathing-loader" aria-label="Chargement des options emotionnelles" />
      ) : (
        <div className="wizard-options">
          {answers.map((answer, index) => (
            <div className="wizard-option-row" key={answer.id}>
              <button type="button" className="wizard-option" onClick={() => onChooseEmotion(answer)}>
                <span className="wizard-option-label">{answer.label}</span>
                {prompt.source === 'ai' ? (
                  <span className="ai-choice-icon" aria-label="Propose par IA" title="Propose par IA">
                    AI
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className="refresh-answer-action"
                onClick={() => onRefreshAnswer(answer, index)}
                disabled={Boolean(refreshingAnswerId)}
                aria-label={`Renouveler l option ${answer.label}`}
                title="Renouveler avec l'IA"
              >
                {refreshingAnswerId === answer.id ? '...' : 'AI+'}
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="ghost-action" onClick={onBack}>
        Revenir au depart
      </button>
    </section>
  )
}

function AppChooser({ rules, activeRuleId, onRuleChange, onCreateYourApp }) {
  return (
    <section className="app-chooser" aria-labelledby="app-chooser-title">
      <div className="app-chooser-header">
        <p className="eyebrow">Apps</p>
        <h2 id="app-chooser-title">Choisis ton app.</h2>
      </div>
      <div className="rule-options app-options" role="list">
        {rules.map((rule) => (
          <button
            type="button"
            className={`rule-option${rule.id === activeRuleId ? ' active' : ''}`}
            key={rule.id}
            onClick={() => onRuleChange(rule.id)}
            aria-pressed={rule.id === activeRuleId}
          >
            <span>{rule.label}</span>
            <small>{rule.description}</small>
          </button>
        ))}
        <button
          type="button"
          className="rule-option create-app-option"
          onClick={onCreateYourApp}
        >
          <span>Demande produit</span>
          <small>Prépare une demande d’intégration au portail existant.</small>
        </button>
      </div>
    </section>
  )
}

function AppSetupStep({
  aiSliders,
  aiSettings,
  beingSliders,
  beingSettings,
  onAiSettingChange,
  onBeingSettingChange,
  onRefreshSetting,
  refreshingSettingId,
  onStart
}) {
  return (
    <section className="wizard-card app-setup" aria-labelledby="app-setup-title">
      <p className="eyebrow">Préparation</p>
      <h2 id="app-setup-title">Ajuste l’IA et le Soi avant de commencer.</h2>

      <details className="ai-submenu" open>
        <summary>AI</summary>
        <div className="ai-settings-grid">
          {aiSliders.map((slider) => (
            <SliderSetting
              key={slider.id}
              group="ai"
              slider={slider}
              value={aiSettings[slider.id]}
              onChange={onAiSettingChange}
              onRefresh={onRefreshSetting}
              isRefreshing={refreshingSettingId === `ai:${slider.id}`}
              isDisabled={Boolean(refreshingSettingId)}
            />
          ))}
        </div>
      </details>

      <details className="ai-submenu" open>
        <summary>Soi</summary>
        <div className="ai-settings-grid">
          {beingSliders.map((slider) => (
            <SliderSetting
              key={slider.id}
              group="being"
              slider={slider}
              value={beingSettings[slider.id]}
              onChange={onBeingSettingChange}
              onRefresh={onRefreshSetting}
              isRefreshing={refreshingSettingId === `being:${slider.id}`}
              isDisabled={Boolean(refreshingSettingId)}
            />
          ))}
        </div>
      </details>

      <button type="button" className="primary-action" onClick={onStart}>Commencer</button>
    </section>
  )
}

function WizardMenu({
  onHome,
  showAiDebug,
  onShowAiDebugChange,
  creatiaMenu
}) {
  const [showCreatiaHealthDetails, setShowCreatiaHealthDetails] = useState(false)
  const creatiaHealthcheck = creatiaMenu?.healthcheck
  const creatiaHealthLabel = creatiaHealthcheck?.status === 'verified' ? 'Application vérifiée' : creatiaHealthcheck?.failedCount ? 'Contrôles incomplets' : creatiaHealthcheck?.checks?.length ? 'Contrôles à vérifier' : 'Aucun contrôle'

  return (
    <details className="wizard-menu compact-menu">
      <summary aria-label="Menu" title="Menu">
        <span className="hamburger-icon" aria-hidden="true"><span /><span /><span /></span>
      </summary>

      <div className="menu-actions">
        <button type="button" className="menu-home-action" onClick={onHome}>Accueil</button>
      </div>



      {creatiaMenu ? (
        <div className="menu-evolutia-panels">
          <details className="ai-submenu">
            <summary>Journal IA</summary>
            {creatiaMenu.journal?.length ? (
              <ol className="menu-journal-list">
                {creatiaMenu.journal.map((entry) => (
                  <li key={entry.id} className={entry.type}>
                    <strong>{entry.title}</strong>
                    <time dateTime={entry.timestamp}>{new Date(entry.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time>
                  </li>
                ))}
              </ol>
            ) : <small>Aucun appel Creatia pour le moment.</small>}
          </details>

          <details className="ai-submenu">
            <summary>Étapes IA</summary>
            {creatiaMenu.steps?.length ? (
              <ol className="menu-journal-list">
                {creatiaMenu.steps.map((entry) => <li key={entry.id}><strong>{entry.title}</strong><time dateTime={entry.timestamp}>{new Date(entry.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time></li>)}
              </ol>
            ) : <small>Aucune étape enregistrée.</small>}
          </details>

          {creatiaMenu.pipeline ? (
            <details className="ai-submenu">
              <summary>Chemin technique</summary>
              <strong>{creatiaMenu.pipeline.strategy.label}</strong>
              <small>{creatiaMenu.pipeline.strategy.description}</small>
            </details>
          ) : null}

          {creatiaHealthcheck ? (
            <details className="ai-submenu">
              <summary>Contrôles de test</summary>
              <strong>{creatiaHealthLabel}</strong>
              <small>{creatiaHealthcheck.passedCount ?? creatiaHealthcheck.checks.filter((check) => check.ok).length}/{creatiaHealthcheck.checks.length} validés</small>
              <div className="menu-health-actions">
                <button type="button" className="ghost-action" onClick={() => setShowCreatiaHealthDetails((visible) => !visible)}>{showCreatiaHealthDetails ? 'Masquer' : 'View details'}</button>
                <button type="button" className="ghost-action" onClick={creatiaMenu.healthcheckActions?.retry} disabled={creatiaMenu.healthcheckActions?.isBusy}>Retry</button>
                <button type="button" className="ghost-action" onClick={creatiaMenu.healthcheckActions?.copyPrompt} disabled={!creatiaMenu.healthcheckActions?.canCopyPrompt}>Copy Runtime Prompt</button>
                <button type="button" className="primary-action" onClick={creatiaMenu.healthcheckActions?.repair} disabled={creatiaMenu.healthcheckActions?.isBusy || !creatiaMenu.healthcheckActions?.canRepair}>Repair</button>
              </div>
              {showCreatiaHealthDetails ? (
                <ul className="menu-health-details">
                  {creatiaHealthcheck.checks.map((check) => (
                    <li key={check.id} className={check.ok ? 'passed' : 'failed'}><strong>{check.ok ? '✓' : '×'} {check.id}</strong><span>{check.message}</span>{!check.ok ? <small>{check.expected} · {check.actual}</small> : null}</li>
                  ))}
                </ul>
              ) : null}
            </details>
          ) : null}
        </div>
      ) : null}

      <label className="debug-toggle">
        <input
          type="checkbox"
          checked={showAiDebug}
          onChange={(event) => onShowAiDebugChange(event.target.checked)}
        />
        <span>Connexion IA</span>
      </label>
    </details>
  )
}

function AiDebugFooter({ debugRows }) {
  return (
    <footer className="ai-debug-footer ai-debug-panel" aria-live="polite">
      <strong>Connexion IA</strong>
      {debugRows.length ? (
        <dl>
          {debugRows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="ai-debug-empty">Aucune donnee IA pour le moment.</p>
      )}
    </footer>
  )
}

function SliderSetting({ group, slider, value, onChange, onRefresh, isRefreshing, isDisabled }) {
  return (
    <div className="ai-setting-row">
      <label className="ai-setting">
        <span>{slider.label}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(event) => onChange(slider.id, event.target.value)}
        />
        <small>
          <span>{slider.left}</span>
          <span>{slider.right}</span>
        </small>
      </label>
      <button
        type="button"
        className="refresh-answer-action setting-refresh-action"
        onClick={() => onRefresh(group, slider)}
        disabled={isDisabled}
        aria-label={`Renouveler le curseur ${slider.label} avec l IA`}
        title="Renouveler ce curseur avec l'IA"
      >
        {isRefreshing ? '...' : 'AI+'}
      </button>
    </div>
  )
}
