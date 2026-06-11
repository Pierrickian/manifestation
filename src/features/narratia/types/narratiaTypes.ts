export type StoryDuration = 'short' | 'medium' | 'long'
export type StoryIntensity = 'very_soft' | 'balanced' | 'intense_imagination'
export type ReadingMode = 'parent_reads' | 'mixed_narration' | 'ai_children_narrate'
export type ChildChoiceCategory = 'object' | 'creature' | 'place' | 'magic' | 'atmosphere'
export type NarratorId = 'virtual_child_a' | 'virtual_child_b' | 'player_child' | 'parent'

export interface ParentConfiguration {
  duration: StoryDuration
  emotionalTones: string[]
  themes: string[]
  intensity: StoryIntensity
  allowedEndingStyles: string[]
  readingMode: ReadingMode
}

export interface ChildChoice {
  id: string
  label: string
  category: ChildChoiceCategory
}

export interface ChildSelection {
  choiceIds: string[]
  placeFeeling: string
  endingFeeling: string
}

export interface StoryMilestone {
  id: number
  title: string
  text: string
  visualHint?: string
}

export interface Narrator {
  id: NarratorId
  displayName: string
  personality: string
  voiceHint?: string
}

export interface StorySegment {
  id: string
  from: number
  to: number
  narrator: NarratorId
  narratorDisplayName: string
  text: string
  mood?: string
}

export interface StoryEnding {
  id: string
  title: string
  emotion: string
  text: string
  visualHint?: string
}

export interface NarratiaStoryPackage {
  id: string
  title: string
  narrators: Narrator[]
  milestones: StoryMilestone[]
  segments: StorySegment[]
  endings: StoryEnding[]
  metadata: {
    duration: StoryDuration
    readingMode: ReadingMode
    ageRange: string
    createdAt: string
  }
}
