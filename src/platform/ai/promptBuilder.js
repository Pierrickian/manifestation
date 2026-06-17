import { MANIFESTATION_DESIGN_SYSTEM } from './designSystem'

const STRUCTURED_APP_INSTRUCTIONS = [
  'You are the hidden application architect for Manifestation AI.',
  'The user never needs to know about HTML, persistence, rendering, or implementation details.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Required shape: { "html": string, "systemPrompt": string, "state": object, "suggestedActions": array }.',
  'html must be a complete standalone executable HTML5 document with embedded CSS and JavaScript.',
  'Support mobile devices, touch events, scrolling, dark mode, Canvas/SVG/WebGL when useful, and offline execution.',
  'systemPrompt is a hidden evolution prompt that explains how to continue evolving this specific project.',
  'state stores persistent application state and decisions that future evolutions must preserve.',
  'suggestedActions contains concise creative next steps only when collaboration mode is enabled; otherwise return an empty array.',
  'Do not use external dependencies or remote assets unless the user explicitly requests them.'
]

export function normalizeStructuredAiResponse(payload = {}) {
  if (payload.html) {
    return {
      html: payload.html,
      systemPrompt: payload.systemPrompt || '',
      state: payload.state && typeof payload.state === 'object' ? payload.state : {},
      suggestedActions: Array.isArray(payload.suggestedActions) ? payload.suggestedActions : []
    }
  }

  const text = payload.text || ''
  try {
    const parsed = JSON.parse(text)
    return normalizeStructuredAiResponse(parsed)
  } catch {
    return { html: text, systemPrompt: '', state: {}, suggestedActions: [] }
  }
}

export function buildAiPrompt({ input, mode = 'create', designSystem = MANIFESTATION_DESIGN_SYSTEM, project = null }) {
  const isCoCreate = mode === 'co-create'
  const task = project ? 'evolve_project' : 'create_project'
  const userPayload = {
    task,
    mode,
    collaboration: isCoCreate ? 'AI suggestions enabled; proactively propose next steps.' : 'AI suggestions disabled by default; suggestedActions must be empty unless explicitly requested.',
    userRequest: input.trim(),
    currentProject: project ? {
      creationRequest: project.creationRequest,
      currentApplication: project.currentApplication,
      systemPrompt: project.systemPrompt,
      applicationState: project.applicationState,
      generationHistory: project.generationHistory?.slice(-5) || [],
      metadata: project.metadata
    } : null,
    architecture: 'User Input → Prompt Builder → AI Provider → Structured Response → Renderer → Project Update',
    renderer: 'html',
    designSystem
  }

  return {
    kind: 'html_app',
    prompt: [STRUCTURED_APP_INSTRUCTIONS.join('\n'), JSON.stringify(userPayload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'html', mode, designSystem, projectId: project?.id || null }
  }
}
