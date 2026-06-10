import { NEEDS } from '../data/needs.js'

const toneRules = [
  'Ne jamais imposer une verite.',
  'Ne jamais ecrire "tu es" ou "la verite est".',
  'Utiliser des formulations comme "il semble peut-etre", "une piste possible", "ce chemin peut pointer vers".',
  'Rester doux, intelligent, sensible, concret, non intrusif.',
  'Eviter les cliches spirituels, les promesses et le ton de gourou.'
]

export function buildPrompt(kind, context) {
  const needsSummary = NEEDS.map((need) => {
    return `${need.name}: ${need.needs.join(', ')}`
  }).join('\n')
  const aiSettingsRules = getAiSettingsRules(context?.aiSettings)
  const beingSettingsRules = getBeingSettingsRules(context?.beingSettings)

  return [
    {
      role: 'system',
      content: [
        'Tu aides a generer une couche de variation pour un wizard d exploration interieure.',
        'Le systeme de besoins et couleurs reste la structure centrale. Tu proposes seulement des pistes.',
        `Besoins disponibles:\n${needsSummary}`,
        `Reglages utilisateur IA:\n${aiSettingsRules.map((rule) => `- ${rule}`).join('\n')}`,
        `Profil utilisateur Etre:\n${beingSettingsRules.map((rule) => `- ${rule}`).join('\n')}`,
        `Regles de ton:\n${toneRules.map((rule) => `- ${rule}`).join('\n')}`,
        'Reponds uniquement en JSON valide, sans Markdown.'
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

function getBeingSettingsRules(settings = {}) {
  const commitment = Number(settings.commitment ?? 34)
  const openness = Number(settings.openness ?? 58)
  const sensitivity = Number(settings.sensitivity ?? 54)
  const autonomy = Number(settings.autonomy ?? 62)

  return [
    commitment < 40
      ? 'Le joueur a une propension faible a accepter un engagement: privilegier des constats, des essais reversibles et des formulations non contraignantes.'
      : commitment > 65
        ? 'Le joueur peut accepter un engagement plus net: proposer des questions qui menent vers un choix concret et assumable.'
        : 'Le joueur peut accepter un engagement souple: viser une decision praticable, sans rigidite.',
    openness < 40
      ? 'Le joueur est prudent face a la nouveaute: rester proche de ce qui est deja visible dans ses reponses.'
      : openness > 65
        ? 'Le joueur est curieux: ouvrir des pistes plus exploratoires et creatrices.'
        : 'Le joueur peut explorer, mais avec un cadre clair.',
    sensitivity > 65
      ? 'Le joueur est sensible: garder une grande delicatesse, surtout quand la question touche une prise de conscience.'
      : 'Le joueur peut recevoir des formulations relativement directes si elles restent respectueuses.',
    autonomy > 65
      ? 'Le joueur valorise son autonomie: formuler les questions comme des choix qu il garde en main.'
      : 'Le joueur peut etre accompagne plus explicitement dans le raisonnement.'
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
    return [
      'Genere une question courte et 3 a 5 reponses naturelles. Chaque reponse doit contenir label, needId et scores.',
      'Si context.phase vaut 2, la question doit approfondir discretement la prise de conscience selon context.phaseChoice.',
      'Si context.phase vaut 3, la question doit etre plus orientee resolution de probleme, solution ou prise d acte, avec une force ajustee au profil Etre.'
    ].join(' ')
  }

  if (kind === 'discovery') {
    return 'Reformule une decouverte sensible en 2 phrases maximum, avec des liens possibles entre besoins.'
  }

  if (kind === 'links') {
    return 'Propose 2 a 4 liens possibles entre les besoins dominants et les reponses du chemin.'
  }

  return 'Genere une variation utile pour le wizard.'
}
