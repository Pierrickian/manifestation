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
    const completion = await client.chat.completions.create({
      model,
      messages: buildPrompt(kind, context),
      response_format: responseFormats[kind] || responseFormats.question,
      temperature: 0.75
    })

    const content = completion.choices[0]?.message?.content
    response.status(200).json(withDebug(JSON.parse(content), {
      source: 'ai',
      hasOpenAIKey: true,
      model,
      finishReason: completion.choices[0]?.finish_reason || 'unknown'
    }))
  } catch (error) {
    response.status(200).json(withDebug(getLocalResult(kind, context), {
      source: 'local',
      fallbackReason: 'openai_request_failed',
      hasOpenAIKey: true,
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      errorName: error?.name || 'Error',
      errorMessage: error?.message || 'Unknown OpenAI error'
    }))
  }
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
