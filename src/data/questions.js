export const STARTING_FEELINGS = [
  {
    id: 'lost',
    label: 'Je me sens perdu',
    needIds: ['violet', 'indigo'],
    prompt: 'Qu’est-ce qui manque le plus pour retrouver un axe ?',
    answers: [
      { label: 'Comprendre le sens de ce que je vis', needIds: ['violet'] },
      { label: 'Voir une direction possible', needIds: ['indigo'] },
      { label: 'Avoir un premier pas concret', needIds: ['red'] }
    ]
  },
  {
    id: 'blocked',
    label: 'Je me sens bloqué',
    needIds: ['blue', 'red'],
    prompt: 'Qu’est-ce qui semble empêché ?',
    answers: [
      { label: 'Ce que je veux dire', needIds: ['blue'] },
      { label: 'Ce que je veux faire', needIds: ['blue', 'red'] },
      { label: 'Ma capacité à avancer', needIds: ['red'] }
    ]
  },
  {
    id: 'alone',
    label: 'Je me sens seul',
    needIds: ['green', 'yellow'],
    prompt: 'Dans cette solitude, qu’est-ce qui appelle le plus ?',
    answers: [
      { label: 'Recevoir de l’amour', needIds: ['green'] },
      { label: 'Retrouver ma propre valeur', needIds: ['yellow'] },
      { label: 'Oser demander du lien', needIds: ['green', 'blue'] }
    ]
  },
  {
    id: 'trapped',
    label: 'Je me sens enfermé',
    needIds: ['blue', 'orange'],
    prompt: 'Quelle sortie aurait le plus de vie ?',
    answers: [
      { label: 'Dire quelque chose de vrai', needIds: ['blue'] },
      { label: 'Essayer une autre façon de faire', needIds: ['orange'] },
      { label: 'Retrouver un espace à moi', needIds: ['blue', 'yellow'] }
    ]
  },
  {
    id: 'empty',
    label: 'Je me sens vide',
    needIds: ['orange', 'violet'],
    prompt: 'Quel type de nourriture intérieure manque ?',
    answers: [
      { label: 'Une découverte', needIds: ['orange'] },
      { label: 'Un sens plus grand', needIds: ['violet'] },
      { label: 'Un lien vivant', needIds: ['green'] }
    ]
  },
  {
    id: 'fragile',
    label: 'Je me sens fragile',
    needIds: ['red', 'green'],
    prompt: 'Qu’est-ce qui te soutiendrait maintenant ?',
    answers: [
      { label: 'Un appui concret', needIds: ['red'] },
      { label: 'Une présence douce', needIds: ['green'] },
      { label: 'Moins de pression sur moi', needIds: ['yellow', 'red'] }
    ]
  }
]

export const REFLECTION_QUESTIONS = [
  'Qu’est-ce que cette réponse protège ?',
  'Qu’est-ce qu’elle cherche à faire grandir ?',
  'Quel petit geste rendrait ce besoin plus réel aujourd’hui ?'
]
