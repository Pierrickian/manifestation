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
    flow: (value) => Array.isArray(value?.words)
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
