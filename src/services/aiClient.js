import { generateDiscovery as localDiscovery } from '../ai/generateDiscovery'
import { generateLinks as localLinks } from '../ai/generateLinks'
import { generateQuestion as localQuestion } from '../ai/generateQuestion'

async function requestAI(kind, context) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, context })
  })

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`)
  }

  return response.json()
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
        source: result.source || result.debug?.source || 'ai'
      }, context)
    }
  } catch (error) {
    // The local engine keeps the wizard alive when the server key is absent.
    return {
      ...localQuestion(context),
      debug: {
        source: 'local',
        fallbackReason: 'client_request_failed',
        errorMessage: error?.message || 'Unable to reach /api/ai'
      }
    }
  }

  return localQuestion(context)
}

export async function getReplacementAnswer(context) {
  const result = await requestAI('answer', context)

  return {
    ...result,
    source: result.source || result.debug?.source || 'ai'
  }
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
