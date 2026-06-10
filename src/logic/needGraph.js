export const NEED_LINKS = {
  violet: ['indigo', 'orange', 'blue'],
  indigo: ['violet', 'blue', 'red'],
  blue: ['yellow', 'green', 'indigo'],
  green: ['yellow', 'blue', 'red'],
  yellow: ['green', 'blue', 'red'],
  orange: ['indigo', 'violet', 'red'],
  red: ['green', 'yellow', 'blue']
}

export function getNeedLinks(dominantNeed, linkedNeeds = []) {
  if (!dominantNeed) return []

  const linkedIds = new Set(linkedNeeds.map((need) => need.id))
  return (NEED_LINKS[dominantNeed.id] || []).map((targetId, index) => ({
    id: `${dominantNeed.id}-${targetId}`,
    source: dominantNeed.id,
    target: targetId,
    strength: linkedIds.has(targetId) ? 'active' : index === 0 ? 'suggested' : 'soft'
  }))
}

export function buildPathLinks(steps) {
  return steps.slice(1).map((step, index) => ({
    id: `${steps[index].id}-${step.id}-${index}`,
    from: steps[index].label,
    to: step.label,
    reason: step.question || step.kicker
  }))
}
