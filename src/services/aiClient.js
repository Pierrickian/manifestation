import { generateDiscovery as localDiscovery } from '../ai/generateDiscovery'
import { generateLinks as localLinks } from '../ai/generateLinks'
import { generateQuestion as localQuestion } from '../ai/generateQuestion'

const FALLBACK_SLIDER_PAIRS = {
  intensity: [
    { label: 'Relief', left: 'Apaiser', right: 'Traverser', value: 44 },
    { label: 'Impact', left: 'Effleurer', right: 'Bousculer', value: 38 }
  ],
  grounding: [
    { label: 'Matiere', left: 'Concrete', right: 'Symbolique', value: 48 },
    { label: 'Langage', left: 'Pratique', right: 'Visionnaire', value: 42 }
  ],
  focus: [
    { label: 'Lecture', left: 'Besoin nu', right: 'Emotion vive', value: 55 },
    { label: 'Boussole', left: 'Structure', right: 'Ressenti', value: 62 }
  ],
  register: [
    { label: 'Voix', left: 'Brute', right: 'Delicate', value: 68 },
    { label: 'Style', left: 'Direct', right: 'Soigne', value: 72 }
  ],
  commitment: [
    { label: 'Elan', left: 'Observer', right: 'Agir', value: 46 },
    { label: 'Decision', left: 'Rester libre', right: 'Assumer', value: 52 }
  ],
  openness: [
    { label: 'Champ', left: 'Connu', right: 'Inconnu', value: 58 },
    { label: 'Exploration', left: 'Proteger', right: 'Explorer', value: 64 }
  ],
  sensitivity: [
    { label: 'Peau', left: 'Dense', right: 'Fine', value: 57 },
    { label: 'Reception', left: 'Stable', right: 'Poreuse', value: 61 }
  ],
  autonomy: [
    { label: 'Guidage', left: 'Accepte aide', right: 'Choisis seul', value: 66 },
    { label: 'Souverainete', left: 'Etre accompagne', right: 'Tenir cap', value: 63 }
  ]
}

const FLOW_WORDS_BY_NEED = {
  violet: ['sens', 'silence', 'axe', 'vision', 'clarte', 'reliance', 'trace', 'hauteur'],
  indigo: ['intuition', 'signal', 'route', 'image', 'hypothese', 'reve', 'cap', 'ecoute'],
  blue: ['limite', 'parole', 'espace', 'souffle', 'franchise', 'demande', 'liberte', 'voix'],
  green: ['lien', 'tendresse', 'appui', 'reception', 'paix', 'coeur', 'alliance', 'presence'],
  yellow: ['place', 'valeur', 'audace', 'fierte', 'rayon', 'dignite', 'estime', 'legitimite'],
  orange: ['envie', 'jeu', 'essai', 'mouvement', 'creation', 'chaleur', 'curiosite', 'desir'],
  red: ['base', 'sol', 'rythme', 'corps', 'securite', 'pas', 'ancrage', 'force']
}

const AI_ENDPOINT = '/api/ai'
const AI_REQUEST_TIMEOUT_MS = 20000

async function requestAI(kind, context) {
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS)
  let response

  try {
    response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ kind, context }),
      signal: controller.signal
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('AI request timed out')
      timeoutError.userMessage = 'L’IA a mis plus de 20 secondes à répondre. Relance dans quelques instants.'
      timeoutError.debug = {
        source: 'ai',
        fallbackReason: 'client_timeout',
        timeoutMs: AI_REQUEST_TIMEOUT_MS,
        kind
      }
      throw timeoutError
    }

    throw error
  } finally {
    globalThis.clearTimeout(timeoutId)
  }

  const responseText = await response.text()

  if (!response.ok) {
    let errorPayload = null
    try {
      errorPayload = JSON.parse(responseText)
    } catch {
      errorPayload = null
    }

    const error = new Error(errorPayload?.message || `AI request failed: ${response.status}`)
    error.status = response.status
    error.payload = errorPayload
    error.debug = errorPayload?.debug || null
    error.userMessage = errorPayload?.message || 'La génération IA a échoué. Relance dans quelques instants.'
    throw error
  }

  try {
    return JSON.parse(responseText)
  } catch {
    throw new Error(`AI response was not JSON: ${responseText.slice(0, 120) || 'empty response'}`)
  }
}

function createFallbackDebug(kind, fallbackReason, error, extra = {}) {
  return {
    source: 'local',
    fallbackReason,
    endpoint: AI_ENDPOINT,
    kind,
    errorName: error?.name || 'none',
    errorMessage: error?.message || 'none',
    timestamp: new Date().toISOString(),
    ...extra
  }
}

function withFallbackDebug(payload, kind, fallbackReason, error, extra) {
  const debug = createFallbackDebug(kind, fallbackReason, error, extra)

  return {
    ...payload,
    source: payload?.source || 'local',
    debug: {
      ...debug,
      ...(payload?.debug || {})
    }
  }
}

function createInvalidAiPayloadError(kind, result) {
  return new Error(`Invalid AI ${kind} payload: ${Object.keys(result || {}).join(', ') || 'empty object'}`)
}

function localSliderSuggestion(context = {}) {
  const sliderId = context.slider?.id || 'intensity'
  const pool = FALLBACK_SLIDER_PAIRS[sliderId] || FALLBACK_SLIDER_PAIRS.intensity
  const index = ((context.refreshCount || 0) + Math.floor(Date.now() / 1000)) % pool.length

  return {
    slider: {
      id: sliderId,
      ...pool[index]
    },
    source: 'local',
    debug: {
      source: 'local',
      fallbackReason: 'local_slider_suggestion'
    }
  }
}

function makeFlowItem(word, index, seed = 0) {
  return {
    id: `flow-${Date.now()}-${index}-${word}`,
    word,
    question: `Qu est-ce que "${word}" ouvre pour toi ?`,
    x: (13 + ((index * 19 + seed) % 72)),
    y: (8 + ((index * 29 + seed) % 78)),
    size: 0.86 + (((index + seed) % 5) * 0.08),
    duration: 7 + ((index + seed) % 6),
    delay: ((index + seed) % 4) * -1.2
  }
}

function localFlowWords(context = {}) {
  const dominantNeedId = context.discovery?.dominantNeed?.id || context.dominantNeed?.id || 'red'
  const selected = (context.selectedWords || []).map((item) => item.word || item).filter(Boolean)
  const baseWords = [
    ...(FLOW_WORDS_BY_NEED[dominantNeedId] || FLOW_WORDS_BY_NEED.red),
    ...selected.slice(-5),
    ...(context.answers || []).slice(-4).map((answer) => answer.label)
  ].filter(Boolean)
  const uniqueWords = [...new Set(baseWords)].slice(0, 18)
  const seed = selected.join('').length + Number(context.batch || 0)

  return {
    words: uniqueWords.map((word, index) => makeFlowItem(word, index, seed)),
    conclusion: selected.length >= 10
      ? `Une piste revient: tu sembles chercher un mouvement entre ${selected.slice(-3).join(', ')}.`
      : '',
    source: 'local',
    debug: {
      source: 'local',
      fallbackReason: 'local_flow_words'
    }
  }
}

const QUESTION_STOPWORDS = new Set([
  'avec',
  'cette',
  'dans',
  'elle',
  'entre',
  'etre',
  'faire',
  'peut',
  'plus',
  'pour',
  'quand',
  'quelle',
  'quel',
  'quels',
  'semble',
  'sans',
  'vous',
  'votre',
  'doucement',
  'petite',
  'petit'
])

const OVERUSED_PATTERNS = [
  /dans ce moment de/i,
  /en observant/i,
  /en regardant/i,
  /quelle petite/i,
  /quel petit/i,
  /pourrait doucement/i,
  /semble doucement/i,
  /lumi[eè]re/i
]

function normalizeQuestionText(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getQuestionWords(question) {
  return normalizeQuestionText(question)
    .split(' ')
    .filter((word) => word.length > 3 && !QUESTION_STOPWORDS.has(word))
}

function getQuestionSimilarity(question, previousQuestion) {
  const words = new Set(getQuestionWords(question))
  const previousWords = new Set(getQuestionWords(previousQuestion))

  if (!words.size || !previousWords.size) return 0

  const shared = [...words].filter((word) => previousWords.has(word)).length
  return shared / Math.min(words.size, previousWords.size)
}

function hasRepeatedOpening(question, previousQuestions) {
  const opening = normalizeQuestionText(question).split(' ').slice(0, 4).join(' ')
  if (!opening) return false

  return previousQuestions.some((previousQuestion) => {
    const previousOpening = normalizeQuestionText(previousQuestion).split(' ').slice(0, 4).join(' ')
    return previousOpening === opening
  })
}

function hasOverusedPattern(question, previousQuestions) {
  return OVERUSED_PATTERNS.some((pattern) => {
    if (!pattern.test(question)) return false
    return previousQuestions.some((previousQuestion) => pattern.test(previousQuestion))
  })
}

function getPreviousQuestions(context) {
  return [
    ...(context?.previousQuestions || []),
    ...(context?.answers || []).map((answer) => answer.question)
  ].filter(Boolean)
}

function shouldRepairQuestion(question, context) {
  const previousQuestions = getPreviousQuestions(context)
  if (!previousQuestions.length) return false

  return previousQuestions.some((previousQuestion) => getQuestionSimilarity(question, previousQuestion) > 0.52) ||
    hasRepeatedOpening(question, previousQuestions) ||
    hasOverusedPattern(question, previousQuestions)
}

function repairQuestionIfNeeded(result, context) {
  if (!result?.question || !shouldRepairQuestion(result.question, context)) return result

  const localResult = localQuestion(context)

  return {
    ...result,
    question: localResult.question,
    id: `${result.id || localResult.id}-repaired`,
    debug: {
      ...(result.debug || {}),
      questionRepair: 'replaced_repetitive_question'
    }
  }
}

export async function getDynamicQuestion(context) {
  try {
    const result = await requestAI('question', context)
    if (result?.question && Array.isArray(result.answers)) {
      return repairQuestionIfNeeded({
        ...result,
        source: result.source || result.debug?.source || 'ai',
        debug: {
          source: 'ai',
          fallbackReason: 'none',
          endpoint: AI_ENDPOINT,
          kind: 'question',
          ...(result.debug || {})
        }
      }, context)
    }

    return withFallbackDebug(
      localQuestion(context),
      'question',
      'invalid_ai_payload',
      createInvalidAiPayloadError('question', result)
    )
  } catch (error) {
    // The local engine keeps the wizard alive when the server key is absent.
    return withFallbackDebug(localQuestion(context), 'question', 'client_request_failed', error)
  }
}

export async function getReplacementAnswer(context) {
  const result = await requestAI('answer', context)

  return {
    ...result,
    source: result.source || result.debug?.source || 'ai'
  }
}

export async function getSliderSuggestion(context) {
  try {
    const result = await requestAI('settings', context)
    if (result?.slider) {
      return {
        ...result,
        source: result.source || result.debug?.source || 'ai'
      }
    }
  } catch {
    // Local suggestions keep customization available without waiting on the API.
  }

  return localSliderSuggestion(context)
}

export async function getFlowWords(context) {
  try {
    const result = await requestAI('flow', context)
    if (Array.isArray(result?.words)) {
      return {
        ...result,
        source: result.source || result.debug?.source || 'ai'
      }
    }
  } catch {
    // Flow must stay continuous, so local words are used silently.
  }

  return localFlowWords(context)
}

export async function getDynamicDiscovery(context) {
  try {
    const result = await requestAI('discovery', context)
    if (result?.text) return result.text
  } catch {
    // Fallback stays intentionally quiet for the user.
  }

  return localDiscovery(context)
}

export async function getDynamicLinks(context) {
  try {
    const result = await requestAI('links', context)
    if (result?.needLinks || result?.pathLinks) return result
  } catch {
    // Fallback stays intentionally quiet for the user.
  }

  return localLinks(context)
}


export async function getMesQuestionsQuiz(context) {
  const result = await requestAI('mes_questions_quiz', context)

  if (!Array.isArray(result?.questions)) {
    throw createInvalidAiPayloadError('mes_questions_quiz', result)
  }

  return {
    ...result,
    source: result.source || result.debug?.source || 'ai'
  }
}


export async function getEnigmiaRiddle(context = {}) {
  const result = await requestAI('enigmia_riddle', context)

  if (!result?.riddle?.solution || !Array.isArray(result.riddle?.choices)) {
    throw createInvalidAiPayloadError('enigmia_riddle', result)
  }

  return {
    ...result.riddle,
    debug: result.debug,
    source: result.source || result.debug?.source || 'ai'
  }
}
