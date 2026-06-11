export const STARTING_FEELINGS = [
  {
    id: 'lost',
    label: 'Je me sens perdu',
    description: 'Quand tout semble diffus ou difficile à relier.',
    scores: { violet: 2, indigo: 2, red: 1 },
    seedQuestion: 'Qu’est-ce qui manque le plus pour retrouver un axe ?'
  },
  {
    id: 'blocked',
    label: 'Je me sens bloqué',
    description: 'Quand l’élan existe, mais ne trouve plus son passage.',
    scores: { blue: 2, red: 2, yellow: 1 },
    seedQuestion: 'Qu’est-ce qui semble empêché en premier ?'
  },
  {
    id: 'alone',
    label: 'Je me sens seul',
    description: 'Quand le lien, la présence ou la reconnaissance manquent.',
    scores: { green: 2, yellow: 2, blue: 1 },
    seedQuestion: 'Dans cette solitude, qu’est-ce qui appelle le plus ?'
  },
  {
    id: 'trapped',
    label: 'Je me sens enfermé',
    description: 'Quand l’espace intérieur se rétrécit.',
    scores: { blue: 2, orange: 2, red: 1 },
    seedQuestion: 'Quelle sortie aurait le plus de vie ?'
  },
  {
    id: 'empty',
    label: 'Je me sens vide',
    description: 'Quand quelque chose cherche à être nourri ou ravivé.',
    scores: { orange: 2, violet: 2, green: 1 },
    seedQuestion: 'Quel type de nourriture intérieure manque ?'
  },
  {
    id: 'fragile',
    label: 'Je me sens fragile',
    description: 'Quand la douceur, la sécurité ou l’appui deviennent essentiels.',
    scores: { red: 2, green: 2, yellow: 1 },
    seedQuestion: 'Qu’est-ce qui te soutiendrait maintenant ?'
  }
]

export const QUESTION_BANK = {
  violet: [
    'Si tu cherchais un peu plus de clarté, qu’aurais-tu besoin de comprendre ?',
    'Qu’est-ce qui semble demander une mise en perspective plus douce ?',
    'Quelle question revient, même discrètement, quand tu fais silence ?'
  ],
  indigo: [
    'Quand tu imagines avancer, qu’est-ce qui semble le plus risqué ?',
    'Quelle direction attire ton attention sans être encore certaine ?',
    'Quelle image intérieure aimerait reprendre de la place ?'
  ],
  blue: [
    'Qu’est-ce qui aurait besoin d’être exprimé avec plus de justesse ?',
    'Où sens-tu que ton espace personnel se contracte ?',
    'Quelle liberté minuscule changerait déjà quelque chose ?'
  ],
  green: [
    'Quel type de lien serait le plus réparateur maintenant ?',
    'Qu’aimerais-tu recevoir sans devoir le mériter ?',
    'Quelle présence te manque le plus dans ce moment ?'
  ],
  yellow: [
    'Qu’est-ce qui touche le plus ton sentiment de valeur ?',
    'Où aimerais-tu te croire un peu plus légitime ?',
    'Quelle part de toi demande moins de comparaison ?'
  ],
  orange: [
    'Qu’est-ce qui pourrait remettre un peu de curiosité dans ce paysage ?',
    'Quelle nouveauté te ferait respirer sans te brusquer ?',
    'Qu’aurais-tu envie d’explorer si le résultat comptait moins ?'
  ],
  red: [
    'De quel appui concret aurais-tu besoin pour bouger sans te forcer ?',
    'Qu’est-ce qui rendrait le prochain pas plus stable ?',
    'Quelle sécurité simple manque au mouvement que tu imagines ?'
  ]
}

export const POSITIVE_EMOTIONS = [
  { id: 'peace', label: 'Paix', needId: 'red', scores: { red: 3, green: 1 } },
  { id: 'joy', label: 'Joie simple', needId: 'orange', scores: { orange: 3, yellow: 1 } },
  { id: 'confidence', label: 'Confiance', needId: 'yellow', scores: { yellow: 3, red: 1 } },
  { id: 'tenderness', label: 'Tendresse', needId: 'green', scores: { green: 3, blue: 1 } },
  { id: 'clarity', label: 'Clarte', needId: 'violet', scores: { violet: 3, indigo: 1 } }
]

export const NEGATIVE_EMOTIONS = [
  { id: 'agitation', label: 'Agitation', needId: 'red', scores: { red: 2, blue: 1 } },
  { id: 'anger', label: 'Enervement', needId: 'blue', scores: { blue: 2, yellow: 1 } },
  { id: 'sadness', label: 'Tristesse lourde', needId: 'green', scores: { green: 2, red: 1 } },
  { id: 'fear', label: 'Peur', needId: 'red', scores: { red: 3, indigo: 1 } },
  { id: 'shame', label: 'Honte', needId: 'yellow', scores: { yellow: 3, green: 1 } }
]

export const OPPOSITE_POSITIVE_EMOTIONS = {
  agitation: [
    { id: 'calm', label: 'Calme', needId: 'red', scores: { red: 3, green: 1 } },
    { id: 'serenity', label: 'Serenite', needId: 'violet', scores: { violet: 2, red: 2 } },
    { id: 'grounded-peace', label: 'Paix posee', needId: 'red', scores: { red: 3, blue: 1 } },
    { id: 'inner-silence', label: 'Silence interieur', needId: 'indigo', scores: { indigo: 2, violet: 2 } },
    { id: 'ease', label: 'Aisance', needId: 'orange', scores: { orange: 2, red: 2 } }
  ],
  anger: [
    { id: 'gentleness', label: 'Douceur', needId: 'green', scores: { green: 3, blue: 1 } },
    { id: 'respect', label: 'Respect', needId: 'blue', scores: { blue: 3, yellow: 1 } },
    { id: 'fair-peace', label: 'Paix juste', needId: 'blue', scores: { blue: 2, red: 2 } },
    { id: 'patience', label: 'Patience', needId: 'red', scores: { red: 2, green: 2 } },
    { id: 'understanding', label: 'Comprehension', needId: 'violet', scores: { violet: 3, green: 1 } }
  ],
  sadness: [
    { id: 'warmth', label: 'Chaleur', needId: 'green', scores: { green: 3, orange: 1 } },
    { id: 'hope', label: 'Esperance', needId: 'indigo', scores: { indigo: 3, green: 1 } },
    { id: 'comfort', label: 'Reconfort', needId: 'green', scores: { green: 3, red: 1 } },
    { id: 'lightness', label: 'Legerete', needId: 'orange', scores: { orange: 3, yellow: 1 } },
    { id: 'presence', label: 'Presence', needId: 'green', scores: { green: 2, red: 2 } }
  ],
  fear: [
    { id: 'safety', label: 'Securite', needId: 'red', scores: { red: 3, green: 1 } },
    { id: 'trust', label: 'Confiance', needId: 'yellow', scores: { yellow: 2, red: 2 } },
    { id: 'courage', label: 'Courage doux', needId: 'yellow', scores: { yellow: 3, red: 1 } },
    { id: 'faith', label: 'Foi calme', needId: 'indigo', scores: { indigo: 3, violet: 1 } },
    { id: 'stability', label: 'Stabilite', needId: 'red', scores: { red: 3, blue: 1 } }
  ],
  shame: [
    { id: 'dignity', label: 'Dignite', needId: 'yellow', scores: { yellow: 3, blue: 1 } },
    { id: 'innocence', label: 'Innocence retrouvee', needId: 'green', scores: { green: 3, yellow: 1 } },
    { id: 'self-respect', label: 'Estime de soi', needId: 'yellow', scores: { yellow: 3, red: 1 } },
    { id: 'acceptance', label: 'Accueil', needId: 'green', scores: { green: 2, violet: 2 } },
    { id: 'permission', label: 'Permission d exister', needId: 'blue', scores: { blue: 2, yellow: 2 } }
  ]
}

export const ANSWER_BANK = {
  violet: ['donner du sens à ce que je traverse', 'comprendre ce qui se répète', 'mettre de l’ordre dans mes pensées'],
  indigo: ['voir une direction possible', 'faire confiance à une intuition', 'imaginer une autre route'],
  blue: ['dire quelque chose de vrai', 'retrouver mon espace', 'choisir plus librement'],
  green: ['me sentir rejoint', 'recevoir une présence douce', 'oser demander du lien'],
  yellow: ['retrouver ma valeur', 'me sentir capable', 'arrêter de me réduire'],
  orange: ['découvrir autre chose', 'réapprendre avec curiosité', 'créer un petit mouvement neuf'],
  red: ['avoir un appui concret', 'avancer plus lentement', 'retrouver une base stable']
}
