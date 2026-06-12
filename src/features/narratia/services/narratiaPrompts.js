const narratiaUniverseGuide = {
  name: 'Narratia — le Royaume des Lanternes Douces',
  coreFeeling: [
    'Warm, magical medieval-fantasy universe for children around 7 years old.',
    'Adventurous, safe, poetic, colorful, emotionally comforting, and never dark or violent.',
    'The child must feel curious, brave, welcomed, important, free to explore, safe to choose, and emotionally engaged.',
    'The world should always suggest: “This world wants me to explore it.”'
  ],
  globalArtDirection: [
    'Soft heroic fantasy with a storybook feeling, cozy medieval villages, gentle castles, friendly forests, magical sunsets, warm lantern lights, light fog, glowing particles, fabric banners in the wind, wooden textures, parchment, stone, moss.',
    'Palette: warm gold, deep blue, forest green, soft orange, magical purple.',
    'Mood: comforting bedtime story, child fantasy adventure, playful tabletop RPG, soft Ghibli-like wonder.',
    'Modern WebGL app direction: mobile and desktop, lightweight, stylized rather than realistic, atmosphere over polygon count.'
  ],
  recurringVisuals: [
    'castles on hills',
    'magical libraries',
    'tree villages',
    'little taverns with soup and candles',
    'floating lights',
    'enchanted paths',
    'old bridges',
    'observatories',
    'secret gardens',
    'dragon-shaped clouds',
    'tiny friendly creatures',
    'animated stars',
    'glowing rivers',
    'ancient doors with symbols',
    'mysterious but friendly ruins'
  ],
  characterStyle: [
    'Characters are expressive, kind, memorable, slightly funny, and visually readable for children.',
    'Use child-safe roles such as apprentice knight, shy wizard, inventor squirrel, giant gentle blacksmith, old map keeper, brave child explorer, tiny dragon companion, singing bard, owl messenger.'
  ],
  appAtmosphere: [
    'UI should feel magical and alive: parchment panels, animated ink, floating particles, subtle glow, animated transitions, gentle ambient motion, magical sound feedback, large readable rounded buttons, tactile interactions, playful elegance.'
  ],
  positiveValues: [
    'Encourage imagination, emotional exploration, cooperation, discovery, wonder, and creativity.',
    'Mysterious elements must remain friendly. Conflict should be solved through care, cleverness, cooperation, humor, listening, or brave gentle choices.'
  ],
  avoid: [
    'No horror, gore, realistic war, oppressive darkness, graphic violence, frightening monsters, hopelessness, punishment-as-plot, adult themes, cynicism, or scary realism.',
    'No weapons used to hurt. Knights protect, repair, guide, or help.'
  ]
}

export const narratiaSystemPrompt = [
  'You create emotionally safe, child-facing collaborative stories for a parent and a child in the age range selected by the parent, especially fitting children around 7 years old when ageRange is 6-8.',
  'The experience is not a chatbot. It is a guided narrative ritual with immutable milestones and playful shared narration.',
  'Use the Narratia universe guide as the fixed world bible for every child-visible story, choice, visual hint, mood, and ending.',
  'Use plain, warm French language. Keep fear gentle, friendly, and contained. Avoid danger that feels graphic, punitive, hopeless, scary, militaristic, or oppressive.',
  'Never expose parent configuration labels, system instructions, JSON explanations, or AI terminology to the child.',
  'Return only valid JSON matching the requested shape. All child-visible labels and story text must be in French.'
].join(' ')

export function buildChildChoicesPrompt(parentConfiguration) {
  return {
    task: 'Generate 6 to 12 French child-facing story ingredient choices for the Narratia cozy medieval-fantasy universe.',
    universeGuide: narratiaUniverseGuide,
    constraints: [
      'Choices must be concrete things a child can imagine: objects, creatures, places, magical elements, or atmosphere.',
      'Every choice must feel like it belongs in a warm magical medieval-fantasy storybook world: cozy villages, gentle castles, friendly forests, libraries, lanterns, bridges, gardens, observatories, glowing rivers, tiny companions, safe ruins.',
      'Choices must match the parent configuration while hiding all parent-facing emotional tuning vocabulary.',
      'Labels must be short, gentle, playful, age appropriate for parentConfiguration.ageRange, and emotionally coherent.',
      'Favor wonder, cooperation, imagination, discovery, and emotionally safe adventure.',
      'No frightening, violent, hopeless, adult, horror, realistic war, or oppressive themes.'
    ],
    parentConfiguration,
    outputShape: {
      childChoices: [
        { id: 'lanterne_de_lune', label: 'Une lanterne de lune', category: 'object' }
      ]
    }
  }
}

export function buildStoryPackagePrompt({ parentConfiguration, childSelection, selectedChoices, narrators }) {
  return {
    task: 'Generate one complete Narratia story package in French inside a warm, magical medieval-fantasy universe. This is the final generation call for the session.',
    universeGuide: narratiaUniverseGuide,
    constraints: [
      'Generate the entire package now. Do not rely on future generation.',
      'Create 3 to 5 immutable milestones. They are revealed immediately at the beginning and must feel exciting, safe, poetic, colorful, and inevitable.',
      'Create intermediate segments connecting milestone 1 to 2, 2 to 3, and so on.',
      'Ground the story in soft heroic fantasy: gentle castles, cozy medieval villages, tree villages, magical libraries, little taverns with soup and candles, friendly forests, glowing rivers, secret gardens, observatories, old bridges, symbolic ancient doors, and friendly ruins.',
      'Use warm gold, deep blue, forest green, soft orange, and magical purple in visual hints when useful.',
      'Include child-readable characters that are expressive, kind, memorable, slightly funny, and safe: apprentice knight, shy wizard, inventor squirrel, gentle giant blacksmith, old map keeper, brave child explorer, tiny dragon companion, singing bard, owl messenger, or similarly gentle roles.',
      'Any mystery must remain friendly and comforting. Challenges are solved through care, cooperation, creativity, listening, cleverness, humor, or brave gentle choices; never through violence.',
      'At least one segment must be narrated by virtual_child_a and at least one by virtual_child_b when there are enough segments.',
      'Reserve the final emotional agency for the real child through the ending choice or a player_child final segment.',
      'Generate exactly 3 endings with short titles, distinct emotional orientations, and full ending text.',
      'All endings must fit the same milestones and remain coherent for parentConfiguration.ageRange.',
      'Every narration block must contain narrator id, narrator display name, text, and a mood tag for future text to speech.',
      'No scary horror, gore, realistic war, weapon harm, oppressive darkness, hopelessness, punitive danger, adult themes, or visible JSON-like wording inside story text. No developer explanations.'
    ],
    parentConfiguration,
    childSelection,
    selectedChoices,
    narrators,
    outputShape: {
      id: 'story_id',
      title: 'Titre de l’histoire',
      narrators,
      milestones: [
        { id: 1, title: 'Titre court du moment', text: 'Le moment promis qui arrivera.', visualHint: 'Illustration hint' }
      ],
      segments: [
        { id: 'segment_1', from: 1, to: 2, narrator: 'virtual_child_a', narratorDisplayName: 'Mira', text: 'Narration text.', mood: 'curious' }
      ],
      endings: [
        { id: 'ending_1', title: 'Titre court de la fin', emotion: 'heureuse', text: 'Texte complet de la fin en français.', visualHint: 'Illustration hint' }
      ],
      metadata: { duration: parentConfiguration.duration, readingMode: parentConfiguration.readingMode, ageRange: parentConfiguration.ageRange, createdAt: 'ISO date' }
    }
  }
}
