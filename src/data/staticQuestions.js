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

export const ANSWER_BANK = {
  violet: ['donner du sens à ce que je traverse', 'comprendre ce qui se répète', 'mettre de l’ordre dans mes pensées'],
  indigo: ['voir une direction possible', 'faire confiance à une intuition', 'imaginer une autre route'],
  blue: ['dire quelque chose de vrai', 'retrouver mon espace', 'choisir plus librement'],
  green: ['me sentir rejoint', 'recevoir une présence douce', 'oser demander du lien'],
  yellow: ['retrouver ma valeur', 'me sentir capable', 'arrêter de me réduire'],
  orange: ['découvrir autre chose', 'réapprendre avec curiosité', 'créer un petit mouvement neuf'],
  red: ['avoir un appui concret', 'avancer plus lentement', 'retrouver une base stable']
}
