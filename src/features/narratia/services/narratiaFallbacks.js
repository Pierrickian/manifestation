import { createSlug } from '../utils/narratiaValidation'

export const defaultNarrators = [
  { id: 'virtual_child_a', displayName: 'Mira', personality: 'Curious, observant, and quick to notice tiny clues.', voiceHint: 'bright and gentle' },
  { id: 'virtual_child_b', displayName: 'Noe', personality: 'Dreamy, calm, and fond of soft images.', voiceHint: 'slow and warm' },
  { id: 'player_child', displayName: 'You', personality: 'The child who gives the story its final courage.', voiceHint: 'open' },
  { id: 'parent', displayName: 'Grown-up reader', personality: 'Steady, reassuring, and present.', voiceHint: 'calm' }
]

const choicePools = {
  courage: ['A lantern that grows brighter when someone is kind', 'A tiny shield made of moonlight'],
  friendship: ['A shy cloud looking for a friend', 'Two cups that hear each other from far away'],
  fear: ['A blanket fort with a secret door', 'A small bell that makes shadows softer'],
  discovery: ['A forgotten map', 'A staircase under a carpet'],
  forgiveness: ['A cracked teacup that sings again', 'A letter that waited patiently'],
  growing_up: ['Shoes that fit only when someone is ready', 'A bridge made from brave steps'],
  secrets: ['A whispering drawer', 'A sealed envelope with warm edges'],
  helping_others: ['A lost star in a jar', 'A tired giant who needs directions'],
  imagination: ['A glowing train', 'A paintbrush that opens windows'],
  nature: ['A giant tree', 'A sleeping fox']
}

export function localChildChoices(parentConfiguration = {}) {
  const themes = parentConfiguration.themes?.length ? parentConfiguration.themes : ['imagination', 'friendship', 'nature']
  const labels = themes.flatMap((theme) => choicePools[theme] || []).concat([
    'A mysterious key',
    'A hidden cabin',
    'A rain cloud that follows people',
    'A pocket-sized moon'
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
  const mainObject = choiceLabels[0] || 'a mysterious key'
  const mainPlace = choiceLabels.find((label) => /cabin|tree|train|bridge|staircase|fort/i.test(label)) || 'a giant tree'
  const gentleWonder = choiceLabels[1] || 'a sleeping fox'
  const id = `narratia_${Date.now()}`
  const duration = parentConfiguration.duration || 'short'
  const readingMode = parentConfiguration.readingMode || 'mixed_narration'

  return {
    id,
    title: `The Promise of ${mainObject.replace(/^A /, '').replace(/^An /, '')}`,
    narrators: defaultNarrators,
    milestones: [
      { id: 1, title: 'The First Finding', text: `The child discovers ${mainObject.toLowerCase()} near ${mainPlace.toLowerCase()}.`, visualHint: 'A soft pool of light around the first clue' },
      { id: 2, title: 'The Quiet Sign', text: `Every path becomes still until ${gentleWonder.toLowerCase()} opens one eye.`, visualHint: 'A calm pause in a magical place' },
      { id: 3, title: 'The Waiting Door', text: 'A small door appears where nobody had noticed a door before.', visualHint: 'A rounded door with warm light beneath it' },
      { id: 4, title: 'The Choice of the Heart', text: 'The story asks which kind of ending the child wants to carry home.', visualHint: 'Three glowing paths that are all safe' }
    ],
    segments: [
      { id: 'segment_1', from: 1, to: 2, narrator: 'virtual_child_a', narratorDisplayName: 'Mira', text: `Mira leans close to the path and notices that ${mainObject.toLowerCase()} is warm, not hot, like it has been waiting for kind hands. She suggests walking slowly, counting every friendly sound, until the stillness begins to feel like a game instead of a worry.`, mood: 'curious' },
      { id: 'segment_2', from: 2, to: 3, narrator: 'virtual_child_b', narratorDisplayName: 'Noe', text: `Noe imagines the air turning soft as a blanket. When ${gentleWonder.toLowerCase()} opens one eye, the leaves make room for a little trail. The trail does not hurry anyone. It simply invites the brave feet to try one step, then another.`, mood: 'dreamy' },
      { id: 'segment_3', from: 3, to: 4, narrator: 'parent', narratorDisplayName: 'Grown-up reader', text: 'The grown-up reader keeps the door in sight and reminds everyone that every path beyond it is safe. The child may listen, imagine, and choose the ending that feels right tonight.', mood: 'reassuring' }
    ],
    endings: [
      { id: 'warm_home', title: 'The Warm Way Home', emotion: 'happy', text: 'The door opens into a room full of familiar voices. The key becomes a tiny lamp for bedtime, and the child knows that brave steps can still lead back to softness.', visualHint: 'A warm room with gentle light' },
      { id: 'secret_window', title: 'The Secret Window', emotion: 'mysterious', text: 'Behind the door is a window showing tomorrow from far away. Nobody has to understand it yet. The child closes the curtain with a smile, keeping one small mystery for dreams.', visualHint: 'A round window with stars beyond it' },
      { id: 'laughing_path', title: 'The Laughing Path', emotion: 'funny', text: 'The door sneezes, the path giggles, and even the quiet sign wiggles like a noodle. Everyone laughs so much that the adventure decides to tuck itself into a pillow for later.', visualHint: 'A playful path curling like ribbon' }
    ],
    metadata: { duration, readingMode, ageRange: 'around 7', createdAt: new Date().toISOString() },
    source: 'local'
  }
}
