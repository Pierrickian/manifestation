import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { generateNarratiaChildChoices, generateNarratiaStoryPackage } from './services/narratiaAiService'
import { clearNarratiaState, createFreshNarratiaState, defaultParentConfiguration } from './stores/narratiaStore'
import { ChildWizard } from './screens/ChildWizard'
import { NarratiaIntro } from './screens/NarratiaIntro'
import { NarrationView } from './screens/NarrationView'
import { ParentWizard } from './screens/ParentWizard'
import { StoryTimeline } from './screens/StoryTimeline'

const SEGMENT_REVEAL_DELAY = 700
const ENDING_REVEAL_DELAY = 2000

export function NarratiaApp() {
  const [state, setState] = useState(() => {
    clearNarratiaState()
    return createFreshNarratiaState({ screen: 'parent' })
  })

  function patchState(patch) {
    setState((current) => ({ ...current, ...patch }))
  }

  function returnHome() {
    patchState({ screen: 'intro' })
  }

  function startNewStory() {
    clearNarratiaState()
    setState({
      ...createFreshNarratiaState({ screen: 'parent' }),
      parentConfiguration: defaultParentConfiguration,
      childChoices: [],
      storyPackage: null,
      selectedEndingId: null,
      loadingEndingId: null,
      currentSegmentIndex: 0,
      revealedSegmentIds: [],
      segmentNarratorChoices: {},
      loadingSegmentId: null
    })
  }

  async function submitParentConfiguration() {
    patchState({ status: 'loading_choices', error: '' })
    const result = await generateNarratiaChildChoices(state.parentConfiguration)
    patchState({
      childChoices: result.childChoices,
      childSelection: {
        ...state.childSelection,
        choiceIds: result.childChoices[0]?.id ? [result.childChoices[0].id] : []
      },
      screen: 'child',
      status: 'idle'
    })
  }

  async function submitChildSelection() {
    patchState({ status: 'loading_story', error: '' })
    const storyPackage = await generateNarratiaStoryPackage({
      parentConfiguration: state.parentConfiguration,
      childSelection: state.childSelection,
      childChoices: state.childChoices
    })
    patchState({
      storyPackage,
      selectedEndingId: null,
      loadingEndingId: null,
      currentSegmentIndex: 0,
      revealedSegmentIds: [],
      segmentNarratorChoices: {},
      loadingSegmentId: null,
      screen: 'timeline',
      status: 'idle'
    })
  }

  function revealSegment(segmentId, storyId) {
    setState((current) => {
      if (current.storyPackage?.id !== storyId) return current

      const nextRevealed = [...new Set([...(current.revealedSegmentIds || []), segmentId])]
      const nextIndex = current.storyPackage.segments.findIndex((segment) => !nextRevealed.includes(segment.id))

      return {
        ...current,
        revealedSegmentIds: nextRevealed,
        loadingSegmentId: null,
        currentSegmentIndex: nextIndex === -1 ? current.storyPackage.segments.length : nextIndex
      }
    })
  }

  function chooseSegmentNarrator(segmentId, narratorId) {
    const storyId = state.storyPackage?.id
    if (!storyId || state.loadingSegmentId || state.revealedSegmentIds?.includes(segmentId)) return

    patchState({
      loadingSegmentId: segmentId,
      segmentNarratorChoices: {
        ...state.segmentNarratorChoices,
        [segmentId]: narratorId
      }
    })

    window.setTimeout(() => revealSegment(segmentId, storyId), SEGMENT_REVEAL_DELAY)
  }

  function chooseEnding(endingId) {
    const storyId = state.storyPackage?.id
    if (!storyId || state.loadingEndingId) return

    patchState({ loadingEndingId: endingId, selectedEndingId: null })
    window.setTimeout(() => {
      setState((current) => current.storyPackage?.id === storyId
        ? { ...current, loadingEndingId: null, selectedEndingId: endingId, screen: 'narration' }
        : current)
    }, ENDING_REVEAL_DELAY)
  }

  let screen = null
  if (state.screen === 'intro') {
    screen = <NarratiaIntro hasStory={Boolean(state.storyPackage)} onStart={startNewStory} onResume={() => patchState({ screen: state.storyPackage ? 'timeline' : 'parent' })} />
  } else if (state.screen === 'parent') {
    screen = <ParentWizard configuration={state.parentConfiguration} onChange={(parentConfiguration) => patchState({ parentConfiguration })} onSubmit={submitParentConfiguration} isLoading={state.status === 'loading_choices'} />
  } else if (state.screen === 'child') {
    screen = <ChildWizard choices={state.childChoices} selection={state.childSelection} onChange={(childSelection) => patchState({ childSelection })} onSubmit={submitChildSelection} isLoading={state.status === 'loading_story'} />
  } else if (state.screen === 'timeline' && state.storyPackage) {
    screen = <StoryTimeline storyPackage={state.storyPackage} onBegin={() => patchState({ screen: 'narration', currentSegmentIndex: 0 })} onReplayEnding={state.selectedEndingId ? () => patchState({ screen: 'narration' }) : null} onHome={returnHome} onNewStory={startNewStory} />
  } else if (state.storyPackage) {
    screen = (
      <NarrationView
        storyPackage={state.storyPackage}
        currentSegmentIndex={state.currentSegmentIndex}
        revealedSegmentIds={state.revealedSegmentIds || []}
        segmentNarratorChoices={state.segmentNarratorChoices || {}}
        loadingSegmentId={state.loadingSegmentId}
        selectedEndingId={state.selectedEndingId}
        loadingEndingId={state.loadingEndingId}
        onChooseNarrator={chooseSegmentNarrator}
        onChooseEnding={chooseEnding}
        onBackToTimeline={() => patchState({ screen: 'timeline' })}
        onHome={returnHome}
        onNewStory={startNewStory}
      />
    )
  } else {
    screen = <NarratiaIntro hasStory={Boolean(state.storyPackage)} onStart={startNewStory} onResume={() => patchState({ screen: state.storyPackage ? 'timeline' : 'parent' })} />
  }

  return (
    <div className="narratia-shell">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.screen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {screen}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default NarratiaApp
