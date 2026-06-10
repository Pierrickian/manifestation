import { NEEDS } from '../data/needs.js'

const toneRules = [
  'Ne jamais imposer une vérité.',
  'Ne jamais écrire "tu es" ou "la vérité est".',
  'Utiliser des formulations comme "il semble peut-être", "une piste possible", "ce chemin peut pointer vers".',
  'Rester doux, intelligent, sensible, concret, non intrusif.',
  'Éviter les clichés spirituels, les promesses et le ton de gourou.'
]

export function buildPrompt(kind, context) {
  const needsSummary = NEEDS.map((need) => {
    return `${need.name}: ${need.needs.join(', ')}`
  }).join('\n')

  return [
    {
      role: 'system',
      content: [
        'Tu aides à générer une couche de variation pour un wizard d’exploration intérieure.',
        'Le système de besoins et couleurs reste la structure centrale. Tu proposes seulement des pistes.',
        `Besoins disponibles:\n${needsSummary}`,
        `Règles de ton:\n${toneRules.map((rule) => `- ${rule}`).join('\n')}`,
        'Réponds uniquement en JSON valide, sans Markdown.'
      ].join('\n\n')
    },
    {
      role: 'user',
      content: JSON.stringify({
        kind,
        task: getTask(kind),
        context
      })
    }
  ]
}

function getTask(kind) {
  if (kind === 'question') {
    return 'Génère une question courte et 3 à 5 réponses naturelles. Chaque réponse doit contenir label, needId et scores.'
  }

  if (kind === 'discovery') {
    return 'Reformule une découverte sensible en 2 phrases maximum, avec des liens possibles entre besoins.'
  }

  if (kind === 'links') {
    return 'Propose 2 à 4 liens possibles entre les besoins dominants et les réponses du chemin.'
  }

  return 'Génère une variation utile pour le wizard.'
}
