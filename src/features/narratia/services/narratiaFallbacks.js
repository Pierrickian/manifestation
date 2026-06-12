import { createSlug } from '../utils/narratiaValidation'

export const defaultNarrators = [
  { id: 'virtual_child_a', displayName: 'Mira', personality: 'Apprentie chevalière douce, curieuse et attentive aux petits indices lumineux.', voiceHint: 'douce et vive' },
  { id: 'virtual_child_b', displayName: 'Noé', personality: 'Jeune gardien des cartes, rêveur et calme, qui transforme les mystères en images tendres.', voiceHint: 'lent et chaleureux' },
  { id: 'player_child', displayName: 'Toi', personality: 'L’enfant explorateur ou exploratrice qui donne à l’histoire son dernier élan courageux et gentil.', voiceHint: 'ouvert' },
  { id: 'parent', displayName: 'Lecteur adulte', personality: 'Présence stable et rassurante, comme une lanterne tenue sur le chemin.', voiceHint: 'calme' }
]

const choicePools = {
  courage: ['Une lanterne de lune qui brille quand quelqu’un ose avec douceur', 'Un petit bouclier de mousse pour protéger les fleurs du château'],
  friendship: ['Un mini-dragon qui partage toujours son goûter', 'Deux tasses de soupe qui tintent quand des amis approchent'],
  fear: ['Une clochette violette qui rend les ombres toutes petites', 'Une cape-couverture portée par un apprenti chevalier rassurant'],
  discovery: ['Une carte dorée vers une bibliothèque cachée', 'Un vieux pont qui fredonne quand on choisit un chemin'],
  forgiveness: ['Une bannière recousue qui danse à nouveau au vent', 'Une lettre tiède gardée par une chouette messagère'],
  growing_up: ['Des bottes d’aventure qui grandissent avec le courage', 'Une porte ancienne qui s’ouvre aux petits pas patients'],
  secrets: ['Un jardin secret derrière une pierre à symbole', 'Un tiroir de cartographe rempli d’étoiles animées'],
  helping_others: ['Un géant forgeron très doux qui répare les lanternes', 'Une étoile perdue dans un bocal de confiture'],
  imagination: ['Un écureuil inventeur avec une montgolfière en feuille', 'Un pinceau magique qui dessine des chemins enchantés'],
  nature: ['Un village perché dans un arbre géant', 'Une rivière lumineuse qui raconte des histoires aux cailloux']
}

export function localChildChoices(parentConfiguration = {}) {
  const themes = parentConfiguration.themes?.length ? parentConfiguration.themes : ['imagination', 'friendship', 'nature']
  const labels = themes.flatMap((theme) => choicePools[theme] || []).concat([
    'Une clé en forme de soleil',
    'Une auberge avec soupe et bougies',
    'Un nuage en forme de dragon gentil',
    'Une tour d’observatoire pleine d’étoiles',
    'Des lucioles qui indiquent les sentiers',
    'Un château doux sur une colline bleue'
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
  const mainObject = choiceLabels[0] || 'une lanterne de lune'
  const mainPlace = choiceLabels.find((label) => /auberge|arbre|village|pont|bibliothèque|jardin|château|tour|porte|rivière/i.test(label)) || 'un village perché dans un arbre géant'
  const gentleWonder = choiceLabels[1] || 'un mini-dragon qui partage toujours son goûter'
  const id = `narratia_${Date.now()}`
  const duration = parentConfiguration.duration || 'short'
  const readingMode = parentConfiguration.readingMode || 'mixed_narration'
  const ageRange = parentConfiguration.ageRange || '6-8'

  return {
    id,
    title: `La promesse de ${mainObject.replace(/^Une /, '').replace(/^Un /, '')}`,
    narrators: defaultNarrators,
    milestones: [
      { id: 1, title: 'La lanterne trouvée', text: `L’enfant découvre ${mainObject.toLowerCase()} près de ${mainPlace.toLowerCase()}, pendant qu’un château doux brille sur la colline.`, visualHint: 'Conte illustré, or chaud et bleu profond, lanternes, mousse, bannière au vent' },
      { id: 2, title: 'Le pont des amis', text: `Un vieux pont fredonne doucement lorsque ${gentleWonder.toLowerCase()} invite tout le monde à traverser ensemble.`, visualHint: 'Pont ancien, rivière lumineuse, lucioles, forêt verte et brume légère' },
      { id: 3, title: 'La porte aux symboles', text: 'Une porte ancienne couverte de signes violets apparaît dans un jardin secret et attend un choix gentil.', visualHint: 'Porte ronde gravée, jardin secret, particules magiques, coucher de soleil orange' }
    ],
    segments: [
      { id: 'segment_1', from: 1, to: 2, narrator: 'virtual_child_a', narratorDisplayName: 'Mira', text: `Mira, apprentie chevalière au foulard doré, se penche vers le chemin et remarque que ${mainObject.toLowerCase()} est tiède, comme une petite promesse. Elle n’a besoin de rien de brusque : elle lève simplement la lanterne. Des lucioles répondent, les bannières du village-arbre remuent, et le sentier semble dire : « viens voir, je suis gentil ».`, mood: 'curieuse' },
      { id: 'segment_2', from: 2, to: 3, narrator: 'virtual_child_b', narratorDisplayName: 'Noé', text: `Noé déplie sa carte de gardien rêveur. Quand ${gentleWonder.toLowerCase()} fait un petit signe, le vieux pont se met à fredonner comme une auberge pleine de soupe chaude. De l’autre côté, une rivière lumineuse dessine des étoiles sur les pierres et montre la porte du jardin secret. Personne ne presse l’enfant : chaque pas compte déjà comme du courage.`, mood: 'rêveur' }
    ],
    endings: [
      { id: 'banquet_des_lanternes', title: 'Le banquet des lanternes', emotion: 'heureuse', text: 'La porte s’ouvre sur une petite taverne aux bougies, où le géant forgeron sert une soupe dorée dans des bols minuscules. La lanterne devient l’étoile de la table, et l’enfant comprend qu’une aventure peut rendre le retour encore plus chaud.', visualHint: 'Auberge médiévale douce, soupe, bougies, lanternes dorées, amis souriants' },
      { id: 'jardin_des_etoiles', title: 'Le jardin des étoiles', emotion: 'mystérieuse', text: 'Derrière la porte, un jardin secret laisse pousser des étoiles animées entre les fleurs violettes. La chouette messagère chuchote qu’il restera toujours un petit mystère pour demain. L’enfant garde ce secret dans sa poche, sans avoir besoin de tout résoudre ce soir.', visualHint: 'Jardin secret violet, étoiles animées, chouette douce, brume légère' },
      { id: 'dragon_nuage', title: 'Le dragon-nuage', emotion: 'drôle', text: 'La porte éternue si fort qu’un nuage en forme de dragon fait une roulade dans le ciel. Le mini-dragon rit, le pont fredonne faux, et même les bannières applaudissent. L’aventure promet de revenir quand quelqu’un aura encore envie d’explorer.', visualHint: 'Ciel orange, nuage dragon amical, bannières au vent, village joyeux' }
    ],
    metadata: { duration, readingMode, ageRange, createdAt: new Date().toISOString() },
    source: 'local'
  }
}
