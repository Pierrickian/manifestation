const DEFAULT_RUNTIME_MODEL = Object.freeze({
  version: 1,
  state: {},
  events: [],
  actions: [],
  evolutionPoints: []
})

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export function normalizeRuntimeModel(model = {}) {
  const source = isPlainObject(model) ? model : {}

  return {
    version: Number(source.version || DEFAULT_RUNTIME_MODEL.version),
    state: isPlainObject(source.state) ? source.state : {},
    events: normalizeArray(source.events),
    actions: normalizeArray(source.actions),
    evolutionPoints: normalizeArray(source.evolutionPoints)
  }
}

export function validateRuntimeModel(model = {}) {
  const normalized = normalizeRuntimeModel(model)
  const errors = []

  if (!Number.isFinite(normalized.version) || normalized.version < 1) {
    errors.push('runtimeModel.version must be a positive number')
  }

  if (!isPlainObject(normalized.state)) errors.push('runtimeModel.state must be an object')
  if (!Array.isArray(normalized.events)) errors.push('runtimeModel.events must be an array')
  if (!Array.isArray(normalized.actions)) errors.push('runtimeModel.actions must be an array')
  if (!Array.isArray(normalized.evolutionPoints)) errors.push('runtimeModel.evolutionPoints must be an array')

  return {
    ok: errors.length === 0,
    errors,
    runtimeModel: normalized
  }
}

export function normalizeRuntimeAppResponse(payload = {}) {
  const source = isPlainObject(payload) ? payload : {}
  const runtimeModel = normalizeRuntimeModel(source.runtimeModel)

  return {
    kind: source.kind || 'creatia_runtime_app',
    html: typeof source.html === 'string' ? source.html.trim() : '',
    runtimeModel,
    analysis: typeof source.analysis === 'string' ? source.analysis : '',
    decisions: normalizeArray(source.decisions),
    generatedChanges: normalizeArray(source.generatedChanges),
    suggestedActions: normalizeArray(source.suggestedActions)
  }
}

export function validateRuntimeAppResponse(payload = {}) {
  const normalized = normalizeRuntimeAppResponse(payload)
  const runtimeValidation = validateRuntimeModel(normalized.runtimeModel)
  const errors = [...runtimeValidation.errors]

  if (normalized.kind !== 'creatia_runtime_app') errors.push('kind must be creatia_runtime_app')
  if (!/^\s*(<!doctype html|<html)/i.test(normalized.html)) errors.push('html must be a complete HTML document')

  return {
    ok: errors.length === 0,
    errors,
    response: {
      ...normalized,
      runtimeModel: runtimeValidation.runtimeModel
    }
  }
}
