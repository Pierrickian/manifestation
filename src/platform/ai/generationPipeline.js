const CAPABILITY_RULES = [
  { id: 'webgl', terms: ['3d', 'webgl', 'solar system', 'planet', 'orbit', 'orbite', 'planète', 'systeme solaire', 'système solaire'] },
  { id: 'map', terms: ['map', 'gps', 'navigation', 'carte', 'itinéraire', 'itineraire'] },
  { id: 'speech', terms: ['microphone', 'speech', 'voice', 'voix', 'parole', 'vocal'] },
  { id: 'simulation', terms: ['game', 'simulation', 'physics', 'jeu', 'physique'] }
]

const SMART_COMPLEXITY_TERMS = [
  'advanced', 'complex', 'multi-system', 'multisystem', 'multiplayer', '3d', 'webgl', 'simulation', 'physics', 'game', 'open world',
  'complexe', 'avancé', 'avance', 'multi-système', 'multijoueur', 'jeu', 'physique'
]

const CONFIDENCE_SCORE = { low: 1, medium: 2, high: 3 }
const AUTO_REPAIR_CONFIDENCES = new Set(['high', 'medium'])

function createCheck({ id, ok, message, expected, actual, repairConfidence = 'low', repairable = false, severity = 'critical' }) {
  return { id, ok, message, expected, actual: ok ? 'Detected.' : actual, repairConfidence, repairable, severity }
}

function getRepairConfidence(failedChecks) {
  if (!failedChecks.length) return 'none'
  return failedChecks.reduce((current, check) => (
    CONFIDENCE_SCORE[check.repairConfidence] < CONFIDENCE_SCORE[current] ? check.repairConfidence : current
  ), 'high')
}

export function isAutoRepairableHealthcheck(healthcheck = {}) {
  return AUTO_REPAIR_CONFIDENCES.has(healthcheck.repairConfidence) && Boolean(healthcheck.failedChecks?.some((check) => check.repairable && check.severity !== 'warning'))
}

export function detectCapabilities(input = '') {
  const normalized = String(input).toLowerCase()
  return CAPABILITY_RULES.reduce((capabilities, rule) => ({
    ...capabilities,
    [rule.id]: rule.terms.some((term) => normalized.includes(term))
  }), {})
}

export function selectGenerationStrategy({ input = '', capabilities = {}, mode = 'create', hasTime = false } = {}) {
  const normalized = String(input).toLowerCase()
  const smartByCapability = Boolean(capabilities.webgl || (capabilities.simulation && (capabilities.map || capabilities.speech)))
  const smartByComplexity = SMART_COMPLEXITY_TERMS.some((term) => normalized.includes(term)) && (capabilities.webgl || capabilities.simulation)
  const authorizedSmartPath = hasTime || mode === 'co-create'

  if (authorizedSmartPath && (smartByCapability || smartByComplexity)) {
    return {
      id: 'smart',
      label: 'Smart Path',
      usesPlanner: true,
      healthcheckDepth: hasTime ? 'deep' : 'standard',
      description: 'Capability Detection → Planner → Builder → Healthcheck → Display'
    }
  }

  return {
    id: 'fast',
    label: 'Fast Path',
    usesPlanner: false,
    healthcheckDepth: hasTime ? 'standard' : 'light',
    description: 'Capability Detection → Builder → Healthcheck → Display'
  }
}

export function buildCapabilityContract(capabilities = {}) {
  return {
    webgl: Boolean(capabilities.webgl),
    map: Boolean(capabilities.map),
    speech: Boolean(capabilities.speech),
    simulation: Boolean(capabilities.simulation),
    audio: Boolean(capabilities.speech),
    runtimeCapabilities: {
      aiGeneration: Boolean(capabilities.runtimeCapabilities?.aiGeneration),
      aiStreaming: Boolean(capabilities.runtimeCapabilities?.aiStreaming),
      online: Boolean(capabilities.runtimeCapabilities?.online),
      offline: Boolean(capabilities.runtimeCapabilities?.offline)
    }
  }
}

function hasInformationalText(html = '') {
  const text = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .trim()

  return text.split(/\s+/).filter(Boolean).length >= 30
}

function hasScrollableTextSurface(html = '') {
  return /overflow-y\s*:\s*(auto|scroll)|overflow\s*:\s*(auto|scroll)|-webkit-overflow-scrolling\s*:\s*touch|scrollable|data-scrollable/i.test(String(html))
}

function isNonEmptyObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length)
}

function hasRuntimeAiGenerationPath(html = '') {
  return /requestAiGeneration|needs_generation|preload_requested|preload_consumed|branch_requested|content_exhausted|ai_request|data-ai-trigger|data-runtime-trigger|data-generation-trigger|postMessage\s*\(/i.test(String(html))
}

function exposesRuntimeAiStatus(html = '') {
  return /AI Connected|AI Generating|AI Unavailable|Reconnecting|Local Fallback Active|Connecting|Local Mode|data-ai-status|ai-status|aiStatus/i.test(String(html))
}

function consumesContinuationPlan(html = '') {
  return /continuationPlan|continuation-plan|collaborationPlan|collaboration-plan/i.test(String(html))
}

function consumesPreload(html = '') {
  return /\bpreload\b|preloadQueue|preload_requested|preload_consumed|preparedPrompt/i.test(String(html))
}

function consumesRuntimePayload(html = '') {
  const text = String(html)
  const hasStandardConsumer = /applyRuntimePayload|onAiResponse/i.test(text)
  const consumesCoreFields = /runtimePayload\s*\.\s*(room|narrative|choices|statePatch)|runtimePayload\s*\[\s*['"](?:room|narrative|choices|statePatch)['"]\s*\]/i.test(text)
  return hasStandardConsumer && consumesCoreFields
}

function displaysOfflineByDefault(html = '') {
  return />\s*Offline\s*</i.test(String(html)) || /status[^<>"']*Offline/i.test(String(html))
}

export function runGeneratedAppHealthcheck(response = {}, strategy = {}) {
  if (response.kind && response.kind !== 'html_app') {
    return {
      status: 'skipped',
      label: 'Intermediate Builder Response',
      strategyId: strategy.id || 'fast',
      depth: strategy.healthcheckDepth || 'light',
      mode: strategy.mode || response.mode || 'create',
      repairConfidence: 'none',
      isRepairable: false,
      passedCount: 0,
      failedCount: 0,
      warningCount: 0,
      checks: [],
      failedChecks: []
    }
  }

  const html = String(response.html || '')
  const capabilities = buildCapabilityContract(response.capabilities || {})
  const runtimeCapabilities = {
    ...capabilities.runtimeCapabilities,
    ...(response.runtimeCapabilities || {}),
    ...(response.capabilities?.runtimeCapabilities || {})
  }
  const mode = strategy.mode || response.mode || 'create'
  const isCoCreate = mode === 'co-create'
  const checks = []

  checks.push(createCheck({
    id: 'html-present',
    ok: Boolean(html.trim()),
    message: html.trim() ? 'Application Generated.' : 'Aucun document HTML généré.',
    expected: 'A complete standalone HTML5 document.',
    actual: 'The generated application is empty.',
    repairConfidence: 'medium',
    repairable: true
  }))

  if (hasInformationalText(html)) {
    checks.push(createCheck({
      id: 'text_screens_scrollable',
      ok: hasScrollableTextSurface(html),
      message: 'Scrollable text surfaces detected.',
      expected: 'Every information-rich screen or panel has a vertical scroll container for mobile.',
      actual: 'Text content was detected without an explicit scrollable container.',
      repairConfidence: 'high',
      repairable: true
    }))
  }

  if (capabilities.webgl) {
    checks.push(createCheck({ id: 'canvas_exists', ok: /<canvas[\s>]/i.test(html), message: 'WebGL canvas declared.', expected: 'A visible canvas element for WebGL rendering.', actual: 'No canvas element was detected.', repairConfidence: 'high', repairable: true }))
    checks.push(createCheck({ id: 'renderer_initialized', ok: /webgl|experimental-webgl|getContext\(['"]webgl/i.test(html), message: 'Renderer initialization detected.', expected: 'A WebGL renderer/context initialization.', actual: 'No WebGL context initialization was detected.', repairConfidence: 'high', repairable: true }))
    checks.push(createCheck({ id: 'scene_visible', ok: /camera|scene|perspective|viewport/i.test(html), message: 'Scene/camera hints detected.', expected: 'A valid camera/scene setup with visible rendered objects.', actual: 'No scene, camera, perspective, or viewport setup was detected.', repairConfidence: 'high', repairable: true }))
  }

  if (capabilities.audio) {
    checks.push(createCheck({ id: 'audio_context_initialized', ok: /AudioContext|webkitAudioContext/i.test(html), message: 'Audio context initialization detected.', expected: 'An initialized browser audio context.', actual: 'No AudioContext initialization was detected.', repairConfidence: 'medium', repairable: true }))
  }

  if (capabilities.simulation) {
    checks.push(createCheck({ id: 'simulation_loop_running', ok: /requestAnimationFrame|setInterval/i.test(html), message: 'Simulation loop detected.', expected: 'A simulation loop driven by requestAnimationFrame or a timer.', actual: 'No animation or simulation loop was detected.', repairConfidence: 'high', repairable: true }))
  }

  if (capabilities.map) {
    checks.push(createCheck({ id: 'map_surface_exists', ok: /map|gps|geolocation|navigator\.geolocation|svg/i.test(html), message: 'Map/navigation surface detected.', expected: 'A map, navigation, GPS, geolocation, SVG, or equivalent surface.', actual: 'No map/navigation surface was detected.', repairConfidence: 'medium', repairable: true }))
  }

  if (capabilities.speech) {
    checks.push(createCheck({ id: 'speech_api_initialized', ok: /SpeechRecognition|webkitSpeechRecognition|speechSynthesis/i.test(html), message: 'Speech API detected.', expected: 'Speech recognition or synthesis API initialization.', actual: 'No browser speech API usage was detected.', repairConfidence: 'medium', repairable: true }))
  }

  if (isCoCreate) {
    checks.push(createCheck({
      id: 'cocreate_continuation_plan_exists',
      ok: isNonEmptyObject(response.continuationPlan),
      message: 'Co-Create continuation plan detected.',
      expected: 'A non-empty continuationPlan object for AI-to-engine collaboration memory.',
      actual: 'continuationPlan is missing, null, or empty.',
      repairConfidence: 'high',
      repairable: true,
      severity: 'warning'
    }))

    checks.push(createCheck({
      id: 'cocreate_preload_entries_exist',
      ok: Array.isArray(response.preload) && response.preload.length > 0,
      message: 'Co-Create preload entries detected.',
      expected: 'A non-empty preload array of trigger-driven future preparation entries.',
      actual: 'preload is missing or empty.',
      repairConfidence: 'high',
      repairable: true,
      severity: 'warning'
    }))

    checks.push(createCheck({
      id: 'cocreate_runtime_ai_generation_enabled',
      ok: runtimeCapabilities.aiGeneration === true,
      message: 'Runtime AI generation capability enabled.',
      expected: 'runtimeCapabilities.aiGeneration must be true in Co-Create mode.',
      actual: `runtimeCapabilities.aiGeneration is ${String(runtimeCapabilities.aiGeneration)}.`,
      repairConfidence: 'high',
      repairable: true,
      severity: 'warning'
    }))

    checks.push(createCheck({
      id: 'cocreate_runtime_ai_status_exposed',
      ok: exposesRuntimeAiStatus(html),
      message: 'Runtime AI status surface detected.',
      expected: 'The generated application exposes AI runtime status such as AI Connected, AI Generating, AI Unavailable, Reconnecting, or Local Fallback Active.',
      actual: 'No runtime AI status surface was detected.',
      repairConfidence: 'high',
      repairable: true,
      severity: 'warning'
    }))

    checks.push(createCheck({
      id: 'cocreate_ai_generation_pathway_exists',
      ok: hasRuntimeAiGenerationPath(html),
      message: 'Runtime AI generation pathway detected.',
      expected: 'At least one runtime generation pathway such as requestAiGeneration, ai_request, needs_generation, preload_requested, or branch_requested.',
      actual: 'No runtime AI generation pathway was detected.',
      repairConfidence: 'high',
      repairable: true,
      severity: 'warning'
    }))

    checks.push(createCheck({
      id: 'cocreate_consumes_continuation_plan',
      ok: consumesContinuationPlan(html),
      message: 'Runtime continuationPlan consumption detected.',
      expected: 'The generated application must be capable of consuming continuationPlan during execution.',
      actual: 'No continuationPlan consumption was detected in the application runtime.',
      repairConfidence: 'high',
      repairable: true,
      severity: 'warning'
    }))

    checks.push(createCheck({
      id: 'cocreate_consumes_preload',
      ok: consumesPreload(html),
      message: 'Runtime preload consumption detected.',
      expected: 'The generated application must be capable of consuming preload entries during execution.',
      actual: 'No preload consumption was detected in the application runtime.',
      repairConfidence: 'high',
      repairable: true,
      severity: 'warning'
    }))

    checks.push(createCheck({
      id: 'cocreate_runtime_payload_consumer_exists',
      ok: consumesRuntimePayload(html),
      message: 'Runtime payload consumer detected.',
      expected: 'The generated application must implement applyRuntimePayload/onAiResponse and consume runtimePayload.room, runtimePayload.narrative, runtimePayload.choices, or runtimePayload.statePatch without reloading.',
      actual: 'No standard runtimePayload consumer was detected for direct in-app continuation.',
      repairConfidence: 'high',
      repairable: true,
      severity: 'warning'
    }))

    checks.push(createCheck({
      id: 'cocreate_not_offline_by_default',
      ok: !displaysOfflineByDefault(html),
      message: 'Co-Create status does not default to Offline.',
      expected: 'Co-Create applications must not display "Offline" by default; status should reflect AI runtime state.',
      actual: 'The generated application appears to display "Offline" as a default status.',
      repairConfidence: 'medium',
      repairable: true,
      severity: 'warning'
    }))
  }

  const failedChecks = checks.filter((check) => !check.ok)
  const criticalFailures = failedChecks.filter((check) => check.severity !== 'warning')
  const warningFailures = failedChecks.filter((check) => check.severity === 'warning')
  const repairConfidence = getRepairConfidence(criticalFailures)
  return {
    status: criticalFailures.length ? 'generated' : warningFailures.length ? 'warning' : 'verified',
    label: criticalFailures.length ? 'Application Generated' : warningFailures.length ? 'Application Verified with Warnings' : 'Application Verified',
    strategyId: strategy.id || 'fast',
    depth: strategy.healthcheckDepth || 'light',
    mode,
    repairConfidence,
    isRepairable: AUTO_REPAIR_CONFIDENCES.has(repairConfidence) && criticalFailures.some((check) => check.repairable),
    passedCount: checks.length - failedChecks.length,
    failedCount: criticalFailures.length,
    warningCount: warningFailures.length,
    checks,
    failedChecks
  }
}
