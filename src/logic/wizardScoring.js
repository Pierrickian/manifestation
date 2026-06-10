import { NEEDS } from '../data/needs.js'

const EMPTY_SCORES = Object.fromEntries(NEEDS.map((need) => [need.id, 0]))

export function addScores(baseScores, addedScores = {}) {
  return Object.entries(addedScores).reduce(
    (scores, [needId, value]) => ({
      ...scores,
      [needId]: (scores[needId] || 0) + value
    }),
    { ...baseScores }
  )
}

export function scorePath(steps) {
  return steps.reduce((scores, step) => addScores(scores, step?.scores), EMPTY_SCORES)
}

export function rankNeeds(scores) {
  return NEEDS.map((need, index) => ({
    ...need,
    score: scores[need.id] || 0,
    order: index
  })).sort((first, second) => second.score - first.score || first.order - second.order)
}

export function getWizardDiscovery(steps) {
  const scores = scorePath(steps)
  const rankedNeeds = rankNeeds(scores)
  const activeNeeds = rankedNeeds.filter((need) => need.score > 0)
  const dominantNeed = activeNeeds[0] || null
  const linkedNeeds = activeNeeds.slice(1, 4)

  return {
    scores,
    rankedNeeds,
    dominantNeed,
    linkedNeeds,
    dominantColor: dominantNeed?.name || null
  }
}

export function createSessionSnapshot({ sessionId, feeling, answers, discovery, links }) {
  return {
    sessionId,
    feeling,
    answers,
    needs: discovery?.rankedNeeds?.filter((need) => need.score > 0) || [],
    links,
    discovery,
    timestamp: new Date().toISOString()
  }
}
