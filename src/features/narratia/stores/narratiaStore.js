export const NARRATIA_STORAGE_KEY = 'manifestation:narratia-session'

export const defaultParentConfiguration = {
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
  revealedSegmentIds: [],
  segmentNarratorChoices: {},
  status: 'idle',
  error: ''
}

export function loadNarratiaState() {
  try {
    const saved = JSON.parse(localStorage.getItem(NARRATIA_STORAGE_KEY) || 'null')
    return saved ? { ...initialNarratiaState, ...saved, status: 'idle', error: '' } : initialNarratiaState
  } catch {
    return initialNarratiaState
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
    revealedSegmentIds: state.revealedSegmentIds || [],
    segmentNarratorChoices: state.segmentNarratorChoices || {},
    screen: state.screen
  }

  localStorage.setItem(NARRATIA_STORAGE_KEY, JSON.stringify(persisted))
}

export function clearNarratiaState() {
  localStorage.removeItem(NARRATIA_STORAGE_KEY)
}
