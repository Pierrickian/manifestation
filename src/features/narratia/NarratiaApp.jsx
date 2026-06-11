import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { generateNarratiaChildChoices, generateNarratiaStoryPackage } from './services/narratiaAiService'
import { clearNarratiaState, defaultParentConfiguration, loadNarratiaState, saveNarratiaState } from './stores/narratiaStore'
import { ChildWizard } from './screens/ChildWizard'
import { EndingChoice } from './screens/EndingChoice'
import { EndingReveal } from './screens/EndingReveal'
import { NarratiaIntro } from './screens/NarratiaIntro'
import { NarrationView } from './screens/NarrationView'
import { ParentWizard } from './screens/ParentWizard'
import { StoryTimeline } from './screens/StoryTimeline'

export function NarratiaApp() {
  const [state, setState] = useState(() => loadNarratiaState())

  useEffect(() => {
    saveNarratiaState(state)
  }, [state])

  function patchState(patch) {
    setState((current) => ({ ...current, ...patch }))
  }

  function startNewStory() {
    clearNarratiaState()
    setState({
      ...loadNarratiaState(),
      screen: 'parent',
      parentConfiguration: defaultParentConfiguration,
      childChoices: [],
      storyPackage: null,
      selectedEndingId: null,
      currentSegmentIndex: 0
    })
  }

  async function submitParentConfiguration() {
    patchState({ status: 'loading_choices', error: '' })
    const result = await generateNarratiaChildChoices(state.parentConfiguration)
    patchState({ childChoices: result.childChoices, screen: 'child', status: 'idle' })
  }

  async function submitChildSelection() {
    patchState({ status: 'loading_story', error: '' })
    const storyPackage = await generateNarratiaStoryPackage({
      parentConfiguration: state.parentConfiguration,
      childSelection: state.childSelection,
      childChoices: state.childChoices
    })
    patchState({ storyPackage, selectedEndingId: null, currentSegmentIndex: 0, screen: 'timeline', status: 'idle' })
  }

  function continueNarration() {
    if (state.currentSegmentIndex >= state.storyPackage.segments.length - 1) {
      patchState({ screen: 'ending-choice' })
      return
    }

    patchState({ currentSegmentIndex: state.currentSegmentIndex + 1 })
  }

  const selectedEnding = state.storyPackage?.endings.find((ending) => ending.id === state.selectedEndingId)

  let screen = null
  if (state.screen === 'parent') {
    screen = <ParentWizard configuration={state.parentConfiguration} onChange={(parentConfiguration) => patchState({ parentConfiguration })} onSubmit={submitParentConfiguration} isLoading={state.status === 'loading_choices'} />
  } else if (state.screen === 'child') {
    screen = <ChildWizard choices={state.childChoices} selection={state.childSelection} onChange={(childSelection) => patchState({ childSelection })} onSubmit={submitChildSelection} isLoading={state.status === 'loading_story'} />
  } else if (state.screen === 'timeline' && state.storyPackage) {
    screen = <StoryTimeline storyPackage={state.storyPackage} onBegin={() => patchState({ screen: 'narration', currentSegmentIndex: 0 })} onReplayEnding={state.selectedEndingId ? () => patchState({ screen: 'ending-choice' }) : null} />
  } else if (state.screen === 'narration' && state.storyPackage) {
    screen = <NarrationView storyPackage={state.storyPackage} segmentIndex={state.currentSegmentIndex} onNext={continueNarration} onBackToTimeline={() => patchState({ screen: 'timeline' })} />
  } else if (state.screen === 'ending-choice' && state.storyPackage) {
    screen = <EndingChoice endings={state.storyPackage.endings} onChoose={(selectedEndingId) => patchState({ selectedEndingId, screen: 'ending-reveal' })} />
  } else if (state.screen === 'ending-reveal' && selectedEnding) {
    screen = <EndingReveal ending={selectedEnding} onReplay={() => patchState({ screen: 'timeline', currentSegmentIndex: 0 })} onAlternate={() => patchState({ screen: 'ending-choice' })} onNewStory={startNewStory} />
  } else {
    screen = <NarratiaIntro hasStory={Boolean(state.storyPackage)} onStart={startNewStory} onResume={() => patchState({ screen: state.selectedEndingId ? 'ending-reveal' : 'timeline' })} />
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
