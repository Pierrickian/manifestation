export const NEEDS = [
  {
    id: 'violet',
    name: 'Violet',
    needLabel: 'Sens et clarté mentale',
    needs: ['sens', 'clarté mentale', 'conscience', 'expansion'],
    positiveState: 'une pensée plus vaste, plus calme et mieux reliée',
    oppositeState: 'confusion, dispersion, perte de sens',
    uiColor: '#b58cff',
    guidance: 'Revenir au sens peut ouvrir un espace plus vaste que le problème lui-même.'
  },
  {
    id: 'indigo',
    name: 'Indigo',
    needLabel: 'Direction et imagination',
    needs: ['direction', 'imagination', 'intuition', 'perception'],
    positiveState: 'une vision intérieure qui recommence à montrer une route',
    oppositeState: 'égarement, brouillard, absence d’image',
    uiColor: '#7287ff',
    guidance: 'Une direction douce commence souvent par une image, pas par une certitude.'
  },
  {
    id: 'blue',
    name: 'Bleu',
    needLabel: 'Autonomie, liberté et expression',
    needs: ['autonomie', 'liberté', 'expression', 'justesse'],
    positiveState: 'une parole juste et un espace pour respirer',
    oppositeState: 'répression, contrainte, silence intérieur',
    uiColor: '#54c7ff',
    guidance: 'Nommer ce qui veut sortir peut déjà redonner du mouvement.'
  },
  {
    id: 'green',
    name: 'Vert',
    needLabel: 'Amour et lien',
    needs: ['amour', 'lien', 'âme', 'rayonnement'],
    positiveState: 'une présence chaleureuse, reliée et accueillante',
    oppositeState: 'séparation, isolement, fermeture',
    uiColor: '#6dff9d',
    guidance: 'Le lien peut commencer par une présence minuscule mais vraie.'
  },
  {
    id: 'yellow',
    name: 'Jaune',
    needLabel: 'Estime et valeur personnelle',
    needs: ['estime', 'amour propre', 'confiance', 'valeur personnelle'],
    positiveState: 'une confiance simple dans sa propre valeur',
    oppositeState: 'dévalorisation, comparaison, effacement',
    uiColor: '#ffe76a',
    guidance: 'Retrouver sa place peut commencer par se croire digne d’attention.'
  },
  {
    id: 'orange',
    name: 'Orange',
    needLabel: 'Découverte et créativité',
    needs: ['découverte', 'apprentissage', 'enrichissement', 'créativité', 'exploration'],
    positiveState: 'une curiosité vivante qui remet de la saveur',
    oppositeState: 'routine, vide, assèchement',
    uiColor: '#ffad5c',
    guidance: 'Une nouvelle réalité intérieure naît parfois d’un essai très petit.'
  },
  {
    id: 'red',
    name: 'Rouge',
    needLabel: 'Évolution, support et stabilité',
    needs: ['évolution', 'sécurité de mouvement', 'support', 'stabilité'],
    positiveState: 'un ancrage qui permet d’avancer sans se brusquer',
    oppositeState: 'insécurité, fatigue, immobilité',
    uiColor: '#ff6d7a',
    guidance: 'Un support concret peut transformer la peur du mouvement en prochain pas.'
  }
]

export const NEED_BY_ID = Object.fromEntries(NEEDS.map((need) => [need.id, need]))
