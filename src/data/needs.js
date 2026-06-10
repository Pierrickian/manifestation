export const NEEDS = [
  {
    id: 'violet',
    color: 'Violet',
    label: 'Sens',
    needs: ['sens', 'clarté mentale'],
    state: 'conscience, expansion, ouverture, alignement',
    opposite: 'confusion'
  },
  {
    id: 'indigo',
    color: 'Indigo',
    label: 'Direction',
    needs: ['direction', 'imagination'],
    state: 'écoute, rêve, intuition, perception',
    opposite: 'égarement'
  },
  {
    id: 'blue',
    color: 'Bleu',
    label: 'Liberté',
    needs: ['autonomie', 'liberté', 'expression'],
    state: 'expression, justesse, liberté',
    opposite: 'répression'
  },
  {
    id: 'green',
    color: 'Vert',
    label: 'Lien',
    needs: ['amour', 'lien'],
    state: 'coeur, âme, rayonnement, amour',
    opposite: 'séparation'
  },
  {
    id: 'yellow',
    color: 'Jaune',
    label: 'Valeur',
    needs: ['soi', 'estime', 'amour propre'],
    state: 'foi, confiance, rayonnement intérieur',
    opposite: 'dévalorisation'
  },
  {
    id: 'orange',
    color: 'Orange',
    label: 'Exploration',
    needs: ['découverte', 'apprentissage', 'enrichissement'],
    state: 'unité, partage, grâce, créateur créatif',
    opposite: 'routine'
  },
  {
    id: 'red',
    color: 'Rouge',
    label: 'Support',
    needs: ['évolution', 'sécurité de mouvement', 'support'],
    state: 'stabilité, équilibre, ancrage, mouvement',
    opposite: 'insécurité'
  }
]

export const NEED_BY_ID = Object.fromEntries(NEEDS.map((need) => [need.id, need]))
