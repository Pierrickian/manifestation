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
  if (kind === 'html_app') return buildHtmlAppPrompt(context)
  if (kind?.startsWith('narratia_')) return buildNarratiaPrompt(context)
  if (kind === 'mes_questions_quiz') return buildMesQuestionsPrompt(context)
  if (kind === 'enigmia_riddle') return buildEnigmiaPrompt(context)
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
        `Génère exactement ${Number(context.questionCount || 5)} questions, pas une de plus ni une de moins.`,
        `Chaque question doit être adaptée à un enfant de ${Number(context.age || 7)} ans, bienveillante, claire, et avoir exactement 3 réponses possibles.`,
        'Ne donne jamais la bonne réponse dans l’énoncé.',
        'Champs obligatoires: id, subject, question, answers, correctAnswerId.',
        'answers contient exactement trois objets { id, text }; correctAnswerId correspond à un id existant.',
        'Répartis les questions sur les matières demandées et reste pertinent pour chaque matière.',
        'Ne réutilise pas les exemples ci-dessous comme contenu sauf si le sujet mathématiques le justifie.'
      ].join('\n')
    },
    {
      role: 'user',
      content: JSON.stringify({
        kind: 'mes_questions_quiz',
        task: 'Créer un quiz Mes Questions en utilisant l’IA, avec des questions originales et adaptées.',
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


function buildEnigmiaPrompt(context = {}) {
  const lastRiddle = Array.isArray(context.previousRiddles) ? context.previousRiddles.at(-1) : null
  const antiRepetitionRules = lastRiddle
    ? [
        `Historique de la dernière énigme: objet="${lastRiddle.object}", contenants="${(lastRiddle.containers || []).join(', ')}", réponse gagnante="${lastRiddle.solution}".`,
        'À partir de cette deuxième énigme consécutive, ne répète pas le nom de l’objet précédent.',
        'Ne répète aucun nom de contenant précédent.',
        `Ne répète pas la même réponse gagnante: la dernière réponse gagnante était ${lastRiddle.solution}.`
      ]
    : []
  const validatedPrompt = `Tu es un générateur d’énigmes logiques.
Crée une énigme avec 3 contenants.
Méthode obligatoire, dans cet ordre strict :
Choisis un thème, trois contenants adaptés et un objet à trouver.
Les lettres A, B, C servent uniquement à la construction logique interne.
Pour l’énigme affichée au joueur :
attribue à chaque contenant un nom descriptif unique et thématique ;
n’utilise pas les lettres A, B, C dans la narration ;
les noms doivent être cohérents avec le thème choisi ;
ils peuvent être basés sur une couleur, une matière, un symbole, un état, une décoration, une caractéristique visuelle ou tout autre élément pertinent.
Les exemples suivants sont uniquement des exemples et ne doivent pas limiter la créativité :
pirates : coffre vermoulu, coffre cerclé de cuivre, coffre noirci ;
alchimie : flacon d’obsidienne, fiole argentée, ampoule de cristal ;
espace : capsule écarlate, capsule ivoire, capsule cobalt ;
temple : porte gravée, porte dorée, porte fissurée.
Tu peux inventer librement d’autres thèmes, objets et descriptions.
Choisis une coordonnée aléatoire (ligne, colonne).
La ligne est la solution : Objet=A, Objet=B ou Objet=C.
La colonne est le contenant dont l’inscription est la seule vraie sur cette ligne.
Construis uniquement une table 3×3 de V/F.
Colonnes = inscriptions portées par les contenants A, B, C.
Lignes = hypothèses :
Objet=A
Objet=B
Objet=C
Contraintes obligatoires :
la ligne solution contient exactement 1 V ;
ce V est dans la colonne choisie ;
les deux autres lignes contiennent exactement 2 V ;
total général = 5 V.
Vérifie la table.
Pour chaque ligne, affiche le nombre de V.
Vérifie que :
la ligne solution contient exactement 1 V ;
les deux autres lignes contiennent exactement 2 V ;
le total général vaut exactement 5 V.
Déduis les inscriptions uniquement à partir des colonnes.
Lis chaque colonne de haut en bas dans l’ordre :
Objet=A
Objet=B
Objet=C
Correspondances obligatoires :
VFF → « L’objet est dans A »
FVF → « L’objet est dans B »
FFV → « L’objet est dans C »
FVV → « L’objet n’est pas dans A »
VFV → « L’objet n’est pas dans B »
VVF → « L’objet n’est pas dans C »
Règles supplémentaires :
ne jamais inventer une inscription ;
ne jamais écrire une inscription avant d’avoir validé la table ;
chaque inscription doit être exactement la traduction de sa colonne ;
les trois colonnes doivent être différentes ;
les trois inscriptions doivent donc être différentes ;
si deux colonnes sont identiques, reconstruis la table avant de continuer ;
ne jamais modifier une inscription pour des raisons de style ou de narration ;
la logique de la table est prioritaire sur tout le reste.
Convertis ensuite les références A, B, C vers les noms descriptifs des contenants.
Exemple :
Si une inscription déduite est :
« L’objet est dans A »
et que le contenant A est nommé « coffre noirci »,
alors l’inscription affichée devient :
« L’objet est dans le coffre noirci ».
Cette conversion doit être faite uniquement après la déduction logique des inscriptions.
Affiche le résultat dans cet ordre exact :
thème ;
objet recherché ;
coordonnée choisie ;
table validée ;
lecture des colonnes ;
correspondance entre A/B/C et les contenants descriptifs ;
énigme avec les inscriptions converties ;
solution finale avec le nom descriptif du contenant.
Ne révèle aucune étape intermédiaire autre que celles demandées.
Ne t’arrête jamais aux exemples fournis dans ce prompt : ils servent uniquement d’illustration. Invente librement de nouveaux thèmes, objets et contenants descriptifs tout en respectant strictement la méthode logique ci-dessus.`

  return [
    {
      role: 'system',
      content: [
        validatedPrompt,
        ...antiRepetitionRules,
        'Réponds uniquement en JSON valide, sans Markdown.',
        'Le champ riddle.puzzle doit contenir seulement la narration jouable, sans dévoiler la table ni la solution.',
        'Inclue aussi les champs de vérification demandés dans auditTrail pour conserver la méthode validée hors de la narration joueur.'
      ].join('\n\n')
    },
    {
      role: 'user',
      content: JSON.stringify({
        kind: 'enigmia_riddle',
        task: 'Créer une nouvelle énigme Enigmia logique, originale et directement jouable.',
        context,
        expectedShape: {
          riddle: {
            theme: 'string',
            object: 'string',
            coordinate: { row: 'Objet=A|Objet=B|Objet=C', column: 'A|B|C' },
            table: [['F', 'V', 'V'], ['F', 'F', 'V'], ['V', 'V', 'F']],
            columnReadings: [{ containerId: 'A', pattern: 'VFF|FVF|FFV|FVV|VFV|VVF', internalStatement: 'string', convertedStatement: 'string' }],
            containers: [{ id: 'A', name: 'string' }, { id: 'B', name: 'string' }, { id: 'C', name: 'string' }],
            puzzle: 'string',
            statements: [{ containerId: 'A', containerName: 'string', text: 'string' }],
            choices: [{ id: 'A', containerName: 'string' }, { id: 'B', containerName: 'string' }, { id: 'C', containerName: 'string' }],
            solution: 'A|B|C',
            solutionContainerName: 'string',
            auditTrail: ['string']
          }
        }
      })
    }
  ]
}


function buildHtmlAppPrompt(context = {}) {
  return [
    {
      role: 'system',
      content: [
        'You generate complete standalone HTML applications for Creatia.',
        'Return ONLY valid JSON: { "html": string, "systemPrompt": string, "state": object, "suggestedActions": array }.',
        'The html field must contain a complete self-contained HTML5 document runnable offline with embedded CSS and JavaScript.',
        'Generated applications must be self-contained.',
        'Prefer browser-native technologies.',
        'Avoid external libraries whenever possible.',
        'A downloaded HTML file should continue to work offline after export.',
        'The app must support mobile, touch, scrolling, dark mode, Canvas/SVG/WebGL when useful.',
        'Do not use external dependencies or remote assets unless the user explicitly requested them.'
      ].join('\n')
    },
    {
      role: 'user',
      content: String(context.prompt || '')
    }
  ]
}
