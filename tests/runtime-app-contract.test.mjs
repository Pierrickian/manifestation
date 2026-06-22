import assert from 'node:assert/strict'
import {
  normalizeRuntimeModel,
  validateRuntimeAppResponse,
  validateRuntimeModel
} from '../src/platform/ai/runtime/runtimeAppContract.js'

const normalized = normalizeRuntimeModel({
  version: 1,
  state: { page: 'A' },
  events: null,
  actions: [{ id: 'continue', intent: 'continue_scene' }],
  evolutionPoints: ['next_scene']
})

assert.equal(normalized.version, 1)
assert.deepEqual(normalized.state, { page: 'A' })
assert.deepEqual(normalized.events, [])
assert.equal(normalized.actions.length, 1)
assert.equal(normalized.evolutionPoints[0], 'next_scene')

const validModel = validateRuntimeModel(normalized)
assert.equal(validModel.ok, true)

const validResponse = validateRuntimeAppResponse({
  kind: 'creatia_runtime_app',
  html: '<html><body><button>Continue</button></body></html>',
  runtimeModel: normalized,
  analysis: 'Full replacement response.'
})

assert.equal(validResponse.ok, true)
assert.equal(validResponse.response.runtimeModel.state.page, 'A')

const invalidResponse = validateRuntimeAppResponse({
  kind: 'runtime_generation',
  html: 'fragment',
  runtimeModel: {}
})

assert.equal(invalidResponse.ok, false)
assert.ok(invalidResponse.errors.includes('kind must be creatia_runtime_app'))
assert.ok(invalidResponse.errors.includes('html must be a complete HTML document'))

console.log('runtime app contract tests passed')
