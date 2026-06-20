import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const promptBuilder = readFileSync(new URL('../src/platform/ai/promptBuilder.js', import.meta.url), 'utf8')
const controller = readFileSync(new URL('../src/platform/ai/hooks/useAiApplicationController.js', import.meta.url), 'utf8')
const generator = readFileSync(new URL('../src/features/html-app-generator/HtmlAppGenerator.jsx', import.meta.url), 'utf8')
const viewer = readFileSync(new URL('../src/platform/ai/renderers/HtmlViewer.jsx', import.meta.url), 'utf8')

const block = (name) => promptBuilder.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\]`))?.[1] || ''
const createInstructions = block('CREATE_APP_INSTRUCTIONS')
const coCreateInstructions = block('CO_CREATE_APP_INSTRUCTIONS')
const runtimeInstructions = block('RUNTIME_GENERATION_INSTRUCTIONS')

assert.match(createInstructions, /Create mode is simple/)
assert.doesNotMatch(createInstructions, /window\.requestAiGeneration|window\.applyRuntimePayload|runtimePayload instructions|future prompts|precomputed/i)
assert.match(promptBuilder, /Un jeu de pendu/)

assert.match(coCreateInstructions, /continuationPlan must exist/)
assert.match(coCreateInstructions, /preload must contain at least one trigger descriptor/)
assert.match(coCreateInstructions, /window\.requestAiGeneration/)
assert.match(coCreateInstructions, /window\.applyRuntimePayload/)
assert.match(coCreateInstructions, /Do not generate future prompts/)
assert.match(coCreateInstructions, /Do not generate future prompts, future content/)

assert.match(runtimeInstructions, /Return \{ "kind": "runtime_generation", "runtimePayload": object/)
assert.match(promptBuilder, /explicitKind === 'runtime_generation'/)
assert.match(promptBuilder, /runtimePayload: payload\.runtimePayload/)

assert.match(controller, /return \{\s*finalStructured,/)
assert.match(controller, /submitRuntimeGeneration/)
assert.match(controller, /runtimeGenerationPendingRef\.current/)
assert.match(controller, /A runtime generation request is already pending/)

assert.match(generator, /runtimeResult\?\.runtimePayload \|\| deriveRuntimePayload/)
assert.match(generator, /ok: false, responseType: 'generation_error'/)
assert.match(generator, /Runtime generation did not return a usable runtimePayload/)

assert.match(viewer, /Blocked because: Request already in progress/)
assert.match(viewer, /return \{ status: 'blocked'/)
assert.match(viewer, /window\.applyRuntimePayload\(effectiveRuntimePayload\)/)

console.log('Creatia bridge contract tests passed')
