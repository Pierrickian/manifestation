import { createSlug } from '../utils/narratiaValidation'

export const defaultNarrators = [
  { id: 'virtual_child_a', displayName: 'Mira', personality: 'Curieuse, attentive, elle remarque les petits indices.', voiceHint: 'douce et vive' },
  { id: 'virtual_child_b', displayName: 'Noé', personality: 'Rêveur, calme, il aime les images tendres.', voiceHint: 'lent et chaleureux' },
  { id: 'player_child', displayName: 'Toi', personality: 'L’enfant qui donne à l’histoire son dernier élan.', voiceHint: 'ouvert' },
  { id: 'parent', displayName: 'Lecteur adulte', personality: 'Stable, rassurant et présent.', voiceHint: 'calme' }
]

const choicePools = {
  courage: ['Une lanterne qui brille quand quelqu’un est gentil', 'Un petit bouclier en clair de lune'],
  friendship: ['Un nuage timide qui cherche un ami', 'Deux tasses qui s’entendent de très loin'],
  fear: ['Une cabane de couvertures avec une porte secrète', 'Une petite cloche qui adoucit les ombres'],
  discovery: ['Une carte oubliée', 'Un escalier caché sous un tapis'],
  forgiveness: ['Une tasse fêlée qui rechante', 'Une lettre qui a attendu longtemps'],
  growing_up: ['Des chaussures qui grandissent avec le courage', 'Un pont fait de petits pas'],
  secrets: ['Un tiroir qui chuchote', 'Une enveloppe aux bords tièdes'],
  helping_others: ['Une étoile perdue dans un bocal', 'Un géant fatigué qui cherche son chemin'],
  imagination: ['Un train lumineux', 'Un pinceau qui ouvre des fenêtres'],
  nature: ['Un arbre géant', 'Un renard endormi']
}

export function localChildChoices(parentConfiguration = {}) {
  const themes = parentConfiguration.themes?.length ? parentConfiguration.themes : ['imagination', 'friendship', 'nature']
  const labels = themes.flatMap((theme) => choicePools[theme] || []).concat([
    'Une clé mystérieuse',
    'Une cabane cachée',
    'Un nuage de pluie qui suit les gens',
    'Une lune de poche'
  ])

  const categories = ['magic', 'creature', 'object', 'place', 'atmosphere']
  return {
    childChoices: [...new Set(labels)].slice(0, 10).map((label, index) => ({
      id: createSlug(label, `choice_${index + 1}`),
      label,
      category: categories[index % categories.length]
    })),
    source: 'local'
  }
}

export function localStoryPackage({ parentConfiguration = {}, childSelection = {}, selectedChoices = [] } = {}) {
  const choiceLabels = selectedChoices.map((choice) => choice.label)
  const mainObject = choiceLabels[0] || 'une clé mystérieuse'
  const mainPlace = choiceLabels.find((label) => /cabane|arbre|train|pont|escalier|couvertures/i.test(label)) || 'un arbre géant'
  const gentleWonder = choiceLabels[1] || 'un renard endormi'
  const id = `narratia_${Date.now()}`
  const duration = parentConfiguration.duration || 'short'
  const readingMode = parentConfiguration.readingMode || 'mixed_narration'
  const ageRange = parentConfiguration.ageRange || '6-8'

  return {
    id,
    title: `La promesse de ${mainObject.replace(/^Une /, '').replace(/^Un /, '')}`,
    narrators: defaultNarrators,
    milestones: [
      { id: 1, title: 'La première trouvaille', text: `L’enfant découvre ${mainObject.toLowerCase()} près de ${mainPlace.toLowerCase()}.`, visualHint: 'Une lumière douce autour du premier indice' },
      { id: 2, title: 'Le signe silencieux', text: `Tous les chemins deviennent immobiles jusqu’à ce que ${gentleWonder.toLowerCase()} ouvre un œil.`, visualHint: 'Une pause calme dans un lieu magique' },
      { id: 3, title: 'La porte qui attend', text: 'Une petite porte apparaît là où personne n’avait pensé à regarder.', visualHint: 'Une porte ronde avec une lumière chaude dessous' }
    ],
    segments: [
      { id: 'segment_1', from: 1, to: 2, narrator: 'virtual_child_a', narratorDisplayName: 'Mira', text: `Mira se penche vers le chemin et remarque que ${mainObject.toLowerCase()} est tiède, comme si elle attendait des mains gentilles. Elle propose d’avancer lentement, en comptant chaque son ami, jusqu’à ce que le silence ressemble à un jeu.`, mood: 'curieuse' },
      { id: 'segment_2', from: 2, to: 3, narrator: 'virtual_child_b', narratorDisplayName: 'Noé', text: `Noé imagine l’air aussi doux qu’une couverture. Quand ${gentleWonder.toLowerCase()} ouvre un œil, les feuilles laissent passer un petit sentier. Le sentier ne presse personne : il invite seulement les pieds courageux à essayer un pas, puis un autre.`, mood: 'rêveur' }
    ],
    endings: [
      { id: 'maison_tiede', title: 'Le retour tout chaud', emotion: 'heureuse', text: 'La porte s’ouvre sur une pièce remplie de voix familières. La clé devient une petite lampe pour le soir, et l’enfant comprend que les pas courageux peuvent aussi ramener vers la douceur.', visualHint: 'Une chambre chaude avec une lampe' },
      { id: 'fenetre_secrete', title: 'La fenêtre secrète', emotion: 'mystérieuse', text: 'Derrière la porte, une fenêtre montre demain de très loin. Personne n’a besoin de tout comprendre maintenant. L’enfant referme doucement le rideau et garde un petit mystère pour les rêves.', visualHint: 'Une fenêtre ronde avec des étoiles' },
      { id: 'chemin_qui_rit', title: 'Le chemin qui rit', emotion: 'drôle', text: 'La porte éternue, le sentier glousse, et même le signe silencieux remue comme une nouille. Tout le monde rit si fort que l’aventure décide de se glisser dans un oreiller pour revenir plus tard.', visualHint: 'Un chemin joueur comme un ruban' }
    ],
    metadata: { duration, readingMode, ageRange, createdAt: new Date().toISOString() },
    source: 'local'
  }
}
