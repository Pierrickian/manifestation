export const NEEDS = [
  {
    id: 'violet',
    name: 'Violet',
    needLabel: 'Sens & clarté mentale',
    needs: ['sens', 'clarté mentale', 'mise en perspective'],
    positiveState: 'une pensée plus vaste, plus calme et reliée',
    oppositeState: 'confusion, dispersion, perte de sens',
    uiColor: '#b58cff',
    guidance: 'Revenir au sens peut ouvrir un espace plus vaste que le problème lui-même.'
  },
  {
    id: 'indigo',
    name: 'Indigo',
    needLabel: 'Direction & imagination',
    needs: ['direction', 'intuition', 'imagination'],
    positiveState: 'une vision intérieure qui recommence à montrer une route',
    oppositeState: 'égarement, brouillard, absence d’image',
    uiColor: '#7287ff',
    guidance: 'Une direction douce commence souvent par une image, pas par une certitude.'
  },
  {
    id: 'blue',
    name: 'Bleu',
    needLabel: 'Autonomie, liberté & expression',
    needs: ['autonomie', 'liberté', 'expression'],
    positiveState: 'une parole juste et un espace pour respirer',
    oppositeState: 'répression, contrainte, silence intérieur',
    uiColor: '#54c7ff',
    guidance: 'Nommer ce qui veut sortir peut déjà redonner du mouvement.'
  },
  {
    id: 'green',
    name: 'Vert',
    needLabel: 'Amour & lien',
    needs: ['amour', 'lien', 'présence'],
    positiveState: 'une présence chaleureuse, reliée et accueillante',
    oppositeState: 'séparation, isolement, fermeture',
    uiColor: '#6dff9d',
    guidance: 'Le lien peut commencer par une présence minuscule mais vraie.'
  },
  {
    id: 'yellow',
    name: 'Jaune',
    needLabel: 'Soi, estime & amour propre',
    needs: ['soi', 'estime', 'amour propre'],
    positiveState: 'une confiance simple dans sa propre valeur',
    oppositeState: 'dévalorisation, comparaison, effacement',
    uiColor: '#ffe76a',
    guidance: 'Retrouver sa place peut commencer par se croire digne d’attention.'
  },
  {
    id: 'orange',
    name: 'Orange',
    needLabel: 'Découverte, apprentissage & créativité',
    needs: ['découverte', 'apprentissage', 'enrichissement', 'créativité'],
    positiveState: 'une curiosité vivante qui remet de la saveur',
    oppositeState: 'routine, vide, assèchement',
    uiColor: '#ffad5c',
    guidance: 'Une nouvelle réalité intérieure naît parfois d’un essai très petit.'
  },
  {
    id: 'red',
    name: 'Rouge',
    needLabel: 'Évolution, sécurité de mouvement & support',
    needs: ['évolution', 'sécurité de mouvement', 'support'],
    positiveState: 'un ancrage qui permet d’avancer sans se brusquer',
    oppositeState: 'insécurité, fatigue, immobilité',
    uiColor: '#ff6d7a',
    guidance: 'Un support concret peut transformer la peur du mouvement en prochain pas.'
  }
]

export const NEED_BY_ID = Object.fromEntries(NEEDS.map((need) => [need.id, need]))
