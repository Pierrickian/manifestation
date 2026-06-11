/**
 * @typedef {'short' | 'medium' | 'long'} StoryDuration
 * @typedef {'very_soft' | 'balanced' | 'intense_imagination'} StoryIntensity
 * @typedef {'parent_reads' | 'mixed_narration' | 'ai_children_narrate'} ReadingMode
 * @typedef {'object' | 'creature' | 'place' | 'magic' | 'atmosphere'} ChildChoiceCategory
 * @typedef {'virtual_child_a' | 'virtual_child_b' | 'player_child' | 'parent'} NarratorId
 *
 * @typedef {Object} ParentConfiguration
 * @property {StoryDuration} duration
 * @property {string[]} emotionalTones
 * @property {string[]} themes
 * @property {StoryIntensity} intensity
 * @property {string[]} allowedEndingStyles
 * @property {ReadingMode} readingMode
 *
 * @typedef {Object} ChildChoice
 * @property {string} id
 * @property {string} label
 * @property {ChildChoiceCategory} category
 *
 * @typedef {Object} ChildSelection
 * @property {string[]} choiceIds
 * @property {string} placeFeeling
 * @property {string} endingFeeling
 *
 * @typedef {Object} StoryMilestone
 * @property {number} id
 * @property {string} title
 * @property {string} text
 * @property {string=} visualHint
 *
 * @typedef {Object} Narrator
 * @property {NarratorId} id
 * @property {string} displayName
 * @property {string} personality
 * @property {string=} voiceHint
 *
 * @typedef {Object} StorySegment
 * @property {string} id
 * @property {number} from
 * @property {number} to
 * @property {NarratorId} narrator
 * @property {string} narratorDisplayName
 * @property {string} text
 * @property {string=} mood
 *
 * @typedef {Object} StoryEnding
 * @property {string} id
 * @property {string} title
 * @property {string} emotion
 * @property {string} text
 * @property {string=} visualHint
 *
 * @typedef {Object} NarratiaStoryPackage
 * @property {string} id
 * @property {string} title
 * @property {Narrator[]} narrators
 * @property {StoryMilestone[]} milestones
 * @property {StorySegment[]} segments
 * @property {StoryEnding[]} endings
 * @property {{duration: StoryDuration, readingMode: ReadingMode, ageRange: string, createdAt: string}} metadata
 */

export const NARRATIA_TYPE_MARKER = 'narratia-types'
