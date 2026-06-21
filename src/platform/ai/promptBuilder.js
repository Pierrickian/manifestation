import { MANIFESTATION_DESIGN_SYSTEM } from './designSystem'

const BASE_APP_INSTRUCTIONS = [
  'You are the hidden application architect for Creatia / Evolutia.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Final applications must use { "kind": "html_app", "humanModel": object, "analysis": string, "decisions": array, "generatedChanges": array, "html": string, "files": object, "systemPrompt": string, "state": object, "suggestedActions": array, "capabilities": object, "runtimeCapabilities": object, "continuationPlan": object|null, "preload": array }.',
  'Intermediate capability negotiation uses { "kind": "capability_request", "requestedCapabilities": object, "reason": string, "retryPrompt": string }. Clarification uses { "kind": "clarification_request", "question": string }. Genuine failures use { "kind": "generation_error", "error": string }.',
  'html must be a complete standalone executable HTML5 document with embedded CSS and JavaScript.',
  'Prefer browser-native technologies and avoid external libraries unless explicitly requested.',
  'Support mobile devices, touch events, scrolling, dark mode, and Canvas/SVG/WebGL when useful.',
  'Every generated screen or panel that contains informational text must be vertically scrollable on mobile.',
  'files stores optional supporting artifacts only; do not duplicate the complete HTML document in files["index.html"].'
]

const CREATE_APP_INSTRUCTIONS = [
  ...BASE_APP_INSTRUCTIONS,
  'Create mode is simple: generate one standalone application. Do not include live collaboration behavior or future-update machinery.',
  'Create mode requirements: kind must be "html_app", suggestedActions must be [], continuationPlan must be null, preload must be [], runtimeCapabilities.aiGeneration must be false unless the user explicitly requested runtime AI.',
  'Create mode apps should be offline-capable when possible because they are standalone and do not require the Co-Create runtime host.',
  'The primary responsibility is valid JSON with executable html. A simple request such as "Un jeu de pendu" must return a playable standalone app.'
]

const CO_CREATE_APP_INSTRUCTIONS = [
  ...BASE_APP_INSTRUCTIONS,
  'Co-Create mode requirements: kind must be "html_app", html must be executable, continuationPlan must exist, preload must contain at least one trigger descriptor, and runtimeCapabilities.aiGeneration must be true.',
  'Generated Co-Create apps must call window.requestAiGeneration({ trigger, state, continuationPlan, preload, context }) when they need live AI content, but must never define, stub, override, assign, wrap, polyfill, or shadow window.requestAiGeneration; the Creatia host injects that bridge after the HTML loads.',
  'If typeof window.requestAiGeneration is not "function", show a clear "Bridge en attente" status and keep the UI enabled for retry; do not create a fallback requestAiGeneration function and do not mark the runtime permanently unavailable.',
  'Generated Co-Create apps must await or handle the Promise returned by window.requestAiGeneration, log status/payload diagnostics with the returned traceId when available, and clear loading states when it returns status "unavailable", "blocked", or "timeout".',
  'Generated Co-Create apps should listen for the "creatia-runtime-ready" event, also check window.CreatiaRuntime/requestAiGeneration at click time, and re-render their AI/runtime availability indicator when the host bridge appears.',
  'Generated Co-Create apps must implement window.applyRuntimePayload(runtimePayload) to receive runtimePayload, clear loading states, and update themselves without reloading.',
  'Generated Co-Create apps should log only app-level steps such as button pressed, requestAiGeneration called, raw response received, status received, payload detected, payload applied, or runtime error. Include the propagated traceId in those app logs when available. The injected Creatia runtime overlay logs host bridge and AI provider steps; do not claim the app contacts OpenAI directly.',
  'Do not label Co-Create runtime AI as offline-ready. The static shell may remain usable without the host, but live runtime generation requires an online Creatia parent bridge.',
  'continuationPlan must be short: one or two sentences only, for example { "runtimeRole": "Generate new inspiration cards when AI+ is pressed." }.',
  'preload must contain only trigger descriptors and context requirements, for example { "trigger": "ai_plus", "event": "renew_requested", "sendContext": ["originalRequest", "applicationState", "userHistory"] }.',
  'Do not generate future prompts, future content, precomputed cards, rooms, screens, stories, or citations in preload. Runtime AI will be recalled later with fresh context.',
  'For Co-Create runtime renewals, state may include explicit arrays such as choices, items, and statePatch so runtimePayload can update the running app in place.'
]

const RUNTIME_GENERATION_INSTRUCTIONS = [
  'You are the runtime AI for a Creatia / Evolutia Co-Create app.',
  'Return ONLY valid JSON, without Markdown or code fences.',
  'Return { "kind": "runtime_generation", "runtimePayload": object, "state": object, "continuationPlan": object|null, "preload": array }.',
  'Generate only the runtimePayload needed for the current trigger. Do not rebuild the full HTML app; for a page change, return page/screen/route/title/text/htmlFragment fields inside runtimePayload.',
  'runtimePayload must be directly consumable by window.applyRuntimePayload(runtimePayload). Include page, choices, items, statePatch, route, screen, title, text, or htmlFragment when relevant.'
]

function looksLikeHtmlDocument(value = '') {
  const text = String(value).trim()
  return /<!doctype\s+html|<html[\s>]|<body[\s>]|<main[\s>]|<section[\s>]|<script[\s>]|<style[\s>]|<div[\s>]/i.test(text)
}

function extractHtmlFromText(value = '') {
  const text = String(value || '').trim()
  const fencedHtml = text.match(/```(?:html)?\s*([\s\S]*?)```/i)?.[1]?.trim()
  if (fencedHtml && looksLikeHtmlDocument(fencedHtml)) return fencedHtml
  return looksLikeHtmlDocument(text) ? text : ''
}

function exposesInternalPromptOrJson(value = '') {
  const text = String(value || '')
  return /Return ONLY valid JSON|hidden application architect|requiredRuntimeCapabilities|detectedCapabilities|healthcheckReport|failedChecks|STRUCTURED_APP_INSTRUCTIONS|<pre[^>]*>\s*[{[]|<code[^>]*>\s*[{[]|&quot;kind&quot;\s*:\s*&quot;html_app|\"kind\"\s*:\s*\"html_app\"/i.test(text)
}

function extractBalancedLiteral(source = '', startIndex = 0) {
  const text = String(source || '')
  const opening = text[startIndex]
  const closing = opening === '{' ? '}' : opening === '[' ? ']' : ''
  if (!closing) return ''

  let depth = 0
  let quote = ''
  let escaped = false

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index]
    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === opening) depth += 1
    if (char === closing) depth -= 1
    if (depth === 0) return text.slice(startIndex, index + 1)
  }

  return ''
}

function parseLooseJsonLiteral(literal = '') {
  if (!literal) return null

  try {
    return JSON.parse(literal)
  } catch {
    // Continue with a conservative JSON-ish normalization for common AI-generated
    // inline JS object literals such as const continuationPlan = { runtimeRole: '...' }.
  }

  try {
    const normalized = literal
      .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
      .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, value) => JSON.stringify(value.replace(/\\'/g, "'")))
      .replace(/,\s*([}\]])/g, '$1')
    return JSON.parse(normalized)
  } catch {
    return null
  }
}

function extractDeclaredLiteral(html = '', name = '') {
  const declaration = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*`, 'i').exec(String(html || ''))
  if (!declaration) return null

  const startIndex = declaration.index + declaration[0].length
  const literal = extractBalancedLiteral(html, startIndex)
  return parseLooseJsonLiteral(literal)
}

function deriveCoCreateMetadataFromHtml(html = '') {
  const continuationPlan = extractDeclaredLiteral(html, 'continuationPlan')
  const preload = extractDeclaredLiteral(html, 'preload')

  return {
    continuationPlan: continuationPlan && typeof continuationPlan === 'object' && !Array.isArray(continuationPlan) ? continuationPlan : null,
    preload: Array.isArray(preload) ? preload : []
  }
}

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
  if (explicitKind === 'runtime_generation') {
    return {
      kind: 'runtime_generation',
      runtimePayload: payload.runtimePayload && typeof payload.runtimePayload === 'object' ? payload.runtimePayload : {},
      state: payload.state && typeof payload.state === 'object' ? payload.state : {},
      continuationPlan: payload.continuationPlan && typeof payload.continuationPlan === 'object' ? payload.continuationPlan : null,
      preload: Array.isArray(payload.preload) ? payload.preload : []
    }
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
    const html = payload.html || ''
    if (html && !looksLikeHtmlDocument(html)) {
      return { kind: 'generation_error', error: 'AI response html field did not contain an executable HTML document.' }
    }
    if (html && exposesInternalPromptOrJson(html)) {
      return { kind: 'generation_error', error: 'AI response html field exposed internal prompt/schema JSON instead of the application UI.' }
    }
    const derivedMetadata = deriveCoCreateMetadataFromHtml(html)
    return {
      kind: 'html_app',
      html,
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
      continuationPlan: payload.continuationPlan && typeof payload.continuationPlan === 'object' ? payload.continuationPlan : derivedMetadata.continuationPlan,
      preload: Array.isArray(payload.preload) && payload.preload.length ? payload.preload : derivedMetadata.preload,
      runtimePayload: payload.runtimePayload && typeof payload.runtimePayload === 'object' ? payload.runtimePayload : null
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
    const html = extractHtmlFromText(text)
    if (html) {
      if (exposesInternalPromptOrJson(html)) {
        return { kind: 'generation_error', error: 'AI response exposed internal prompt/schema JSON instead of the application UI.' }
      }
      return { kind: 'html_app', html, humanModel: {}, files: {}, analysis: '', decisions: [], generatedChanges: [], systemPrompt: '', state: {}, suggestedActions: [], capabilities: {}, runtimeCapabilities: {}, continuationPlan: null, preload: [] }
    }
    return { kind: 'generation_error', error: 'AI response did not contain valid structured JSON or an executable HTML document.' }
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
    prompt: [(isCoCreate ? CO_CREATE_APP_INSTRUCTIONS : CREATE_APP_INSTRUCTIONS).join('\n'), JSON.stringify(userPayload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'html', mode, designSystem, projectId: project?.id || null, strategyId: strategy?.id || 'fast', capabilities, hasTime }
  }
}

export function buildRuntimeGenerationPrompt({ runtimeRequest = {}, project = null, designSystem = MANIFESTATION_DESIGN_SYSTEM }) {
  const payload = {
    task: 'runtime_generation',
    originalRequest: project?.creationRequest || '',
    traceId: runtimeRequest.traceId || runtimeRequest.context?.traceId || '',
    trigger: runtimeRequest.trigger || 'runtime_generation',
    currentState: runtimeRequest.state || {},
    continuationPlan: runtimeRequest.continuationPlan || project?.continuationPlan || null,
    preload: runtimeRequest.preload || project?.preloadQueue || [],
    context: runtimeRequest.context || {},
    instruction: 'Generate only runtimePayload for this trigger. Do not return or rewrite the full HTML app. To move to another page, return runtimePayload.page, screen, route, title/text, or htmlFragment.'
  }

  return {
    kind: 'runtime_generation',
    prompt: [RUNTIME_GENERATION_INSTRUCTIONS.join('\n'), JSON.stringify(payload, null, 2)].join('\n\n'),
    metadata: { rendererType: 'runtime', mode: 'co-create', designSystem, projectId: project?.id || null, traceId: runtimeRequest.traceId || runtimeRequest.context?.traceId || '' }
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
      'This is a final repair pass, not a planning or negotiation step: do not return capability_request, clarification_request, or generation_error unless repair is impossible.',
      'When mode is co-create and only continuationPlan or preload is missing, keep the existing HTML runnable and repair the JSON collaboration metadata with a non-empty continuationPlan and trigger-driven preload entries.',
      'Return a corrected standalone HTML application using the required JSON shape.'
    ].join(' ')
  }

  return {
    kind: 'html_app_repair',
    prompt: [(mode === 'co-create' ? CO_CREATE_APP_INSTRUCTIONS : CREATE_APP_INSTRUCTIONS).join('\n'), JSON.stringify(repairPayload, null, 2)].join('\n\n'),
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
