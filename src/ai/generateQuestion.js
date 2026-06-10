import { QUESTION_BANK } from '../data/staticQuestions.js'
import { generateAnswers } from './generateAnswers.js'

export function generateQuestion(context) {
  const dominantNeed = context.discovery?.dominantNeed || context.rankedNeeds?.[0]
  const stepIndex = context.answers?.length || 0
  const needId = dominantNeed?.id || 'red'
  const questions = QUESTION_BANK[needId] || QUESTION_BANK.red
  const question = stepIndex === 0 && context.feeling?.seedQuestion
    ? context.feeling.seedQuestion
    : questions[stepIndex % questions.length]

  return {
    id: `question-${stepIndex}-${needId}`,
    question,
    answers: generateAnswers({
      rankedNeeds: context.discovery?.rankedNeeds || context.rankedNeeds,
      stepIndex
    }),
    source: 'local'
  }
}
