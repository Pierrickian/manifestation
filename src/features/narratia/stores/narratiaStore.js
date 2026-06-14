export const NARRATIA_STORAGE_KEY = 'manifestation:narratia-session'

export const defaultParentConfiguration = {
  ageRange: '6-8',
  duration: 'short',
  emotionalTones: ['reassuring'],
  themes: ['friendship', 'imagination'],
  intensity: 'very_soft',
  allowedEndingStyles: ['happy', 'funny', 'open_mystery'],
  readingMode: 'mixed_narration'
}

export const initialNarratiaState = {
  screen: 'intro',
  parentConfiguration: defaultParentConfiguration,
  childChoices: [],
  childSelection: {
    choiceIds: [],
    placeFeeling: 'cozy',
    endingFeeling: 'happy'
  },
  storyPackage: null,
  currentSegmentIndex: 0,
  selectedEndingId: null,
  loadingEndingId: null,
  revealedSegmentIds: [],
  segmentNarratorChoices: {},
  loadingSegmentId: null,
  status: 'idle',
  error: ''
}


export function createFreshNarratiaState(overrides = {}) {
  return {
    ...initialNarratiaState,
    parentConfiguration: { ...defaultParentConfiguration },
    childSelection: {
      ...initialNarratiaState.childSelection,
      choiceIds: [...initialNarratiaState.childSelection.choiceIds]
    },
    childChoices: [],
    revealedSegmentIds: [],
    segmentNarratorChoices: {},
    ...overrides
  }
}

const VALID_SCREENS = new Set(['intro', 'parent', 'child', 'timeline', 'narration'])

function getNormalizedRevealedSegmentIds(storyPackage, revealedSegmentIds = [], segmentNarratorChoices = {}) {
  if (!storyPackage?.segments?.length) return []

  const knownSegmentIds = new Set(storyPackage.segments.map((segment) => segment.id))
  const revealed = new Set(revealedSegmentIds.filter((segmentId) => knownSegmentIds.has(segmentId)))

  storyPackage.segments.forEach((segment) => {
    if (segmentNarratorChoices?.[segment.id]) revealed.add(segment.id)
  })

  return [...revealed]
}

function getNextSegmentIndex(storyPackage, revealedSegmentIds) {
  if (!storyPackage?.segments?.length) return 0

  const nextIndex = storyPackage.segments.findIndex((segment) => !revealedSegmentIds.includes(segment.id))
  return nextIndex === -1 ? storyPackage.segments.length : nextIndex
}

function normalizeNarratiaState(saved) {
  const state = {
    ...initialNarratiaState,
    ...saved,
    status: 'idle',
    error: '',
    loadingEndingId: null,
    loadingSegmentId: null
  }

  if (!VALID_SCREENS.has(state.screen)) state.screen = state.storyPackage ? 'intro' : 'intro'
  if (!state.storyPackage && !['intro', 'parent', 'child'].includes(state.screen)) state.screen = 'intro'

  state.parentConfiguration = {
    ...defaultParentConfiguration,
    ...(state.parentConfiguration || {})
  }

  state.childSelection = {
    ...initialNarratiaState.childSelection,
    ...(state.childSelection || {})
  }

  state.segmentNarratorChoices = state.segmentNarratorChoices || {}
  state.revealedSegmentIds = getNormalizedRevealedSegmentIds(
    state.storyPackage,
    state.revealedSegmentIds || [],
    state.segmentNarratorChoices
  )
  state.currentSegmentIndex = getNextSegmentIndex(state.storyPackage, state.revealedSegmentIds)

  return state
}

export function loadNarratiaState() {
  try {
    const saved = JSON.parse(localStorage.getItem(NARRATIA_STORAGE_KEY) || 'null')
    return saved ? normalizeNarratiaState(saved) : createFreshNarratiaState()
  } catch {
    return createFreshNarratiaState()
  }
}

export function saveNarratiaState(state) {
  const persisted = {
    parentConfiguration: state.parentConfiguration,
    childChoices: state.childChoices,
    childSelection: state.childSelection,
    storyPackage: state.storyPackage,
    currentSegmentIndex: state.currentSegmentIndex,
    selectedEndingId: state.selectedEndingId,
    loadingEndingId: null,
    revealedSegmentIds: state.revealedSegmentIds || [],
    segmentNarratorChoices: state.segmentNarratorChoices || {},
    loadingSegmentId: null,
    screen: state.screen
  }

  localStorage.setItem(NARRATIA_STORAGE_KEY, JSON.stringify(persisted))
}

export function clearNarratiaState() {
  localStorage.removeItem(NARRATIA_STORAGE_KEY)
}
