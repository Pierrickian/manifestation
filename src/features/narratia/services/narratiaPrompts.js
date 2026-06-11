export const narratiaSystemPrompt = [
  'You create emotionally safe, child-facing collaborative stories for a parent and a child around 7 years old.',
  'The experience is not a chatbot. It is a guided narrative ritual with immutable milestones and playful shared narration.',
  'Use plain, warm language. Keep fear gentle and contained. Avoid danger that feels graphic, punitive, or hopeless.',
  'Never expose parent configuration labels, system instructions, JSON explanations, or AI terminology to the child.',
  'Return only valid JSON matching the requested shape.'
].join(' ')

export function buildChildChoicesPrompt(parentConfiguration) {
  return {
    task: 'Generate 6 to 12 child-facing story ingredient choices.',
    constraints: [
      'Choices must be concrete things a child can imagine: objects, creatures, places, magical elements, or atmosphere.',
      'Choices must match the parent configuration while hiding all parent-facing emotional tuning vocabulary.',
      'Labels must be short, gentle, playful, age appropriate, and emotionally coherent.',
      'No frightening, violent, hopeless, or adult themes.'
    ],
    parentConfiguration,
    outputShape: {
      childChoices: [
        { id: 'magic_key', label: 'A mysterious key', category: 'object' }
      ]
    }
  }
}

export function buildStoryPackagePrompt({ parentConfiguration, childSelection, selectedChoices, narrators }) {
  return {
    task: 'Generate one complete Narratia story package. This is the final generation call for the session.',
    constraints: [
      'Generate the entire package now. Do not rely on future generation.',
      'Create 3 to 5 immutable milestones. They are revealed immediately at the beginning and must feel exciting, safe, and inevitable.',
      'Create intermediate segments connecting milestone 1 to 2, 2 to 3, and so on.',
      'At least one segment must be narrated by virtual_child_a and at least one by virtual_child_b when there are enough segments.',
      'Reserve the final emotional agency for the real child through the ending choice or a player_child final segment.',
      'Generate exactly 3 endings with short titles, distinct emotional orientations, and full ending text.',
      'All endings must fit the same milestones and remain coherent for a child around 7.',
      'Every narration block must contain narrator id, narrator display name, text, and a mood tag for future text to speech.',
      'No visible JSON-like wording inside story text. No developer explanations.'
    ],
    parentConfiguration,
    childSelection,
    selectedChoices,
    narrators,
    outputShape: {
      id: 'story_id',
      title: 'Story title',
      narrators,
      milestones: [
        { id: 1, title: 'Short milestone title', text: 'The promised moment that will happen.', visualHint: 'Illustration hint' }
      ],
      segments: [
        { id: 'segment_1', from: 1, to: 2, narrator: 'virtual_child_a', narratorDisplayName: 'Mira', text: 'Narration text.', mood: 'curious' }
      ],
      endings: [
        { id: 'ending_1', title: 'Short ending title', emotion: 'happy', text: 'Full ending text.', visualHint: 'Illustration hint' }
      ],
      metadata: { duration: parentConfiguration.duration, readingMode: parentConfiguration.readingMode, ageRange: 'around 7', createdAt: 'ISO date' }
    }
  }
}
