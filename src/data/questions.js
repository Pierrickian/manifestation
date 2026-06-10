export const STARTING_FEELINGS = [
  {
    id: 'lost',
    label: 'Je me sens perdu',
    description: 'Quand tout semble diffus ou difficile à relier.',
    scores: { violet: 2, indigo: 2, red: 1 },
    adaptiveQuestion: 'Qu’est-ce qui manque le plus pour retrouver un axe ?'
  },
  {
    id: 'blocked',
    label: 'Je me sens bloqué',
    description: 'Quand l’élan existe, mais ne trouve plus son passage.',
    scores: { blue: 2, red: 2, yellow: 1 },
    adaptiveQuestion: 'Qu’est-ce qui semble empêché en premier ?'
  },
  {
    id: 'alone',
    label: 'Je me sens seul',
    description: 'Quand le lien, la présence ou la reconnaissance manquent.',
    scores: { green: 2, yellow: 2, blue: 1 },
    adaptiveQuestion: 'Dans cette solitude, qu’est-ce qui appelle le plus ?'
  },
  {
    id: 'trapped',
    label: 'Je me sens enfermé',
    description: 'Quand l’espace intérieur se rétrécit.',
    scores: { blue: 2, orange: 2, red: 1 },
    adaptiveQuestion: 'Quelle sortie aurait le plus de vie ?'
  },
  {
    id: 'empty',
    label: 'Je me sens vide',
    description: 'Quand quelque chose cherche à être nourri ou ravivé.',
    scores: { orange: 2, violet: 2, green: 1 },
    adaptiveQuestion: 'Quel type de nourriture intérieure manque ?'
  },
  {
    id: 'fragile',
    label: 'Je me sens fragile',
    description: 'Quand la douceur, la sécurité ou l’appui deviennent essentiels.',
    scores: { red: 2, green: 2, yellow: 1 },
    adaptiveQuestion: 'Qu’est-ce qui te soutiendrait maintenant ?'
  }
]

export const ADAPTIVE_ANSWERS = {
  lost: [
    { id: 'meaning', label: 'Comprendre le sens de ce que je vis', scores: { violet: 3, indigo: 1 } },
    { id: 'direction', label: 'Voir une direction possible', scores: { indigo: 3, red: 1 } },
    { id: 'first-step', label: 'Avoir un premier pas concret', scores: { red: 3, yellow: 1 } }
  ],
  blocked: [
    { id: 'say', label: 'Ce que je veux dire', scores: { blue: 3, yellow: 1 } },
    { id: 'act', label: 'Ce que je veux faire', scores: { blue: 2, red: 2 } },
    { id: 'advance', label: 'Ma capacité à avancer', scores: { red: 3, indigo: 1 } }
  ],
  alone: [
    { id: 'receive-love', label: 'Recevoir de l’amour', scores: { green: 3, red: 1 } },
    { id: 'own-worth', label: 'Retrouver ma propre valeur', scores: { yellow: 3, green: 1 } },
    { id: 'ask-link', label: 'Oser demander du lien', scores: { green: 2, blue: 2 } }
  ],
  trapped: [
    { id: 'truth', label: 'Dire quelque chose de vrai', scores: { blue: 3, yellow: 1 } },
    { id: 'try-other', label: 'Essayer une autre façon de faire', scores: { orange: 3, indigo: 1 } },
    { id: 'own-space', label: 'Retrouver un espace à moi', scores: { blue: 2, yellow: 2 } }
  ],
  empty: [
    { id: 'discovery', label: 'Une découverte', scores: { orange: 3, indigo: 1 } },
    { id: 'greater-meaning', label: 'Un sens plus grand', scores: { violet: 3, orange: 1 } },
    { id: 'living-link', label: 'Un lien vivant', scores: { green: 3, orange: 1 } }
  ],
  fragile: [
    { id: 'concrete-support', label: 'Un appui concret', scores: { red: 3, green: 1 } },
    { id: 'gentle-presence', label: 'Une présence douce', scores: { green: 3, red: 1 } },
    { id: 'less-pressure', label: 'Moins de pression sur moi', scores: { yellow: 2, red: 2 } }
  ]
}

export const REFLECTION_QUESTIONS = [
  {
    id: 'protect',
    label: 'Qu’est-ce que cette réponse protège ?',
    hint: 'Observe ce qui demande de la sécurité, de la douceur ou du temps.',
    choices: [
      { id: 'security', label: 'Un endroit sûr en moi', scores: { red: 2, green: 1 } },
      { id: 'truth', label: 'Une vérité encore sensible', scores: { blue: 2, yellow: 1 } },
      { id: 'meaning', label: 'Un sens que je n’ai pas encore trouvé', scores: { violet: 2, indigo: 1 } }
    ]
  },
  {
    id: 'grow',
    label: 'Qu’est-ce qu’elle cherche à faire grandir ?',
    hint: 'Choisis la piste qui semble respirer un peu plus que les autres.',
    choices: [
      { id: 'confidence', label: 'La confiance en moi', scores: { yellow: 2, red: 1 } },
      { id: 'relationship', label: 'Un lien plus vivant', scores: { green: 2, blue: 1 } },
      { id: 'curiosity', label: 'La curiosité et l’élan créatif', scores: { orange: 2, indigo: 1 } }
    ]
  },
  {
    id: 'gesture',
    label: 'Quel petit geste rendrait ce besoin plus réel aujourd’hui ?',
    hint: 'Un geste minuscule suffit : il sert seulement à rendre la piste visible.',
    choices: [
      { id: 'name', label: 'Écrire une phrase vraie', scores: { blue: 2, violet: 1 } },
      { id: 'reach', label: 'Demander ou accepter un appui', scores: { green: 2, red: 1 } },
      { id: 'try', label: 'Essayer une action différente', scores: { orange: 2, red: 1 } }
    ]
  }
]
