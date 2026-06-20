import assert from 'node:assert/strict'
import { buildAiPrompt, buildRuntimeGenerationPrompt, normalizeStructuredAiResponse } from '../src/platform/ai/promptBuilder.js'
import { extractRuntimePayload } from '../src/platform/ai/hooks/useAiApplicationController.js'
import { readFileSync } from 'node:fs'

const createPrompt = buildAiPrompt({ input: 'Un jeu de pendu', mode: 'create' })
assert.equal(createPrompt.kind, 'html_app')
assert.match(createPrompt.prompt, /Un jeu de pendu/)
assert.match(createPrompt.prompt, /suggestedActions must be \[\]/)
assert.match(createPrompt.prompt, /continuationPlan must be null/)
assert.match(createPrompt.prompt, /preload must be \[\]/)
assert.match(createPrompt.prompt, /aiGeneration must be false/)
assert.doesNotMatch(createPrompt.prompt, /window\.requestAiGeneration\(\{ trigger, state, continuationPlan, preload, context \}\)/)
assert.doesNotMatch(createPrompt.prompt, /window\.applyRuntimePayload/)

const coCreatePrompt = buildAiPrompt({ input: 'Application avec bouton AI+', mode: 'co-create' })
assert.match(coCreatePrompt.prompt, /continuationPlan must only describe the runtime AI role/)
assert.match(coCreatePrompt.prompt, /preload must contain only trigger descriptors/)
assert.match(coCreatePrompt.prompt, /Do not generate future content/)
assert.match(coCreatePrompt.prompt, /Runtime AI will be recalled later/)
assert.match(coCreatePrompt.prompt, /window\.requestAiGeneration/)
assert.match(coCreatePrompt.prompt, /window\.applyRuntimePayload/)
assert.match(coCreatePrompt.prompt, /aiGeneration must be true/)

const runtimePrompt = buildRuntimeGenerationPrompt({ request: { trigger: 'ai_plus', state: { choices: [1, 2, 3, 4, 5] }, continuationPlan: { runtimeRole: 'Generate cards when AI+ is pressed.' }, preload: [{ trigger: 'ai_plus', event: 'renew_requested', sendContext: ['originalRequest', 'applicationState', 'userHistory'] }] } })
assert.equal(runtimePrompt.kind, 'runtime_generation')
assert.match(runtimePrompt.prompt, /runtimePayload/)

const explicitPayload = { cards: [{ title: 'New' }], statePatch: { page: 2 } }
assert.deepEqual(extractRuntimePayload({ runtimePayload: explicitPayload, state: { choices: ['ignored'] } }), explicitPayload)
assert.deepEqual(extractRuntimePayload({ state: { choices: ['a'], items: ['b'], statePatch: { ok: true }, other: 'ignored' } }), { choices: ['a'], items: ['b'], statePatch: { ok: true } })
assert.equal(extractRuntimePayload({ state: { other: true } }), null)

const normalized = normalizeStructuredAiResponse({ runtimePayload: explicitPayload, state: {} })
assert.deepEqual(normalized.runtimePayload, explicitPayload)

const bridgeSource = readFileSync(new URL('../src/platform/ai/renderers/HtmlViewer.jsx', import.meta.url), 'utf8')
assert.match(bridgeSource, /window\.requestAiGeneration/)
assert.match(bridgeSource, /pendingRequestId/)
assert.match(bridgeSource, /A runtime generation request is already pending/)
assert.match(bridgeSource, /window\.applyRuntimePayload\(data\.runtimePayload\)/)
assert.match(bridgeSource, /ai-runtime-generation-request/)
assert.match(bridgeSource, /ai-runtime-generation-result/)

console.log('ai bridge contract tests passed')
