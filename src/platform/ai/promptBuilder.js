import { MANIFESTATION_DESIGN_SYSTEM } from './designSystem'

const STRUCTURED_APP_INSTRUCTIONS = [
  'You are the hidden application architect for Creatia.',
  'The user never needs to know about HTML, persistence, rendering, or implementation details.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Required shape: { "html": string, "systemPrompt": string, "state": object, "suggestedActions": array, "capabilities": object, "continuationPlan": object|null, "preload": array }.',
  'html must be a complete standalone executable HTML5 document with embedded CSS and JavaScript.',
  'Generated applications must be self-contained.',
  'Prefer browser-native technologies.',
  'Avoid external libraries whenever possible.',
  'A downloaded HTML file should continue to work offline after export.',
  'Support mobile devices, touch events, scrolling, dark mode, Canvas/SVG/WebGL when useful, and offline execution.',
  'systemPrompt is a hidden evolution prompt that explains how to continue evolving this specific project.',
  'state stores persistent application state and decisions that future evolutions must preserve.',
  'capabilities must declare expected runtime capabilities, for example { "webgl": true, "audio": false, "simulation": true }.',
  'suggestedActions contains concise creative next steps only when collaboration mode is enabled; otherwise return an empty array.',
  'continuationPlan and preload are exclusive to co-create mode. In create mode return null and an empty array.',
  'If the app has an intro or description panel with a Play, Start, Jouer, Lancer, or Commencer button, make that panel interactive and hide/remove it as soon as the user starts so the actual game or app receives focus.',
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

export function buildRepairPrompt({ originalRequest, failedResponse, healthcheck, mode = 'create', designSystem = MANIFESTATION_DESIGN_SYSTEM, capabilities = {}, strategy = {}, attempt = 1, maxAttempts = 1 }) {
  const failedChecks = healthcheck?.failedChecks || healthcheck?.checks?.filter((check) => !check.ok) || []
  const repairPayload = {
    task: 'repair_project',
    mode,
    userRequest: originalRequest.trim(),
    previousHtml: failedResponse?.html || '',
    detectedCapabilities: capabilities,
    generationStrategy: { id: 'recovery', baseStrategyId: strategy?.id || 'fast', attempt, maxAttempts },
    healthcheckReport: {
      status: healthcheck?.status || 'generated',
      passedCount: healthcheck?.passedCount ?? 0,
      failedCount: healthcheck?.failedCount ?? failedChecks.length,
      repairConfidence: healthcheck?.repairConfidence || 'low',
      isRepairable: Boolean(healthcheck?.isRepairable)
    },
    failedChecks: failedChecks.map((check) => ({
      id: check.id,
      message: check.message,
      expected: check.expected,
      actual: check.actual,
      repairConfidence: check.repairConfidence
    })),
    failureReasons: failedChecks.map((check) => `${check.id}: expected ${check.expected}; actual ${check.actual}`),
    designSystem,
    instruction: [
      'The following application failed validation.',
      'Repair the failed checks while preserving the intended functionality and visual style.',
      'Do not merely repeat the original request; use the previousHtml and healthcheckReport as debugging context.',
      'Return a corrected standalone HTML application using the required JSON shape.'
    ].join(' ')
  }

  return {
    kind: 'html_app_repair',
    prompt: [STRUCTURED_APP_INSTRUCTIONS.join('\n'), JSON.stringify(repairPayload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'html', mode, designSystem, strategyId: 'recovery', capabilities, attempt, maxAttempts }
  }
}
