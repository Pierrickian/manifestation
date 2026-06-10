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
  const aiSettingsRules = getAiSettingsRules(context?.aiSettings)

  return [
    {
      role: 'system',
      content: [
        'Tu aides à générer une couche de variation pour un wizard d’exploration intérieure.',
        'Le système de besoins et couleurs reste la structure centrale. Tu proposes seulement des pistes.',
        `Besoins disponibles:\n${needsSummary}`,
        `Reglages utilisateur IA:\n${aiSettingsRules.map((rule) => `- ${rule}`).join('\n')}`,
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

function getAiSettingsRules(settings = {}) {
  const intensity = Number(settings.intensity ?? 28)
  const grounding = Number(settings.grounding ?? 35)
  const focus = Number(settings.focus ?? 58)
  const register = Number(settings.register ?? 76)

  return [
    intensity < 40
      ? 'Les reponses doivent etre douces, progressives, peu confrontantes.'
      : intensity > 65
        ? 'Les reponses peuvent etre plus directes, remuantes, avec des formulations qui secouent sans agresser.'
        : 'Les reponses doivent garder une intensite moyenne, claire mais non brusque.',
    grounding < 40
      ? 'Choisir des mots concrets, pratiques, proches du vecu quotidien.'
      : grounding > 65
        ? 'Autoriser un vocabulaire plus spirituel ou symbolique, sans promesse ni posture de gourou.'
        : 'Melanger concret et intuition de facon equilibree.',
    focus < 40
      ? 'Orienter les propositions vers les besoins: soutien, clarte, reconnaissance, liberte, securite.'
      : focus > 65
        ? 'Orienter les propositions vers les emotions ressenties et leurs nuances.'
        : 'Equilibrer les besoins et les emotions dans les choix proposes.',
    register < 40
      ? 'Utiliser un registre familier, direct, parfois un peu cru, sans insulte ni vulgarite gratuite.'
      : register > 65
        ? 'Utiliser un registre soigne, calme, bien eleve.'
        : 'Utiliser un registre naturel et conversationnel.'
  ]
}

function getTask(kind) {
  if (kind === 'answer') {
    return [
      'Remplace uniquement la reponse donnee dans context.answer par une nouvelle reponse naturelle.',
      'La nouvelle reponse doit rester coherente avec context.prompt.question, mais ne doit pas reprendre les labels deja presents dans context.prompt.answers.',
      'Reponds avec un objet answer contenant id, label, needId et scores.'
    ].join(' ')
  }

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
