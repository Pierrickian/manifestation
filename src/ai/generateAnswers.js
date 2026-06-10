import { ANSWER_BANK } from '../data/staticQuestions.js'
import { NEEDS } from '../data/needs.js'

export function generateAnswers({ rankedNeeds = [], stepIndex = 0 }) {
  const activeNeeds = rankedNeeds.filter(Boolean)
  const fallbackNeeds = NEEDS.filter((need) => !activeNeeds.some((activeNeed) => activeNeed.id === need.id))
  const needs = [...activeNeeds, ...fallbackNeeds].slice(0, 4)

  return needs.map((need, index) => {
    const bank = ANSWER_BANK[need.id] || ANSWER_BANK.red
    const label = bank[(stepIndex + index) % bank.length]
    const supportingNeed = needs[(index + 1) % needs.length]

    return {
      id: `${need.id}-${stepIndex}-${index}`,
      label,
      needId: need.id,
      scores: {
        [need.id]: index === 0 ? 3 : 2,
        [supportingNeed.id]: 1
      }
    }
  })
}
