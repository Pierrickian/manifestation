import OpenAI from 'openai'
import { buildPrompt } from '../src/ai/buildPrompt.js'
import { generateDiscovery } from '../src/ai/generateDiscovery.js'
import { generateLinks } from '../src/ai/generateLinks.js'
import { generateQuestion } from '../src/ai/generateQuestion.js'

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const responseFormats = {
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
    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
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
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      errorName: error?.name || 'Error',
      errorMessage: error?.message || 'Unknown OpenAI error'
    }))
  }
}

function getLocalResult(kind, context) {
  if (kind === 'discovery') return { text: generateDiscovery(context) }
  if (kind === 'links') return generateLinks(context)
  return generateQuestion(context)
}

function withDebug(result, debug) {
  return {
    ...result,
    source: result?.source || debug.source,
    debug
  }
}
