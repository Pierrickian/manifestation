import { NEEDS } from '../data/needs.js'

const toneRules = [
  'Ne jamais imposer une verite.',
  'Ne jamais ecrire "tu es" ou "la verite est".',
  'Utiliser des formulations comme "il semble peut-etre", "une piste possible", "ce chemin peut pointer vers".',
  'Rester doux, intelligent, sensible, concret, non intrusif.',
  'Tutoyer le joueur dans tous les modes. Ne jamais utiliser "vous", "votre" ou "vos".',
  'Eviter les cliches spirituels, les promesses et le ton de gourou.',
  'Eviter les tics de langage repetes: pas de suite de questions construites sur "dans ce moment", "en observant", "en regardant", "quelle petite", "pourrait doucement".',
  'Utiliser les mots "doucement", "petit/petite", "lumiere" et "interieur" avec parcimonie: jamais comme structure automatique.'
]

const questionVariationRules = [
  'Comparer la nouvelle question a context.previousQuestions et aux question champs de context.answers.',
  'Ne jamais reprendre la meme amorce, le meme verbe directeur ou la meme metaphore qu une question recente.',
  'Varier les angles dans cet ordre si possible: corps, situation concrete, relation, besoin, part de soi, limite, choix, geste praticable, sens.',
  'Si le ressenti de depart revient dans plusieurs questions, le nommer autrement ou ne pas le nommer.',
  'Ne pas repeter le besoin dominant dans chaque question: le faire parfois sentir par une image concrete ou une action.',
  'Les reponses peuvent rester poetiques, mais la question doit rester specifique et nettement differente des precedentes.'
]

export function buildPrompt(kind, context) {
  if (kind?.startsWith('narratia_')) return buildNarratiaPrompt(context)
  if (kind === 'mes_questions_quiz') return buildMesQuestionsPrompt(context)
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
        `Regles de variation des questions:\n${questionVariationRules.map((rule) => `- ${rule}`).join('\n')}`,
        'Reponds uniquement en JSON valide, sans Markdown.',
        'Renvoie les donnees finales demandees, jamais un schema JSON.',
        'Ne renvoie jamais les champs type, properties, schema ou json_schema comme objet principal.'
      ].join('\n\n')
    },
    {
      role: 'user',
      content: JSON.stringify({
        kind,
        task: getTask(kind),
        expectedShape: getExpectedShape(kind),
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
      'Si context.ruleId vaut emotional-reconciliation, la reponse doit rester dans le meme type de choix emotionnel que context.prompt.question.',
      'Reponds avec un objet answer contenant id, label, needId et scores.'
    ].join(' ')
  }

  if (kind === 'question') {
    return [
      'Genere une question courte et 3 a 5 reponses naturelles. Chaque reponse doit contenir label, needId et scores.',
      'Evite les questions interchangeables: chaque question doit avoir un role net, une image mentale differente et un verbe principal different de la question precedente.',
      'Avant de repondre, inspecte context.previousQuestions: si ta question pourrait etre confondue avec l une d elles, change d angle.',
      'N utilise pas deux fois la meme ouverture dans une session, notamment "Dans ce moment", "En observant", "En regardant", "En quoi cette".',
      'N utilise pas "doucement" dans la question si une question precedente le contient deja.',
      'Si context.ruleId vaut emotional-reconciliation et context.phase vaut 0, genere uniquement des boutons de lexique emotionnel adaptes a context.phaseZeroStep.',
      'Pour phaseZeroStep positive-emotion: 5 emotions positives longtemps non ressenties.',
      'Pour phaseZeroStep negative-emotion: 5 emotions negatives qui submergent.',
      'Pour phaseZeroStep opposite-positive-emotion: 5 emotions positives opposees a context.reconciliation.negativeEmotion, avec des nuances proches mais non synonymes plates.',
      'Si context.ruleId vaut emotional-reconciliation et context.phase vaut 1, les 2 questions doivent cerner ce que procure context.reconciliation.positiveEmotion: une question sur le corps/etat interne, une question sur la relation au monde.',
      'Si context.ruleId vaut emotional-reconciliation et context.phase vaut 2, les 2 questions doivent reconnaitre la part de soi qui n emet pas assez cette emotion comme une part un peu oubliee, jamais fautive.',
      'Si context.ruleId vaut emotional-reconciliation et context.phase vaut 3, les 2 questions doivent reconnaitre la part qui emet l emotion negative opposee comme une part en manque d amour, chargee de signaler sans l avoir choisi, et inviter les deux parts main dans la main dans la vibration positive.',
      'Si context.phase vaut 2 dans la regle default, la question doit approfondir discretement la prise de conscience selon context.phaseChoice.',
      'Si context.phase vaut 3 dans la regle default, la question doit etre plus orientee resolution de probleme, solution ou prise d acte, avec une force ajustee au profil Etre.'
    ].join(' ')
  }

  if (kind === 'discovery') {
    return 'Reformule une decouverte sensible en 2 phrases maximum, avec des liens possibles entre besoins.'
  }

  if (kind === 'links') {
    return 'Propose 2 a 4 liens possibles entre les besoins dominants et les reponses du chemin.'
  }

  if (kind === 'settings') {
    return [
      'Renouvelle un curseur de personnalisation.',
      'Reponds avec slider: id identique a context.slider.id, label court, left et right comme deux extremes opposes, value entre 0 et 100.',
      'Les extremes doivent etre utiles pour personnaliser l experience, pas seulement decoratifs.',
      'Le curseur doit tutoyer implicitement le joueur sans employer "vous".'
    ].join(' ')
  }

  if (kind === 'flow') {
    return [
      'Genere un buffer de 12 a 18 mots courts pour un mode Flow plein ecran.',
      'Les mots doivent reagir aux mots deja choisis dans context.selectedWords et anticiper 2 ou 3 questions implicites que le joueur pourrait se poser.',
      'Chaque item contient id, word, question, x, y, size, duration et delay.',
      'x et y sont des nombres entre 0 et 100, size entre 0.75 et 1.35, duration entre 6 et 13, delay entre -5 et 0.',
      'Ajoute conclusion seulement si context.selectedWords contient au moins 10 choix; conclusion tient en une phrase et tutoie.'
    ].join(' ')
  }

  return 'Genere une variation utile pour le wizard.'
}

function getExpectedShape(kind) {
  if (kind === 'answer') return { answer: { id: 'string', label: 'string', needId: 'string', scores: { needId: 'number' } } }
  if (kind === 'question') return { question: 'string', answers: [{ id: 'string', label: 'string', needId: 'string', scores: { needId: 'number' } }] }
  if (kind === 'discovery') return { text: 'string' }
  if (kind === 'links') return { needLinks: [], pathLinks: [] }
  if (kind === 'settings') return { slider: { id: 'string', label: 'string', left: 'string', right: 'string', value: 'number' } }
  if (kind === 'flow') return { words: [], conclusion: 'string' }
  return { result: 'object' }
}


function buildNarratiaPrompt(context = {}) {
  return [
    {
      role: 'system',
      content: context.systemPrompt || 'You create safe child-facing structured story JSON.'
    },
    {
      role: 'user',
      content: JSON.stringify(context.prompt || {}, null, 2)
    }
  ]
}


function buildMesQuestionsPrompt(context = {}) {
  return [
    {
      role: 'system',
      content: [
        'Tu crées un quiz éducatif en français pour enfant.',
        'Réponds uniquement en JSON valide, sans Markdown.',
        'Génère exactement le nombre de questions demandé.',
        'Chaque question doit être adaptée à l’âge, bienveillante, claire, et avoir exactement 3 réponses possibles.',
        'Ne donne jamais la bonne réponse dans l’énoncé.',
        'Champs obligatoires: id, subject, question, answers, correctAnswerId.',
        'answers contient exactement trois objets { id, text }; correctAnswerId correspond à un id existant.'
      ].join('\n')
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'Créer un quiz Mes Questions.',
        age: context.age,
        questionCount: context.questionCount,
        subjects: context.subjects,
        expectedShape: {
          questions: [
            {
              id: 'q1',
              subject: 'mathematiques',
              question: 'Combien font 3 + 4 ?',
              answers: [
                { id: 'a', text: '6' },
                { id: 'b', text: '7' },
                { id: 'c', text: '8' }
              ],
              correctAnswerId: 'b'
            }
          ]
        }
      })
    }
  ]
}
