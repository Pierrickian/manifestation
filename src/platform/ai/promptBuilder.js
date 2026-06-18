import { MANIFESTATION_DESIGN_SYSTEM } from './designSystem'

const STRUCTURED_APP_INSTRUCTIONS = [
  'You are the hidden application architect for Creatia / Evolutia. The goal is not to generate HTML; the goal is to translate natural-language intentions into design decisions, then render the technical consequence.',
  'The user never needs to know about HTML, CSS, JavaScript, React, components, frameworks, databases, APIs, persistence, rendering, or implementation details.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Return one explicit response kind. Final applications use { "kind": "html_app", "humanModel": object, "analysis": string, "decisions": array, "generatedChanges": array, "html": string, "files": object, "systemPrompt": string, "state": object, "suggestedActions": array, "capabilities": object, "runtimeCapabilities": object, "continuationPlan": object|null, "preload": array }.',
  'Intermediate capability negotiation uses { "kind": "capability_request", "requestedCapabilities": object, "reason": string, "retryPrompt": string }. Clarification uses { "kind": "clarification_request", "question": string }. Genuine failures use { "kind": "generation_error", "error": string }.',
  'humanModel must describe the human level: { "purpose": string, "audience": string, "tone": string, "emotion": string, "journey": string, "sections": array }.',
  'analysis must explain the design reasoning before implementation: goal, audience, desired emotion, UX journey, readability, information density, interactions, and business constraints when relevant.',
  'decisions must list the design decisions derived from the user intention before code generation.',
  'generatedChanges must list the concrete technical consequences of those decisions.',
  'In create mode, html must be a complete standalone executable HTML5 document with embedded CSS and JavaScript. Create mode is a single self-contained generation, may run offline, requires no runtime AI dependency, and must not expect future AI interaction.',
  'In co-create mode, html must still be executable as an application shell, but it is an AI-driven living experience that expects runtime AI collaboration rather than a finished static offline artifact.',
  'Generated applications must be self-contained for create mode, and must contain their runtime AI collaboration loop for co-create mode.',
  'Prefer browser-native technologies.',
  'Avoid external libraries whenever possible.',
  'A downloaded HTML file should continue to work offline after export in create mode. In co-create mode, local procedural content is allowed only as a clearly labeled fallback and must never replace AI collaboration when AI is available.',
  'Support mobile devices, touch events, scrolling, dark mode, Canvas/SVG/WebGL when useful, and offline execution.',
  'Every generated screen or panel that contains informational text, instructions, logs, descriptions, story content, results, settings, or help must be vertically scrollable on mobile, even when the first version appears short.',
  'Use safe scroll containers such as main, section, .screen, .panel, or .content with overflow-y: auto and -webkit-overflow-scrolling: touch; avoid locking text-heavy interfaces behind fixed 100vh layouts without scroll.',
  'systemPrompt is a hidden evolution prompt that explains how to continue evolving this specific project.',
  'state stores persistent application state and decisions that future evolutions must preserve.',
  'currentApplication/html is the single authoritative active HTML source. files stores optional supporting technical artifacts only, for example { "styles.css": string, "app.js": string }; do not duplicate the complete HTML document in files["index.html"].',
  'capabilities must declare expected app capabilities, for example { "webgl": true, "audio": false, "simulation": true }.',
  'runtimeCapabilities must always declare { "aiGeneration": boolean, "aiStreaming": boolean, "online": boolean, "offline": boolean }. In co-create mode aiGeneration and online must be true; offline may be true only as a fallback capability. In create mode aiGeneration should be false unless the user explicitly asks for runtime AI.',
  'suggestedActions is only for visible, user-facing evolution buttons in Co-Create mode. Keep each item short, actionable, optional, and user-centric, for example "Add a shop", "Add a harder level", or "Add a minimap". In create mode return an empty array.',
  'continuationPlan is mandatory in Co-Create mode. It is the durable AI-to-engine collaboration memory, not a UI feature and not a list of buttons. Use it to preserve the AI role such as game master, narrator, coach, teacher, or simulation director; long-term objectives; world/teaching/simulation rules; narrative continuity; collaboration rules; orchestration logic; expected callbacks; and session strategy. In create mode return null.',
  'preload is mandatory and non-empty in Co-Create mode. It is the future-preparation channel for anticipation and latency hiding, not a user suggestion and not a continuationPlan duplicate. Return future generation candidates, prepared prompts, prepared branches, probable future content, or optional prepared fragments. Put trigger definitions on preload entries, for example { "trigger": "monster_defeated", "preparedPrompt": "...", "confidence": 0.9 }. In create mode return an empty array.',
  'Co-Create HTML must include a runtime AI protocol surface that can call or stub requestAiGeneration({ trigger, state, continuationPlan, preload, context }), emit runtime events such as ai_request, needs_generation, state_transition, user_choice, milestone_reached, content_exhausted, branch_requested, preload_requested, or preload_consumed, consume continuationPlan and preload during execution, expose runtime AI status such as AI Connected, AI Generating, AI Unavailable, Reconnecting, or Local Fallback Active, preserve session continuity, and resume after reconnection.',
  'Co-Create generated apps must implement window.applyRuntimePayload = function(runtimePayload) { ... } for new applications. It must directly consume runtimePayload.room, runtimePayload.narrative, runtimePayload.choices, and runtimePayload.statePatch, merge state patches into the running state, render new rooms/narrative/teacher steps/simulation steps immediately, and continue the experience without reloading the full HTML application. window.onAiResponse = function(event) { ... } may be exposed as an additional hook. Legacy consumers window.applyGeneratedContent(payload) and window.applyGeneratedRoom(roomOrPayload) may also be used for backward compatibility, but new code should prefer event.data.runtimePayload.',
  'Any in-game button that depends on an AI callback must either call window.requestAiGeneration(...) directly, dispatch a CustomEvent such as needs_generation/ai_request/preload_requested/branch_requested/content_exhausted with trigger and state detail, or include data-ai-trigger/data-runtime-trigger/data-generation-trigger so the runtime bridge can request AI generation. Never leave AI callback buttons as inert local buttons.',
  'In Co-Create mode, generating a static application that never requests AI content, only uses local procedural generation, behaves identically with or without AI, or exposes suggestions without a runtime collaboration mechanism is invalid.',
  'Co-Create applications must never display "Offline" by default; status text must reflect the actual AI runtime state such as Connecting, AI Connected, AI Unavailable, Reconnecting, or Local Mode.',
  'If the app has an intro or description panel with a Play, Start, Jouer, Lancer, or Commencer button, make that panel interactive and hide/remove it as soon as the user starts so the actual game or app receives focus.',
  'Do not use external dependencies or remote assets unless the user explicitly requests them.'
]

export function normalizeStructuredAiResponse(payload = {}) {
  const explicitKind = typeof payload.kind === 'string' ? payload.kind : ''
  if (explicitKind === 'capability_request') {
    return {
      kind: 'capability_request',
      requestedCapabilities: payload.requestedCapabilities && typeof payload.requestedCapabilities === 'object' ? payload.requestedCapabilities : {},
      reason: payload.reason || '',
      retryPrompt: payload.retryPrompt || ''
    }
  }
  if (explicitKind === 'clarification_request') {
    return { kind: 'clarification_request', question: payload.question || payload.message || '' }
  }
  if (explicitKind === 'generation_error') {
    return { kind: 'generation_error', error: payload.error || payload.message || 'Generation failed.' }
  }
  if (!explicitKind && payload.requestedCapabilities && typeof payload.requestedCapabilities === 'object') {
    return {
      kind: 'capability_request',
      requestedCapabilities: payload.requestedCapabilities,
      reason: payload.reason || '',
      retryPrompt: payload.retryPrompt || ''
    }
  }
  if (!explicitKind && (payload.question || payload.clarificationQuestion)) {
    return { kind: 'clarification_request', question: payload.question || payload.clarificationQuestion || '' }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'html') || payload.humanModel || payload.analysis || payload.decisions || payload.generatedChanges) {
    return {
      kind: 'html_app',
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
      runtimeCapabilities: payload.runtimeCapabilities && typeof payload.runtimeCapabilities === 'object' ? payload.runtimeCapabilities : payload.capabilities?.runtimeCapabilities || {},
      continuationPlan: payload.continuationPlan && typeof payload.continuationPlan === 'object' ? payload.continuationPlan : null,
      preload: Array.isArray(payload.preload) ? payload.preload : []
    }
  }

  if (payload && typeof payload === 'object' && Object.keys(payload).length && !payload.text) {
    return { kind: 'generation_error', error: `Unsupported AI response shape: ${Object.keys(payload).join(', ')}` }
  }

  const text = payload.text || ''
  try {
    const parsed = JSON.parse(text)
    return normalizeStructuredAiResponse(parsed)
  } catch {
    return { kind: 'html_app', html: text, humanModel: {}, files: {}, analysis: '', decisions: [], generatedChanges: [], systemPrompt: '', state: {}, suggestedActions: [], capabilities: {}, runtimeCapabilities: {}, continuationPlan: null, preload: [] }
  }
}

export function buildAiPrompt({ input, mode = 'create', designSystem = MANIFESTATION_DESIGN_SYSTEM, project = null, capabilities = {}, strategy = {}, hasTime = false }) {
  const isCoCreate = mode === 'co-create'
  const task = project ? 'evolve_project' : 'create_project'
  const userPayload = {
    task,
    mode,
    collaboration: isCoCreate ? 'Co-Create enabled: generate a living AI collaboration loop. suggestedActions may expose visible user choices; continuationPlan is mandatory AI↔engine collaboration memory; preload is mandatory trigger-driven future preparation for latency hiding; the runtime must consume both and expose AI status.' : 'Create mode: generation-focused standalone application; suggestedActions must be empty, continuationPlan must be null, preload must be empty, and no runtime AI loop is required.',
    userRequest: input.trim(),
    currentProject: project ? {
      creationRequest: project.creationRequest,
      currentApplication: project.currentApplication,
      systemPrompt: project.systemPrompt,
      applicationState: project.applicationState,
      humanModel: project.humanModel,
      technicalModel: project.technicalModel,
      continuationPlan: project.continuationPlan,
      preloadQueue: project.preloadQueue || [],
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
    requiredRuntimeCapabilities: isCoCreate
      ? { aiGeneration: true, aiStreaming: false, online: true, offline: true }
      : { aiGeneration: false, aiStreaming: false, online: false, offline: true },
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
    prompt: [STRUCTURED_APP_INSTRUCTIONS.join('\n'), JSON.stringify(payload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'html', projectId: project?.id || null, refreshOnly: true, designSystem }
  }
}
