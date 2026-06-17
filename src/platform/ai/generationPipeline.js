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

  if (!html.trim()) checks.push({ id: 'html-present', ok: false, message: 'Aucun document HTML généré.' })
  else checks.push({ id: 'html-present', ok: true, message: 'Application Generated.' })

  if (capabilities.webgl) {
    checks.push({ id: 'webgl-canvas', ok: /<canvas[\s>]/i.test(html), message: 'WebGL canvas declared.' })
    checks.push({ id: 'webgl-renderer', ok: /webgl|experimental-webgl|getContext\(['"]webgl/i.test(html), message: 'Renderer initialization detected.' })
    checks.push({ id: 'webgl-camera-scene', ok: /camera|scene|perspective|viewport/i.test(html), message: 'Scene/camera hints detected.' })
  }

  if (capabilities.audio) {
    checks.push({ id: 'audio-context', ok: /AudioContext|webkitAudioContext/i.test(html), message: 'Audio context initialization detected.' })
  }

  if (capabilities.simulation) {
    checks.push({ id: 'simulation-loop', ok: /requestAnimationFrame|setInterval/i.test(html), message: 'Simulation loop detected.' })
  }

  if (capabilities.map) {
    checks.push({ id: 'map-surface', ok: /map|gps|geolocation|navigator\.geolocation|svg/i.test(html), message: 'Map/navigation surface detected.' })
  }

  if (capabilities.speech) {
    checks.push({ id: 'speech-api', ok: /SpeechRecognition|webkitSpeechRecognition|speechSynthesis/i.test(html), message: 'Speech API detected.' })
  }

  const failedChecks = checks.filter((check) => !check.ok)
  return {
    status: failedChecks.length ? 'generated' : 'verified',
    label: failedChecks.length ? 'Application Generated' : 'Application Verified',
    strategyId: strategy.id || 'fast',
    depth: strategy.healthcheckDepth || 'light',
    checks
  }
}
