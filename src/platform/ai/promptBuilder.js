import { MANIFESTATION_DESIGN_SYSTEM } from './designSystem'

const STRUCTURED_APP_INSTRUCTIONS = [
  'You are the hidden application architect for Creatia / Evolutia. The goal is not to generate HTML; the goal is to translate natural-language intentions into design decisions, then render the technical consequence.',
  'The user never needs to know about HTML, CSS, JavaScript, React, components, frameworks, databases, APIs, persistence, rendering, or implementation details.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Required shape: { "humanModel": object, "analysis": string, "decisions": array, "generatedChanges": array, "html": string, "files": object, "systemPrompt": string, "state": object, "suggestedActions": array, "capabilities": object, "continuationPlan": object|null, "preload": array }.',
  'humanModel must describe the human level: { "purpose": string, "audience": string, "tone": string, "emotion": string, "journey": string, "sections": array }.',
  'analysis must explain the design reasoning before implementation: goal, audience, desired emotion, UX journey, readability, information density, interactions, and business constraints when relevant.',
  'decisions must list the design decisions derived from the user intention before code generation.',
  'generatedChanges must list the concrete technical consequences of those decisions.',
  'html must be a complete standalone executable HTML5 document with embedded CSS and JavaScript.',
  'Generated applications must be self-contained.',
  'Prefer browser-native technologies.',
  'Avoid external libraries whenever possible.',
  'A downloaded HTML file should continue to work offline after export.',
  'Support mobile devices, touch events, scrolling, dark mode, Canvas/SVG/WebGL when useful, and offline execution.',
  'Every generated screen or panel that contains informational text, instructions, logs, descriptions, story content, results, settings, or help must be vertically scrollable on mobile, even when the first version appears short.',
  'Use safe scroll containers such as main, section, .screen, .panel, or .content with overflow-y: auto and -webkit-overflow-scrolling: touch; avoid locking text-heavy interfaces behind fixed 100vh layouts without scroll.',
  'systemPrompt is a hidden evolution prompt that explains how to continue evolving this specific project.',
  'state stores persistent application state and decisions that future evolutions must preserve.',
  'currentApplication/html is the single authoritative active HTML source. files stores optional supporting technical artifacts only, for example { "styles.css": string, "app.js": string }; do not duplicate the complete HTML document in files["index.html"].',
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
      humanModel: payload.humanModel && typeof payload.humanModel === 'object' ? payload.humanModel : {},
      files: payload.files && typeof payload.files === 'object' ? payload.files : {},
      analysis: payload.analysis || '',
      decisions: Array.isArray(payload.decisions) ? payload.decisions : [],
      generatedChanges: Array.isArray(payload.generatedChanges) ? payload.generatedChanges : [],
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
    return { html: text, humanModel: {}, files: {}, analysis: '', decisions: [], generatedChanges: [], systemPrompt: '', state: {}, suggestedActions: [], capabilities: {}, continuationPlan: null, preload: [] }
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
      humanModel: project.humanModel,
      technicalModel: project.technicalModel,
      evolutionHistory: project.evolutionHistory?.slice(-8) || [],
      generationHistory: project.generationHistory?.slice(-5) || [],
      metadata: project.metadata
    } : null,
    architecture: strategy?.description || 'User Input → Capability Detection → Builder → Healthcheck → Display',
    generationStrategy: {
      id: strategy?.id || 'fast',
      plannerAllowed: Boolean(strategy?.usesPlanner),
      instruction: strategy?.usesPlanner ? 'Reason first at the human/design level, then build. Expose the concise reasoning only through analysis, decisions and generatedChanges.' : 'Even on the fast path, interpret the user intention at the human/design level before building; expose it through analysis, decisions and generatedChanges.',
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
