export const PROJECTS_STORAGE_KEY = 'manifestation:ai-projects'

function normalizeHumanModel(value = {}) {
  return {
    purpose: value.purpose || '',
    audience: value.audience || '',
    tone: value.tone || '',
    emotion: value.emotion || '',
    journey: value.journey || '',
    sections: Array.isArray(value.sections) ? value.sections : []
  }
}

export function normalizeTechnicalModel(response = {}) {
  const files = response.files && typeof response.files === 'object' ? response.files : {}
  return {
    htmlSource: 'currentApplication',
    files: {
      'styles.css': files['styles.css'] || '',
      'app.js': files['app.js'] || ''
    }
  }
}


function createDefaultContinuationPlan(request = '') {
  return {
    runtimeRole: 'Generate the next live application step from the current user action and visible state.',
    summary: request ? `Continue this Co-Create app from the original request: ${String(request).slice(0, 180)}` : 'Continue this Co-Create app from runtime callbacks.',
    callbacks: ['continue_pressed', 'answer_submitted', 'choice_selected', 'question_answered', 'needs_next_step']
  }
}

function createDefaultPreload(request = '') {
  return [{
    trigger: 'runtime_generation_requested',
    event: 'primary_action_validated',
    sendContext: ['originalRequest', 'applicationState', 'trigger', 'userHistory', 'lastUserAction'],
    preparedPrompt: request ? `Prepare to generate the next runtimePayload for: ${String(request).slice(0, 180)}` : 'Prepare to generate the next runtimePayload from callback context.',
    confidence: null
  }]
}

function ensureOperationalRuntimeMetadata({ mode, request = '', continuationPlan = null, preload = [] }) {
  const isCoCreate = mode === 'co-create'
  return {
    continuationPlan: continuationPlan || (isCoCreate ? createDefaultContinuationPlan(request) : null),
    preloadQueue: normalizePreloadQueue(Array.isArray(preload) && preload.length ? preload : (isCoCreate ? createDefaultPreload(request) : []))
  }
}

function createEvolutionEntry({ at, request, response = {} }) {
  return {
    at,
    userRequest: request,
    analysis: response.analysis || '',
    decisions: Array.isArray(response.decisions) ? response.decisions : [],
    generatedChanges: Array.isArray(response.generatedChanges) ? response.generatedChanges : []
  }
}

export function normalizePreloadQueue(preload = []) {
  if (!Array.isArray(preload)) return []

  return preload
    .map((item) => {
      if (typeof item === 'string') {
        return {
          trigger: 'manual_or_contextual_followup',
          preparedPrompt: item,
          confidence: null,
          legacyVisibleSuggestion: true,
          migratedFrom: 'legacy_preload_string'
        }
      }

      if (!item || typeof item !== 'object') return null

      const preparedPrompt = item.preparedPrompt || item.prompt || item.task || item.reason || item.description || ''
      return {
        ...item,
        trigger: item.trigger || item.event || item.when || 'contextual_followup',
        preparedPrompt,
        confidence: typeof item.confidence === 'number' ? item.confidence : item.confidence ?? null,
        legacyVisibleSuggestion: Boolean(item.legacyVisibleSuggestion || item.task || item.reason),
        migratedFrom: item.migratedFrom || ((item.task || item.reason) && !item.preparedPrompt ? 'legacy_preload_action' : undefined)
      }
    })
    .filter(Boolean)
}

export function createProject({ mode, request, response, designSystem }) {
  const now = new Date().toISOString()
  const humanModel = normalizeHumanModel(response.humanModel || response.human || response.state?.humanModel)
  const technicalModel = normalizeTechnicalModel(response)
  const runtimeMetadata = ensureOperationalRuntimeMetadata({ mode, request, continuationPlan: response.continuationPlan || null, preload: response.preload })
  return {
    id: `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mode,
    creationRequest: request,
    humanModel,
    technicalModel,
    currentApplication: response.html || '',
    lastValidApplication: response.html || '',
    systemPrompt: response.systemPrompt || '',
    applicationState: response.state || {},
    generationHistory: [{ at: now, request, response }],
    evolutionHistory: [createEvolutionEntry({ at: now, request, response })],
    aiSuggestionsHistory: Array.isArray(response.suggestedActions) ? [{ at: now, suggestions: response.suggestedActions }] : [],
    continuationPlan: runtimeMetadata.continuationPlan,
    preloadQueue: runtimeMetadata.preloadQueue,
    capabilities: response.capabilities || {},
    metadata: { createdAt: now, updatedAt: now, designSystem, renderer: 'html' }
  }
}

export function evolveProject(project, request, response) {
  const now = new Date().toISOString()
  const currentHtml = response.html || project.currentApplication
  const runtimeMetadata = ensureOperationalRuntimeMetadata({ mode: project.mode, request: project.creationRequest || request, continuationPlan: response.continuationPlan || project.continuationPlan || null, preload: Array.isArray(response.preload) && response.preload.length ? response.preload : project.preloadQueue || [] })
  const lastValidApplication = response.html || project.lastValidApplication || project.currentApplication || ''
  return {
    ...project,
    humanModel: normalizeHumanModel(response.humanModel || response.human || project.humanModel || response.state?.humanModel),
    technicalModel: normalizeTechnicalModel(response),
    currentApplication: currentHtml,
    lastValidApplication,
    systemPrompt: response.systemPrompt || project.systemPrompt,
    applicationState: response.state || project.applicationState || {},
    continuationPlan: runtimeMetadata.continuationPlan,
    preloadQueue: runtimeMetadata.preloadQueue,
    capabilities: response.capabilities || project.capabilities || {},
    generationHistory: [...(project.generationHistory || []), { at: now, request, response }],
    evolutionHistory: [...(project.evolutionHistory || []), createEvolutionEntry({ at: now, request, response })],
    aiSuggestionsHistory: Array.isArray(response.suggestedActions)
      ? [...(project.aiSuggestionsHistory || []), { at: now, suggestions: response.suggestedActions }]
      : project.aiSuggestionsHistory || [],
    metadata: { ...(project.metadata || {}), updatedAt: now, renderer: 'html' }
  }
}


export function refreshProjectHumanModel(project, response) {
  const now = new Date().toISOString()
  const entry = createEvolutionEntry({
    at: now,
    request: 'Rebuild Human Model',
    response
  })

  return {
    ...project,
    humanModel: normalizeHumanModel(response.humanModel || response.human || response.state?.humanModel),
    applicationState: response.state || project.applicationState || {},
    evolutionHistory: [...(project.evolutionHistory || []), entry],
    metadata: {
      ...(project.metadata || {}),
      updatedAt: now,
      requiresHumanModelRefresh: false
    }
  }
}

export function readStoredProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]') } catch { return [] }
}

export function storeProject(project) {
  const projects = readStoredProjects().filter((item) => item.id !== project.id)
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([project, ...projects].slice(0, 30)))
  return project
}
