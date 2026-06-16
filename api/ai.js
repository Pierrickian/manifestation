import OpenAI from 'openai'
import { buildPrompt } from '../src/ai/buildPrompt.js'
import { generateDiscovery } from '../src/ai/generateDiscovery.js'
import { generateLinks } from '../src/ai/generateLinks.js'
import { generateQuestion } from '../src/ai/generateQuestion.js'

const DEFAULT_OPENAI_MODEL = 'gpt-5.4-mini'
const OPENAI_REQUEST_TIMEOUT_MS = 20000

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: OPENAI_REQUEST_TIMEOUT_MS })
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
  },
  enigmia_riddle: {
    type: 'json_schema',
    json_schema: {
      name: 'enigmia_riddle',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['riddle'],
        properties: {
          riddle: {
            type: 'object',
            additionalProperties: false,
            required: ['theme', 'object', 'coordinate', 'table', 'columnReadings', 'containers', 'puzzle', 'statements', 'choices', 'solution', 'solutionContainerName', 'auditTrail'],
            properties: {
              theme: { type: 'string' },
              object: { type: 'string' },
              coordinate: {
                type: 'object',
                additionalProperties: false,
                required: ['row', 'column'],
                properties: {
                  row: { type: 'string', enum: ['Objet=A', 'Objet=B', 'Objet=C'] },
                  column: { type: 'string', enum: ['A', 'B', 'C'] }
                }
              },
              table: {
                type: 'array',
                minItems: 3,
                maxItems: 3,
                items: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: { type: 'string', enum: ['V', 'F'] }
                }
              },
              columnReadings: { type: 'array', items: { type: 'object', additionalProperties: true } },
              containers: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', additionalProperties: false, required: ['id', 'name'], properties: { id: { type: 'string' }, name: { type: 'string' } } } },
              puzzle: { type: 'string' },
              statements: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', additionalProperties: false, required: ['containerId', 'containerName', 'text'], properties: { containerId: { type: 'string' }, containerName: { type: 'string' }, text: { type: 'string' } } } },
              choices: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', additionalProperties: false, required: ['id', 'containerName'], properties: { id: { type: 'string' }, containerName: { type: 'string' } } } },
              solution: { type: 'string', enum: ['A', 'B', 'C'] },
              solutionContainerName: { type: 'string' },
              auditTrail: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    }
  },
  mes_questions_quiz: {
    type: 'json_schema',
    json_schema: {
      name: 'mes_questions_quiz',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['questions'],
        properties: {
          questions: {
            type: 'array',
            minItems: 1,
            maxItems: 10,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'subject', 'question', 'answers', 'correctAnswerId'],
              properties: {
                id: { type: 'string' },
                subject: { type: 'string' },
                question: { type: 'string' },
                answers: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['id', 'text'],
                    properties: {
                      id: { type: 'string' },
                      text: { type: 'string' }
                    }
                  }
                },
                correctAnswerId: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
}


function getResponseFormat(kind, context) {
  if (kind === 'html_app') return undefined
  if (kind !== 'mes_questions_quiz') return responseFormats[kind] || responseFormats.question

  const exactQuestionCount = Math.max(1, Math.min(10, Number(context?.questionCount || 5)))

  return {
    type: 'json_schema',
    json_schema: {
      ...responseFormats.mes_questions_quiz.json_schema,
      strict: true,
      schema: {
        ...responseFormats.mes_questions_quiz.json_schema.schema,
        properties: {
          questions: {
            ...responseFormats.mes_questions_quiz.json_schema.schema.properties.questions,
            minItems: exactQuestionCount,
            maxItems: exactQuestionCount
          }
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
    const debug = {
      source: 'ai',
      fallbackReason: error?.code === 'invalid_ai_payload' ? 'openai_invalid_payload' : 'openai_request_failed',
      hasOpenAIKey: true,
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      errorName: error?.name || 'Error',
      errorMessage: error?.message || 'Unknown OpenAI error',
      invalidPayloadKeys: error?.payloadKeys?.join(', ') || 'none',
      retryCount: error?.retryCount ?? 0
    }


  if (kind === 'mes_questions_quiz') {
      response.status(502).json({
        error: 'AI quiz generation failed',
        message: 'La génération IA du quiz a échoué. Relance la génération dans quelques instants.',
        debug
      })
      return
    }

    response.status(200).json(withDebug(getLocalResult(kind, context), debug))
  }
}

async function createValidatedAiResult(kind, context, model) {
  const attempts = kind === 'html_app' ? [buildPrompt(kind, context)] : [buildPrompt(kind, context), buildPrompt(kind, context)]
  if (kind !== 'html_app') {
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
  }

  let lastError = null

  for (const [attemptIndex, messages] of attempts.entries()) {
    const completion = await client.chat.completions.create({
      model,
      messages,
      ...(getResponseFormat(kind, context) ? { response_format: getResponseFormat(kind, context) } : {}),
      temperature: 0.75
    })

    const content = completion.choices[0]?.message?.content || '{}'
    const payload = kind === 'html_app' ? { html: sanitizeHtmlOnly(content) } : normalizeAiPayload(kind, JSON.parse(content), context)
    const validationError = validateAiPayload(kind, payload, context)

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

function validateAiPayload(kind, payload, context = {}) {
  const validators = {
    answer: (value) => Boolean(value?.answer?.label && value.answer.needId && value.answer.scores),
    question: (value) => Boolean(value?.question && Array.isArray(value.answers) && value.answers.length >= 3),
    discovery: (value) => Boolean(value?.text),
    links: (value) => Array.isArray(value?.needLinks) || Array.isArray(value?.pathLinks),
    settings: (value) => Boolean(value?.slider?.id && value.slider.label),
    flow: (value) => Array.isArray(value?.words),
    narratia_child_choices: (value) => Array.isArray(value?.childChoices) && value.childChoices.length >= 6,
    narratia_story_package: (value) => Boolean(value?.title && Array.isArray(value.milestones) && Array.isArray(value.segments) && Array.isArray(value.endings) && value.endings.length === 3),
    enigmia_riddle: (value) => validateEnigmiaRiddle(value?.riddle).isValid,
    html_app: (value) => typeof value?.html === 'string' && /^\s*(<!doctype html|<html)/i.test(value.html),
    mes_questions_quiz: (value) => Array.isArray(value?.questions) && value.questions.length === Number(context?.questionCount || value.questions.length) && value.questions.every((question) => question?.id && question.subject && question.question && Array.isArray(question.answers) && question.answers.length === 3 && question.answers.some((answer) => answer.id === question.correctAnswerId))
  }

  const isValid = (validators[kind] || validators.question)(payload)
  if (isValid) return null

  const error = new Error(`Invalid AI ${kind} payload: ${Object.keys(payload || {}).join(', ') || 'empty object'}`)
  error.name = 'InvalidAIResponseError'
  error.code = 'invalid_ai_payload'
  error.payloadKeys = Object.keys(payload || {})
  return error
}

function normalizeAiPayload(kind, payload, context = {}) {
  if (kind !== 'enigmia_riddle') return payload
  return normalizeEnigmiaPayload(payload, context)
}

const ENIGMIA_IDS = ['A', 'B', 'C']
const ENIGMIA_ROWS = ['Objet=A', 'Objet=B', 'Objet=C']
const ENIGMIA_STATEMENTS_BY_PATTERN = {
  VFF: 'L’objet est dans A',
  FVF: 'L’objet est dans B',
  FFV: 'L’objet est dans C',
  FVV: 'L’objet n’est pas dans A',
  VFV: 'L’objet n’est pas dans B',
  VVF: 'L’objet n’est pas dans C'
}

function normalizeTruthCell(cell) {
  if (cell === true) return 'V'
  if (cell === false) return 'F'
  const normalized = String(cell || '').trim().toUpperCase()
  return normalized === 'V' || normalized === 'TRUE' || normalized === 'VRAI' ? 'V' : 'F'
}

function normalizeEnigmiaPayload(payload, context = {}) {
  const riddle = payload?.riddle
  if (!riddle) return payload

  const containers = ENIGMIA_IDS.map((id, index) => {
    const container = riddle.containers?.find((item) => item?.id === id) || riddle.containers?.[index] || {}
    return {
      id,
      name: container.name || `contenant ${id}`
    }
  })
  const namesById = Object.fromEntries(containers.map((container) => [container.id, container.name]))
  const table = Array.isArray(riddle.table)
    ? ENIGMIA_ROWS.map((_, rowIndex) => ENIGMIA_IDS.map((__, colIndex) => normalizeTruthCell(riddle.table?.[rowIndex]?.[colIndex])))
    : []
  const previousSolution = getPreviousEnigmiaSolution(context)
  const safeTable = validateEnigmiaTable(table).isValid && getEnigmiaSolution(table) !== previousSolution
    ? table
    : createEnigmiaTable(previousSolution)

  const solutionIndex = getEnigmiaSolutionIndex(safeTable)
  const solution = ENIGMIA_IDS[solutionIndex]
  const solutionRow = safeTable[solutionIndex]
  const coordinateColumn = ENIGMIA_IDS[solutionRow.findIndex((cell) => cell === 'V')]
  const columnReadings = ENIGMIA_IDS.map((containerId, columnIndex) => {
    const pattern = safeTable.map((row) => row[columnIndex]).join('')
    const internalStatement = ENIGMIA_STATEMENTS_BY_PATTERN[pattern]
    const convertedStatement = convertEnigmiaStatement(internalStatement, namesById)
    return {
      containerId,
      pattern,
      internalStatement,
      convertedStatement
    }
  })

  return {
    ...payload,
    riddle: {
      ...riddle,
      coordinate: { row: ENIGMIA_ROWS[solutionIndex], column: coordinateColumn },
      table: safeTable,
      columnReadings,
      containers,
      statements: columnReadings.map((reading) => ({
        containerId: reading.containerId,
        containerName: namesById[reading.containerId],
        text: reading.convertedStatement
      })),
      choices: ENIGMIA_IDS.map((id) => ({ id, containerName: namesById[id] })),
      solution,
      solutionContainerName: namesById[solution],
      auditTrail: [
        ...(Array.isArray(riddle.auditTrail) ? riddle.auditTrail : []),
        `Table validée côté API: lignes ${safeTable.map((row) => row.filter((cell) => cell === 'V').length).join('/')}, total 5 V.`,
        'Inscriptions reconstruites côté API à partir des colonnes validées.'
      ]
    }
  }
}

function getPreviousEnigmiaSolution(context = {}) {
  const previousRiddles = Array.isArray(context.previousRiddles) ? context.previousRiddles : []
  const lastSolution = previousRiddles.at(-1)?.solution
  return ENIGMIA_IDS.includes(lastSolution) ? lastSolution : null
}

function getEnigmiaSolutionIndex(table) {
  return table.findIndex((row) => row.filter((cell) => cell === 'V').length === 1)
}

function getEnigmiaSolution(table) {
  const solutionIndex = getEnigmiaSolutionIndex(table)
  return ENIGMIA_IDS[solutionIndex] || null
}

function createEnigmiaTable(excludedSolution = null) {
  const validTables = []

  for (let solutionIndex = 0; solutionIndex < ENIGMIA_IDS.length; solutionIndex += 1) {
    for (let coordinateColumnIndex = 0; coordinateColumnIndex < ENIGMIA_IDS.length; coordinateColumnIndex += 1) {
      for (let firstFalseColumn = 0; firstFalseColumn < ENIGMIA_IDS.length; firstFalseColumn += 1) {
        for (let secondFalseColumn = 0; secondFalseColumn < ENIGMIA_IDS.length; secondFalseColumn += 1) {
          const falseColumns = [firstFalseColumn, secondFalseColumn]
          const rows = ENIGMIA_IDS.map((_, rowIndex) => {
            if (rowIndex === solutionIndex) {
              return ENIGMIA_IDS.map((__, columnIndex) => columnIndex === coordinateColumnIndex ? 'V' : 'F')
            }

            const falseColumnIndex = falseColumns.shift()
            return ENIGMIA_IDS.map((__, columnIndex) => columnIndex === falseColumnIndex ? 'F' : 'V')
          })

          if (validateEnigmiaTable(rows).isValid && getEnigmiaSolution(rows) !== excludedSolution) validTables.push(rows)
        }
      }
    }
  }

  const pool = validTables.length ? validTables : [createFallbackEnigmiaTable()]
  return pool[Math.floor(Math.random() * pool.length)]
}

function createFallbackEnigmiaTable() {
  return [['F', 'V', 'V'], ['F', 'F', 'V'], ['V', 'V', 'F']]
}

function convertEnigmiaStatement(statement, namesById) {
  return ENIGMIA_IDS.reduce((text, id) => {
    return text.replace(new RegExp(`\\b${id}\\b`, 'g'), `le ${namesById[id]}`)
  }, statement)
}

function validateEnigmiaTable(table) {
  if (!Array.isArray(table) || table.length !== 3 || table.some((row) => !Array.isArray(row) || row.length !== 3)) {
    return { isValid: false, reason: 'invalid_table_shape' }
  }

  const rowCounts = table.map((row) => row.filter((cell) => cell === 'V').length)
  const solutionRows = rowCounts.filter((count) => count === 1).length
  const otherRows = rowCounts.filter((count) => count === 2).length
  const total = rowCounts.reduce((sum, count) => sum + count, 0)
  const patterns = ENIGMIA_IDS.map((_, columnIndex) => table.map((row) => row[columnIndex]).join(''))
  const knownPatterns = patterns.every((pattern) => Boolean(ENIGMIA_STATEMENTS_BY_PATTERN[pattern]))
  const uniquePatterns = new Set(patterns).size === 3

  return {
    isValid: solutionRows === 1 && otherRows === 2 && total === 5 && knownPatterns && uniquePatterns,
    reason: 'invalid_truth_constraints'
  }
}

function validateEnigmiaRiddle(riddle) {
  if (!riddle?.theme || !riddle.object || !Array.isArray(riddle.statements) || riddle.statements.length !== 3 || !Array.isArray(riddle.choices) || riddle.choices.length !== 3 || !ENIGMIA_IDS.includes(riddle.solution)) {
    return { isValid: false, reason: 'invalid_riddle_shape' }
  }

  return validateEnigmiaTable(riddle.table)
}

function getShapeInstruction(kind) {
  if (kind === 'answer') return 'Format attendu: { "answer": { "id": string, "label": string, "needId": string, "scores": object } }.'
  if (kind === 'question') return 'Format attendu: { "question": string, "answers": [{ "id": string, "label": string, "needId": string, "scores": object }] }.'
  if (kind === 'discovery') return 'Format attendu: { "text": string }.'
  if (kind === 'links') return 'Format attendu: { "needLinks": array, "pathLinks": array }.'
  if (kind === 'settings') return 'Format attendu: { "slider": { "id": string, "label": string, "left": string, "right": string, "value": number } }.'
  if (kind === 'flow') return 'Format attendu: { "words": array, "conclusion": string }.'
  if (kind === 'enigmia_riddle') return 'Format attendu: { \"riddle\": { \"theme\": string, \"object\": string, \"puzzle\": string, \"statements\": [{ \"containerId\": \"A\", \"containerName\": string, \"text\": string }], \"choices\": [{ \"id\": \"A\", \"containerName\": string }], \"solution\": \"A|B|C\" } }.'
  if (kind === 'narratia_child_choices') return 'Expected format: { "childChoices": [{ "id": string, "label": string, "category": string }] }.'
  if (kind === 'narratia_story_package') return 'Expected format: { "id": string, "title": string, "narrators": array, "milestones": array, "segments": array, "endings": array, "metadata": object }.'
  if (kind === 'html_app') return 'Format attendu: document HTML5 complet uniquement.'
  if (kind === 'mes_questions_quiz') return 'Format attendu: { "questions": [{ "id": string, "subject": string, "question": string, "answers": [{ "id": string, "text": string }], "correctAnswerId": string }] }.'
  return 'Format attendu: un objet JSON de donnees finales, pas un schema.'
}

function getLocalResult(kind, context) {
  if (kind === 'html_app') return { html: createFallbackHtmlApp(context) }
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
  if (kind === 'enigmia_riddle') {
    return normalizeEnigmiaPayload({
      riddle: {
        theme: 'observatoire lunaire',
        object: 'le prisme d’aurore',
        coordinate: { row: 'Objet=B', column: 'C' },
        table: createEnigmiaTable(getPreviousEnigmiaSolution(context)),
        columnReadings: [
          { containerId: 'A', pattern: 'FFV', internalStatement: 'L’objet est dans C', convertedStatement: 'L’objet est dans l’urne étoilée' },
          { containerId: 'B', pattern: 'VFV', internalStatement: 'L’objet n’est pas dans B', convertedStatement: 'L’objet n’est pas dans l’écrin argenté' },
          { containerId: 'C', pattern: 'VVF', internalStatement: 'L’objet n’est pas dans C', convertedStatement: 'L’objet n’est pas dans l’urne étoilée' }
        ],
        containers: [
          { id: 'A', name: 'coffret de basalte' },
          { id: 'B', name: 'écrin argenté' },
          { id: 'C', name: 'urne étoilée' }
        ],
        puzzle: 'Dans un observatoire lunaire, trois contenants gardent le silence autour du prisme d’aurore. Une seule inscription est vraie sur le bon scénario. À toi de déduire où le prisme est caché.',
        statements: [
          { containerId: 'A', containerName: 'coffret de basalte', text: 'L’objet est dans l’urne étoilée' },
          { containerId: 'B', containerName: 'écrin argenté', text: 'L’objet n’est pas dans l’écrin argenté' },
          { containerId: 'C', containerName: 'urne étoilée', text: 'L’objet n’est pas dans l’urne étoilée' }
        ],
        choices: [
          { id: 'A', containerName: 'coffret de basalte' },
          { id: 'B', containerName: 'écrin argenté' },
          { id: 'C', containerName: 'urne étoilée' }
        ],
        solution: 'B',
        solutionContainerName: 'écrin argenté',
        auditTrail: ['thème', 'objet recherché', 'coordonnée choisie', 'table validée', 'lecture des colonnes', 'correspondance', 'énigme', 'solution finale']
      }
    }, context)
  }
  if (kind === 'narratia_child_choices') {
    return {
      childChoices: [
        { id: 'cle_mysterieuse', label: 'Une clé mystérieuse', category: 'object' },
        { id: 'renard_endormi', label: 'Un renard endormi', category: 'creature' },
        { id: 'train_lumineux', label: 'Un train lumineux', category: 'magic' },
        { id: 'cabane_cachee', label: 'Une cabane cachée', category: 'place' },
        { id: 'nuage_suiveur', label: 'Un nuage de pluie qui suit les gens', category: 'atmosphere' },
        { id: 'arbre_geant', label: 'Un arbre géant', category: 'place' }
      ]
    }
  }
  if (kind === 'narratia_story_package') {
    return {
      id: `local-narratia-${Date.now()}`,
      title: 'La clé sous l’arbre',
      narrators: [
        { id: 'virtual_child_a', displayName: 'Mira', personality: 'Curieuse et attentive.', voiceHint: 'douce et vive' },
        { id: 'virtual_child_b', displayName: 'Noé', personality: 'Rêveur et calme.', voiceHint: 'lent et chaleureux' },
        { id: 'player_child', displayName: 'Toi', personality: 'L’enfant qui choisit la couleur de la fin.', voiceHint: 'ouvert' },
        { id: 'parent', displayName: 'Lecteur adulte', personality: 'Stable et rassurant.', voiceHint: 'calme' }
      ],
      milestones: [
        { id: 1, title: 'La clé tiède', text: 'L’enfant trouve une clé tiède sous un vieil arbre.', visualHint: 'Une clé lumineuse sous des racines' },
        { id: 2, title: 'Le renard endormi', text: 'Un renard endormi se réveille et montre une cabane cachée.', visualHint: 'Un renard près d’un chemin de lanternes' },
        { id: 3, title: 'Les trois portes', text: 'Dans la cabane, trois portes douces attendent un choix.', visualHint: 'Trois portes rondes' }
      ],
      segments: [
        { id: 'segment_1', from: 1, to: 2, narrator: 'virtual_child_a', narratorDisplayName: 'Mira', text: 'Mira remarque que la clé chante seulement quand tout le monde avance avec gentillesse. L’arbre penche une branche vers le sentier, comme s’il était fier d’aider.', mood: 'curieuse' },
        { id: 'segment_2', from: 2, to: 3, narrator: 'virtual_child_b', narratorDisplayName: 'Noé', text: 'Noé imagine que le renard rêve le chemin avant qu’il apparaisse. Chaque trace de patte brille doucement, et la cabane attend sans se presser.', mood: 'rêveur' }
      ],
      endings: [
        { id: 'lanterne_heureuse', title: 'La lanterne heureuse', emotion: 'heureuse', text: 'La porte choisie s’ouvre sur une lanterne qui se souvient de chaque pas gentil. Elle éclaire le retour et garde une petite lueur pour demain.', visualHint: 'Une lanterne près d’un lit' },
        { id: 'secret_calme', title: 'Le secret calme', emotion: 'mystérieuse', text: 'La porte s’ouvre sur un chuchotement qui dit que certaines merveilles peuvent attendre. L’enfant sourit : le secret sera prêt quand la prochaine histoire commencera.', visualHint: 'Un rideau avec de la lumière d’étoiles' },
        { id: 'porte_qui_rit', title: 'La porte qui rit', emotion: 'drôle', text: 'La porte glousse avant même qu’on la touche. Même le renard rit en dormant, et la clé devient une lune en forme de biscuit.', visualHint: 'Une lune qui rit' }
      ],
      metadata: { duration: 'short', readingMode: 'mixed_narration', ageRange: 'autour de 7 ans', createdAt: new Date().toISOString() }
    }
  }

  if (kind === 'mes_questions_quiz') {
    const subjects = context?.subjects?.length ? context.subjects : ['mathematiques']
    const count = Number(context?.questionCount || 5)
    const subjectBanks = {
      orthographe: [
        { question: 'Quel mot est écrit correctement ?', answers: [{ id: 'a', text: 'chato' }, { id: 'b', text: 'château' }, { id: 'c', text: 'chatô' }], correctAnswerId: 'b' },
        { question: 'Quel mot prend deux “p” ?', answers: [{ id: 'a', text: 'pomme' }, { id: 'b', text: 'pome' }, { id: 'c', text: 'paume' }], correctAnswerId: 'a' }
      ],
      grammaire: [
        { question: 'Dans “Le petit chien dort”, quel mot est le verbe ?', answers: [{ id: 'a', text: 'petit' }, { id: 'b', text: 'chien' }, { id: 'c', text: 'dort' }], correctAnswerId: 'c' },
        { question: 'Quel déterminant convient : ___ étoile brille ?', answers: [{ id: 'a', text: 'Une' }, { id: 'b', text: 'Un' }, { id: 'c', text: 'Des' }], correctAnswerId: 'a' }
      ],
      conjugaison: [
        { question: 'Quelle forme complète : “Nous ___ au parc” ?', answers: [{ id: 'a', text: 'allons' }, { id: 'b', text: 'allez' }, { id: 'c', text: 'vont' }], correctAnswerId: 'a' },
        { question: 'Quelle forme complète : “Je ___ une histoire” ?', answers: [{ id: 'a', text: 'lis' }, { id: 'b', text: 'lit' }, { id: 'c', text: 'lisez' }], correctAnswerId: 'a' }
      ],
      mathematiques: [
        { question: 'Combien font 3 + 4 ?', answers: [{ id: 'a', text: '6' }, { id: 'b', text: '7' }, { id: 'c', text: '8' }], correctAnswerId: 'b' },
        { question: 'Combien font 5 × 2 ?', answers: [{ id: 'a', text: '7' }, { id: 'b', text: '10' }, { id: 'c', text: '12' }], correctAnswerId: 'b' }
      ],
      animaux: [
        { question: 'Quel animal miaule ?', answers: [{ id: 'a', text: 'Le chat' }, { id: 'b', text: 'La poule' }, { id: 'c', text: 'Le cheval' }], correctAnswerId: 'a' },
        { question: 'Quel animal vit souvent dans une ruche ?', answers: [{ id: 'a', text: 'La grenouille' }, { id: 'b', text: 'L’abeille' }, { id: 'c', text: 'Le lapin' }], correctAnswerId: 'b' }
      ],
      sciences: [
        { question: 'De quoi une plante a-t-elle besoin pour pousser ?', answers: [{ id: 'a', text: 'D’eau et de lumière' }, { id: 'b', text: 'De chocolat' }, { id: 'c', text: 'De sable sec seulement' }], correctAnswerId: 'a' },
        { question: 'Quelle planète est appelée la planète rouge ?', answers: [{ id: 'a', text: 'Vénus' }, { id: 'b', text: 'Mars' }, { id: 'c', text: 'Jupiter' }], correctAnswerId: 'b' }
      ]
    }
    const questions = Array.from({ length: count }, (_, index) => {
      const subject = subjects[index % subjects.length]
      const bank = subjectBanks[subject] || subjectBanks.mathematiques
      const template = bank[Math.floor(index / subjects.length) % bank.length]
      return {
        ...template,
        id: `q${index + 1}`,
        subject,
        answers: template.answers.map((answer) => ({ ...answer }))
      }
    })
    return { questions }
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

function sanitizeHtmlOnly(content = '') {
  return String(content)
    .replace(/^```(?:html)?\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function createFallbackHtmlApp(context = {}) {
  const prompt = String(context?.prompt || 'html application')
  const title = prompt.split('User request:').pop()?.trim() || 'Application Manifestation'
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title.replace(/[<>]/g, '')}</title><style>:root{color-scheme:dark;--primary:#6A5AE0;--secondary:#A78BFA;--bg:#121212;--surface:#1E1E1E;--text:#fff}*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:Inter,system-ui,sans-serif;background:radial-gradient(circle at top,var(--primary),transparent 34%),var(--bg);color:var(--text);display:grid;place-items:center;padding:24px}.app{width:min(720px,100%);background:color-mix(in srgb,var(--surface),transparent 5%);border:1px solid rgba(255,255,255,.14);border-radius:24px;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.35)}button{border:0;border-radius:16px;padding:14px 18px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;font-weight:800;touch-action:manipulation}.orb{width:140px;aspect-ratio:1;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));margin:auto;animation:pulse 2s ease-in-out infinite alternate}@keyframes pulse{to{transform:scale(1.08);filter:brightness(1.2)}}@media (max-width:560px){.app{padding:18px;border-radius:18px}}</style></head><body><main class="app"><div class="orb"></div><h1>${title.replace(/[<>]/g, '')}</h1><p>Fallback offline généré par la plateforme IA Manifestation. Configure OPENAI_API_KEY pour obtenir une application complète.</p><button onclick="document.querySelector('.orb').style.animationDuration=Math.random()*1.5+.5+'s'">Animer</button></main></body></html>`
}

function withDebug(result, debug) {
  return {
    ...result,
    source: result?.source || debug.source,
    debug
  }
}
