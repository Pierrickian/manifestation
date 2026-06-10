import { NEED_BY_ID } from '../data/needs.js'
import { buildPathLinks, getNeedLinks } from '../logic/needGraph.js'

export function generateLinks({ steps = [], discovery }) {
  const needLinks = getNeedLinks(discovery?.dominantNeed, discovery?.linkedNeeds).map((link) => ({
    ...link,
    sourceLabel: NEED_BY_ID[link.source]?.needLabel,
    targetLabel: NEED_BY_ID[link.target]?.needLabel
  }))

  return {
    needLinks,
    pathLinks: buildPathLinks(steps)
  }
}
