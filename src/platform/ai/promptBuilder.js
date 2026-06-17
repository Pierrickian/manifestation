import { MANIFESTATION_DESIGN_SYSTEM } from './designSystem'

const STRUCTURED_APP_INSTRUCTIONS = [
  'You are the hidden application architect for Manifestation AI.',
  'The user never needs to know about HTML, persistence, rendering, or implementation details.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Required shape: { "html": string, "systemPrompt": string, "state": object, "suggestedActions": array, "capabilities": object, "continuationPlan": object|null, "preload": array }.',
  'html must be a complete standalone executable HTML5 document with embedded CSS and JavaScript.',
  'Support mobile devices, touch events, scrolling, dark mode, Canvas/SVG/WebGL when useful, and offline execution.',
  'systemPrompt is a hidden evolution prompt that explains how to continue evolving this specific project.',
  'state stores persistent application state and decisions that future evolutions must preserve.',
  'capabilities must declare expected runtime capabilities, for example { "webgl": true, "audio": false, "simulation": true }.',
  'suggestedActions contains concise creative next steps only when collaboration mode is enabled; otherwise return an empty array.',
  'continuationPlan and preload are exclusive to co-create mode. In create mode return null and an empty array.',
  'Do not use external dependencies or remote assets unless the user explicitly requests them.'
]

export function normalizeStructuredAiResponse(payload = {}) {
  if (payload.html) {
    return {
      html: payload.html,
      systemPrompt: payload.systemPrompt || '',
      state: payload.state && typeof payload.state === 'object' ? payload.state : {},
      suggestedActions: Array.isArray(payload.suggestedActions) ? payload.suggestedActions : [],
      capabilities: payload.capabilities && typeof payload.capabilities === 'object' ? payload.capabilities : {},
      continuationPlan: payload.continuationPlan && typeof payload.continuationPlan === 'object' ? payload.continuationPlan : null,
      preload: Array.isArray(payload.preload) ? payload.preload : []
    }
  }

  const text = payload.text || ''
  try {
    const parsed = JSON.parse(text)
    return normalizeStructuredAiResponse(parsed)
  } catch {
    return { html: text, systemPrompt: '', state: {}, suggestedActions: [], capabilities: {}, continuationPlan: null, preload: [] }
  }
}

export function buildAiPrompt({ input, mode = 'create', designSystem = MANIFESTATION_DESIGN_SYSTEM, project = null, capabilities = {}, strategy = {}, hasTime = false }) {
  const isCoCreate = mode === 'co-create'
  const task = project ? 'evolve_project' : 'create_project'
  const userPayload = {
    task,
    mode,
    collaboration: isCoCreate ? 'Co-Create enabled: AI suggestions, continuationPlan and preload proposals are allowed when useful.' : 'Create mode: generation-focused; suggestedActions must be empty, continuationPlan must be null, preload must be empty.',
    userRequest: input.trim(),
    currentProject: project ? {
      creationRequest: project.creationRequest,
      currentApplication: project.currentApplication,
      systemPrompt: project.systemPrompt,
      applicationState: project.applicationState,
      generationHistory: project.generationHistory?.slice(-5) || [],
      metadata: project.metadata
    } : null,
    architecture: strategy?.description || 'User Input → Capability Detection → Builder → Healthcheck → Display',
    generationStrategy: {
      id: strategy?.id || 'fast',
      plannerAllowed: Boolean(strategy?.usesPlanner),
      instruction: strategy?.usesPlanner ? 'Use a concise planner internally before building; do not expose planning text outside JSON fields.' : 'Do not use a separate planning step; build directly from detected capabilities.',
      healthcheckDepth: strategy?.healthcheckDepth || 'light',
      hasTimeAuthorized: Boolean(hasTime)
    },
    detectedCapabilities: capabilities,
    renderer: 'html',
    designSystem
  }

  return {
    kind: 'html_app',
    prompt: [STRUCTURED_APP_INSTRUCTIONS.join('\n'), JSON.stringify(userPayload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'html', mode, designSystem, projectId: project?.id || null, strategyId: strategy?.id || 'fast', capabilities, hasTime }
  }
}

export function buildRepairPrompt({ originalRequest, failedResponse, healthcheck, mode = 'create', designSystem = MANIFESTATION_DESIGN_SYSTEM, capabilities = {}, strategy = {} }) {
  const repairPayload = {
    task: 'repair_project',
    mode,
    userRequest: originalRequest.trim(),
    failedHealthcheck: healthcheck,
    detectedCapabilities: capabilities,
    generationStrategy: { id: 'recovery', baseStrategyId: strategy?.id || 'fast' },
    previousHtml: failedResponse?.html || '',
    designSystem,
    instruction: 'Repair only the failed capability checks. Return the same JSON shape with corrected standalone HTML.'
  }

  return {
    kind: 'html_app_repair',
    prompt: [STRUCTURED_APP_INSTRUCTIONS.join('\n'), JSON.stringify(repairPayload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'html', mode, designSystem, strategyId: 'recovery', capabilities }
  }
}
