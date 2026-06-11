import OpenAI from 'openai'
import { buildPrompt } from '../src/ai/buildPrompt.js'
import { generateDiscovery } from '../src/ai/generateDiscovery.js'
import { generateLinks } from '../src/ai/generateLinks.js'
import { generateQuestion } from '../src/ai/generateQuestion.js'

const DEFAULT_OPENAI_MODEL = 'gpt-5.4-mini'

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const responseFormats = {
  answer: {
    type: 'json_schema',
    json_schema: {
      name: 'wizard_answer',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['answer'],
        properties: {
          answer: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'label', 'needId', 'scores'],
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              needId: { type: 'string' },
              scores: {
                type: 'object',
                additionalProperties: { type: 'number' }
              }
            }
          }
        }
      }
    }
  },
  question: {
    type: 'json_schema',
    json_schema: {
      name: 'wizard_question',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'answers'],
        properties: {
          question: { type: 'string' },
          answers: {
            type: 'array',
            minItems: 3,
            maxItems: 5,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'label', 'needId', 'scores'],
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                needId: { type: 'string' },
                scores: {
                  type: 'object',
                  additionalProperties: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  },
  discovery: {
    type: 'json_schema',
    json_schema: {
      name: 'wizard_discovery',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['text'],
        properties: {
          text: { type: 'string' }
        }
      }
    }
  },
  links: {
    type: 'json_schema',
    json_schema: {
      name: 'wizard_links',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['needLinks', 'pathLinks'],
        properties: {
          needLinks: { type: 'array', items: { type: 'object', additionalProperties: true } },
          pathLinks: { type: 'array', items: { type: 'object', additionalProperties: true } }
        }
      }
    }
  },
  settings: {
    type: 'json_schema',
    json_schema: {
      name: 'wizard_setting_slider',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['slider'],
        properties: {
          slider: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'label', 'left', 'right', 'value'],
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              left: { type: 'string' },
              right: { type: 'string' },
              value: { type: 'number' }
            }
          }
        }
      }
    }
  },
  narratia_child_choices: {
    type: 'json_schema',
    json_schema: {
      name: 'narratia_child_choices',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['childChoices'],
        properties: {
          childChoices: {
            type: 'array',
            minItems: 6,
            maxItems: 12,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'label', 'category'],
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                category: { type: 'string', enum: ['object', 'creature', 'place', 'magic', 'atmosphere'] }
              }
            }
          }
        }
      }
    }
  },
  narratia_story_package: {
    type: 'json_schema',
    json_schema: {
      name: 'narratia_story_package',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'narrators', 'milestones', 'segments', 'endings', 'metadata'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          narrators: { type: 'array', items: { type: 'object', additionalProperties: true } },
          milestones: { type: 'array', minItems: 3, maxItems: 5, items: { type: 'object', additionalProperties: true } },
          segments: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'object', additionalProperties: true } },
          endings: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', additionalProperties: true } },
          metadata: { type: 'object', additionalProperties: true }
        }
      }
    }
  },
  flow: {
    type: 'json_schema',
    json_schema: {
      name: 'wizard_flow',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['words', 'conclusion'],
        properties: {
          words: {
            type: 'array',
            minItems: 8,
            maxItems: 18,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'word', 'question', 'x', 'y', 'size', 'duration', 'delay'],
              properties: {
                id: { type: 'string' },
                word: { type: 'string' },
                question: { type: 'string' },
                x: { type: 'number' },
                y: { type: 'number' },
                size: { type: 'number' },
                duration: { type: 'number' },
                delay: { type: 'number' }
              }
            }
          },
          conclusion: { type: 'string' }
        }
      }
    }
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { kind, context } = request.body || {}

  if (!client) {
    response.status(200).json(withDebug(getLocalResult(kind, context), {
      source: 'local',
      fallbackReason: 'missing_openai_api_key',
      hasOpenAIKey: false
    }))
    return
  }

  try {
    const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL
    const result = await createValidatedAiResult(kind, context, model)

    response.status(200).json(withDebug(result.payload, {
      source: 'ai',
      hasOpenAIKey: true,
      model,
      finishReason: result.finishReason,
      retryCount: result.retryCount
    }))
  } catch (error) {
    response.status(200).json(withDebug(getLocalResult(kind, context), {
      source: 'local',
      fallbackReason: error?.code === 'invalid_ai_payload' ? 'openai_invalid_payload' : 'openai_request_failed',
      hasOpenAIKey: true,
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      errorName: error?.name || 'Error',
      errorMessage: error?.message || 'Unknown OpenAI error',
      invalidPayloadKeys: error?.payloadKeys?.join(', ') || 'none',
      retryCount: error?.retryCount ?? 0
    }))
  }
}

async function createValidatedAiResult(kind, context, model) {
  const attempts = [buildPrompt(kind, context), buildPrompt(kind, context)]
  attempts[1] = [
    ...attempts[1],
    {
      role: 'user',
      content: [
        'La reponse precedente etait invalide ou ressemblait a un schema JSON.',
        getShapeInstruction(kind),
        'Ne renvoie jamais les champs type, properties, schema ou json_schema comme objet principal.',
        'Renvoie uniquement les donnees finales utilisables par le wizard.'
      ].join(' ')
    }
  ]

  let lastError = null

  for (const [attemptIndex, messages] of attempts.entries()) {
    const completion = await client.chat.completions.create({
      model,
      messages,
      response_format: responseFormats[kind] || responseFormats.question,
      temperature: 0.75
    })

    const content = completion.choices[0]?.message?.content || '{}'
    const payload = JSON.parse(content)
    const validationError = validateAiPayload(kind, payload)

    if (!validationError) {
      return {
        payload,
        finishReason: completion.choices[0]?.finish_reason || 'unknown',
        retryCount: attemptIndex
      }
    }

    lastError = validationError
    lastError.retryCount = attemptIndex
  }

  throw lastError
}

function validateAiPayload(kind, payload) {
  const validators = {
    answer: (value) => Boolean(value?.answer?.label && value.answer.needId && value.answer.scores),
    question: (value) => Boolean(value?.question && Array.isArray(value.answers) && value.answers.length >= 3),
    discovery: (value) => Boolean(value?.text),
    links: (value) => Array.isArray(value?.needLinks) || Array.isArray(value?.pathLinks),
    settings: (value) => Boolean(value?.slider?.id && value.slider.label),
    flow: (value) => Array.isArray(value?.words),
    narratia_child_choices: (value) => Array.isArray(value?.childChoices) && value.childChoices.length >= 6,
    narratia_story_package: (value) => Boolean(value?.title && Array.isArray(value.milestones) && Array.isArray(value.segments) && Array.isArray(value.endings) && value.endings.length === 3)
  }

  const isValid = (validators[kind] || validators.question)(payload)
  if (isValid) return null

  const error = new Error(`Invalid AI ${kind} payload: ${Object.keys(payload || {}).join(', ') || 'empty object'}`)
  error.name = 'InvalidAIResponseError'
  error.code = 'invalid_ai_payload'
  error.payloadKeys = Object.keys(payload || {})
  return error
}

function getShapeInstruction(kind) {
  if (kind === 'answer') return 'Format attendu: { "answer": { "id": string, "label": string, "needId": string, "scores": object } }.'
  if (kind === 'question') return 'Format attendu: { "question": string, "answers": [{ "id": string, "label": string, "needId": string, "scores": object }] }.'
  if (kind === 'discovery') return 'Format attendu: { "text": string }.'
  if (kind === 'links') return 'Format attendu: { "needLinks": array, "pathLinks": array }.'
  if (kind === 'settings') return 'Format attendu: { "slider": { "id": string, "label": string, "left": string, "right": string, "value": number } }.'
  if (kind === 'flow') return 'Format attendu: { "words": array, "conclusion": string }.'
  if (kind === 'narratia_child_choices') return 'Expected format: { "childChoices": [{ "id": string, "label": string, "category": string }] }.'
  if (kind === 'narratia_story_package') return 'Expected format: { "id": string, "title": string, "narrators": array, "milestones": array, "segments": array, "endings": array, "metadata": object }.'
  return 'Format attendu: un objet JSON de donnees finales, pas un schema.'
}

function getLocalResult(kind, context) {
  if (kind === 'answer') {
    return {
      answer: context?.answer || {
        id: `fallback-answer-${Date.now()}`,
        label: 'choisir une autre nuance possible',
        needId: context?.dominantNeed?.id || 'red',
        scores: {
          [context?.dominantNeed?.id || 'red']: 2
        }
      }
    }
  }

  if (kind === 'discovery') return { text: generateDiscovery(context) }
  if (kind === 'links') return generateLinks(context)
  if (kind === 'settings') {
    return {
      slider: {
        id: context?.slider?.id || 'intensity',
        label: context?.slider?.label || 'Nuance',
        left: 'Retenir',
        right: 'Traverser',
        value: 50
      }
    }
  }
  if (kind === 'narratia_child_choices') {
    return {
      childChoices: [
        { id: 'mysterious_key', label: 'A mysterious key', category: 'object' },
        { id: 'sleeping_fox', label: 'A sleeping fox', category: 'creature' },
        { id: 'glowing_train', label: 'A glowing train', category: 'magic' },
        { id: 'hidden_cabin', label: 'A hidden cabin', category: 'place' },
        { id: 'following_cloud', label: 'A rain cloud that follows people', category: 'atmosphere' },
        { id: 'giant_tree', label: 'A giant tree', category: 'place' }
      ]
    }
  }
  if (kind === 'narratia_story_package') {
    return {
      id: `local-narratia-${Date.now()}`,
      title: 'The Key Beneath the Tree',
      narrators: [
        { id: 'virtual_child_a', displayName: 'Mira', personality: 'Curious and observant.', voiceHint: 'bright and gentle' },
        { id: 'virtual_child_b', displayName: 'Noe', personality: 'Dreamy and calm.', voiceHint: 'slow and warm' },
        { id: 'player_child', displayName: 'You', personality: 'The child who chooses the final feeling.', voiceHint: 'open' },
        { id: 'parent', displayName: 'Grown-up reader', personality: 'Steady and reassuring.', voiceHint: 'calm' }
      ],
      milestones: [
        { id: 1, title: 'The Warm Key', text: 'The child finds a warm key beneath an old tree.', visualHint: 'A key glowing under roots' },
        { id: 2, title: 'The Sleeping Fox', text: 'A sleeping fox wakes and points toward a hidden cabin.', visualHint: 'A fox beside a lantern path' },
        { id: 3, title: 'The Three Doors', text: 'Inside the cabin, three gentle doors wait for one choice.', visualHint: 'Three rounded doors' }
      ],
      segments: [
        { id: 'segment_1', from: 1, to: 2, narrator: 'virtual_child_a', narratorDisplayName: 'Mira', text: 'Mira notices that the key hums only when everyone walks kindly. The tree bends one branch toward the path, as if it is proud to help.', mood: 'curious' },
        { id: 'segment_2', from: 2, to: 3, narrator: 'virtual_child_b', narratorDisplayName: 'Noe', text: 'Noe imagines the fox dreaming the path before it appears. Each pawprint shines softly, and the cabin waits without hurry.', mood: 'dreamy' }
      ],
      endings: [
        { id: 'happy_lantern', title: 'The Happy Lantern', emotion: 'happy', text: 'The chosen door opens to a lantern that remembers every kind step. It lights the way home and leaves a tiny glow for tomorrow.', visualHint: 'A lantern by a bed' },
        { id: 'quiet_secret', title: 'The Quiet Secret', emotion: 'mysterious', text: 'The door opens to a whisper that says some wonders can wait. The child smiles, knowing the secret will be ready when the next story begins.', visualHint: 'A curtain with starlight' },
        { id: 'giggle_door', title: 'The Giggle Door', emotion: 'funny', text: 'The door giggles before anyone touches it. Even the fox laughs in its sleep, and the key turns into a biscuit-shaped moon.', visualHint: 'A laughing moon' }
      ],
      metadata: { duration: 'short', readingMode: 'mixed_narration', ageRange: 'around 7', createdAt: new Date().toISOString() }
    }
  }
  if (kind === 'flow') {
    return {
      words: ['sens', 'corps', 'choix', 'lien', 'limite', 'appui', 'route', 'envie', 'place', 'souffle', 'clarte', 'pas'].map((word, index) => ({
        id: `local-flow-${index}-${word}`,
        word,
        question: `Qu est-ce que "${word}" ouvre pour toi ?`,
        x: 12 + ((index * 17) % 76),
        y: 10 + ((index * 23) % 78),
        size: 0.85 + ((index % 5) * 0.08),
        duration: 7 + (index % 6),
        delay: -1 * (index % 5)
      })),
      conclusion: ''
    }
  }
  return generateQuestion(context)
}

function withDebug(result, debug) {
  return {
    ...result,
    source: result?.source || debug.source,
    debug
  }
}
