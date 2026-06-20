import { MANIFESTATION_DESIGN_SYSTEM } from './designSystem.js'

const CREATE_APP_INSTRUCTIONS = [
  'You generate standalone HTML applications for Creatia.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Required shape: { "humanModel": object, "analysis": string, "decisions": array, "generatedChanges": array, "html": string, "files": object, "systemPrompt": string, "state": object, "suggestedActions": array, "capabilities": object, "continuationPlan": null, "preload": array }.',
  'html must be a complete standalone executable HTML5 document with embedded CSS and JavaScript.',
  'Generated applications must be self-contained and runnable offline.',
  'Prefer browser-native technologies and avoid external dependencies unless explicitly requested.',
  'Support mobile devices, touch, scrolling, and dark mode when useful.',
  'suggestedActions must be [].',
  'continuationPlan must be null.',
  'preload must be [].',
  'capabilities.runtimeCapabilities.aiGeneration must be false unless the user explicitly requests runtime AI generation.',
  'Do not include runtime AI bridge instructions, callback protocols, room/narrative/runtimePayload protocols, preload orchestration, or continuationPlan requirements.'
]

const CO_CREATE_APP_INSTRUCTIONS = [
  'You generate standalone Co-Create HTML applications for Creatia / Evolutia.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Required shape: { "humanModel": object, "analysis": string, "decisions": array, "generatedChanges": array, "html": string, "files": object, "systemPrompt": string, "state": object, "suggestedActions": array, "capabilities": object, "continuationPlan": object, "preload": array }.',
  'html must be a complete standalone executable HTML5 document with embedded CSS and JavaScript.',
  'Generated applications must be self-contained and runnable offline.',
  'capabilities.runtimeCapabilities.aiGeneration must be true.',
  'continuationPlan must describe how runtime generation should continue this app.',
  'preload must be an array of lightweight metadata/content seeds useful for the next runtime updates.',
  'Runtime contract: the app may call window.requestAiGeneration({ trigger, state, continuationPlan, preload, context }) when the user asks for AI content.',
  'Runtime contract: the app must expose window.applyRuntimePayload(runtimePayload) and update itself in place without reloading.',
  'Any AI-triggered action must show loading while pending, apply runtimePayload on success, clear loading on success or failure, and expose an error state on failure.',
  'Prevent duplicate runtime requests in the app UI: one user interaction should call requestAiGeneration once.'
]

const RUNTIME_GENERATION_INSTRUCTIONS = [
  'You generate one lightweight runtime update for a running Creatia Co-Create HTML app.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Required shape: { "runtimePayload": object, "state": object, "analysis": string, "decisions": array, "generatedChanges": array }.',
  'runtimePayload is the exact payload that window.applyRuntimePayload(runtimePayload) will receive.',
  'Prefer small explicit payloads over rebuilding the whole app.',
  'Do not return a full HTML document unless the app specifically asks for HTML inside runtimePayload.'
]

function getAppInstructions(mode) {
  return mode === 'co-create' ? CO_CREATE_APP_INSTRUCTIONS : CREATE_APP_INSTRUCTIONS
}

export function buildRuntimeGenerationPrompt({ request = {}, project = null, designSystem = MANIFESTATION_DESIGN_SYSTEM } = {}) {
  const payload = {
    task: 'runtime_generation',
    mode: 'co-create',
    trigger: request.trigger || 'runtime',
    state: request.state || {},
    continuationPlan: request.continuationPlan || project?.continuationPlan || null,
    preload: Array.isArray(request.preload) ? request.preload : project?.preloadQueue || [],
    context: request.context || {},
    project: project ? {
      creationRequest: project.creationRequest,
      applicationState: project.applicationState,
      humanModel: project.humanModel,
      systemPrompt: project.systemPrompt
    } : null,
    designSystem
  }

  return {
    kind: 'runtime_generation',
    prompt: [RUNTIME_GENERATION_INSTRUCTIONS.join('\n'), JSON.stringify(payload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'html', mode: 'co-create', task: 'runtime_generation', projectId: project?.id || null }
  }
}

export function normalizeStructuredAiResponse(payload = {}) {
  if (Object.prototype.hasOwnProperty.call(payload, 'html') || Object.prototype.hasOwnProperty.call(payload, 'runtimePayload') || payload.humanModel || payload.analysis || payload.decisions || payload.generatedChanges) {
    return {
      html: payload.html || '',
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
      preload: Array.isArray(payload.preload) ? payload.preload : [],
      runtimePayload: payload.runtimePayload && typeof payload.runtimePayload === 'object' ? payload.runtimePayload : null
    }
  }

  const text = payload.text || ''
  try {
    const parsed = JSON.parse(text)
    return normalizeStructuredAiResponse(parsed)
  } catch {
    return { html: text, humanModel: {}, files: {}, analysis: '', decisions: [], generatedChanges: [], systemPrompt: '', state: {}, suggestedActions: [], capabilities: {}, continuationPlan: null, preload: [], runtimePayload: null }
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
    prompt: [getAppInstructions(mode).join('\n'), JSON.stringify(userPayload, null, 2)].join('\n\n'),
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
    prompt: [getAppInstructions(mode).join('\n'), JSON.stringify(repairPayload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'html', mode, designSystem, strategyId: 'recovery', capabilities, attempt, maxAttempts }
  }
}

export function buildHumanModelRefreshPrompt({ project, designSystem = MANIFESTATION_DESIGN_SYSTEM }) {
  const payload = {
    task: 'refresh_human_model_from_current_html',
    instruction: [
      'Analyze the current standalone HTML application and rebuild only the human/design representation.',
      'Do not replace, rewrite, repair, merge, or regenerate the HTML application.',
      'Return the required JSON shape, but set html to an empty string and files to an empty object.',
      'Regenerate humanModel, analysis, decisions, and generatedChanges so future evolutions understand the imported application.'
    ].join(' '),
    currentHtml: project?.currentApplication || '',
    previousHumanModel: project?.humanModel || {},
    previousEvolutionHistory: project?.evolutionHistory?.slice(-8) || [],
    designSystem
  }

  return {
    kind: 'human_model_refresh',
    prompt: [CREATE_APP_INSTRUCTIONS.join('\n'), JSON.stringify(payload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'html', projectId: project?.id || null, refreshOnly: true, designSystem }
  }
}
