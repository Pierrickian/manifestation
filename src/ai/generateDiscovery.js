function formatList(items) {
  if (!items?.length) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`
}

export function generateDiscovery({ feeling, answers = [], discovery }) {
  const dominantNeed = discovery?.dominantNeed
  if (!dominantNeed) {
    return 'Une piste commence à apparaître, mais elle demande encore un peu de chemin.'
  }

  const linkedNeeds = discovery.linkedNeeds || []
  const lastAnswer = answers.at(-1)
  const linkedLabels = linkedNeeds.map((need) => need.needLabel.toLowerCase())

  return [
    `À partir de "${feeling?.label?.toLowerCase()}", ce chemin semble peut-être pointer vers ${dominantNeed.needLabel.toLowerCase()}.`,
    linkedLabels.length > 0
      ? `Une piste possible relie ${formatList(dominantNeed.needs.slice(0, 2))} à ${formatList(linkedLabels)}, surtout autour de "${lastAnswer?.label || 'ce dernier choix'}".`
      : dominantNeed.guidance
  ].join(' ')
}
