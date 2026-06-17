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

function createCheck({ id, ok, message, expected, actual, repairConfidence = 'low', repairable = false }) {
  return { id, ok, message, expected, actual: ok ? 'Detected.' : actual, repairConfidence, repairable }
}

function getRepairConfidence(failedChecks) {
  if (!failedChecks.length) return 'none'
  return failedChecks.reduce((current, check) => (
    CONFIDENCE_SCORE[check.repairConfidence] < CONFIDENCE_SCORE[current] ? check.repairConfidence : current
  ), 'high')
}

export function isAutoRepairableHealthcheck(healthcheck = {}) {
  return AUTO_REPAIR_CONFIDENCES.has(healthcheck.repairConfidence) && Boolean(healthcheck.failedChecks?.some((check) => check.repairable))
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
    audio: Boolean(capabilities.speech)
  }
}

export function runGeneratedAppHealthcheck(response = {}, strategy = {}) {
  const html = String(response.html || '')
  const capabilities = buildCapabilityContract(response.capabilities || {})
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

  const failedChecks = checks.filter((check) => !check.ok)
  const repairConfidence = getRepairConfidence(failedChecks)
  return {
    status: failedChecks.length ? 'generated' : 'verified',
    label: failedChecks.length ? 'Application Generated' : 'Application Verified',
    strategyId: strategy.id || 'fast',
    depth: strategy.healthcheckDepth || 'light',
    repairConfidence,
    isRepairable: AUTO_REPAIR_CONFIDENCES.has(repairConfidence) && failedChecks.some((check) => check.repairable),
    passedCount: checks.length - failedChecks.length,
    failedCount: failedChecks.length,
    checks,
    failedChecks
  }
}
