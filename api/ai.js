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
      response_format: getResponseFormat(kind, context),
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
    narratia_story_package: (value) => Boolean(value?.title && Array.isArray(value.milestones) && Array.isArray(value.segments) && Array.isArray(value.endings) && value.endings.length === 3),
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

function getShapeInstruction(kind) {
  if (kind === 'answer') return 'Format attendu: { "answer": { "id": string, "label": string, "needId": string, "scores": object } }.'
  if (kind === 'question') return 'Format attendu: { "question": string, "answers": [{ "id": string, "label": string, "needId": string, "scores": object }] }.'
  if (kind === 'discovery') return 'Format attendu: { "text": string }.'
  if (kind === 'links') return 'Format attendu: { "needLinks": array, "pathLinks": array }.'
  if (kind === 'settings') return 'Format attendu: { "slider": { "id": string, "label": string, "left": string, "right": string, "value": number } }.'
  if (kind === 'flow') return 'Format attendu: { "words": array, "conclusion": string }.'
  if (kind === 'narratia_child_choices') return 'Expected format: { "childChoices": [{ "id": string, "label": string, "category": string }] }.'
  if (kind === 'narratia_story_package') return 'Expected format: { "id": string, "title": string, "narrators": array, "milestones": array, "segments": array, "endings": array, "metadata": object }.'
  if (kind === 'mes_questions_quiz') return 'Format attendu: { "questions": [{ "id": string, "subject": string, "question": string, "answers": [{ "id": string, "text": string }], "correctAnswerId": string }] }.'
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

function withDebug(result, debug) {
  return {
    ...result,
    source: result?.source || debug.source,
    debug
  }
}
