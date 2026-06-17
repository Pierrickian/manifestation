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

function createEvolutionEntry({ at, request, response = {} }) {
  return {
    at,
    userRequest: request,
    analysis: response.analysis || '',
    decisions: Array.isArray(response.decisions) ? response.decisions : [],
    generatedChanges: Array.isArray(response.generatedChanges) ? response.generatedChanges : []
  }
}

export function createProject({ mode, request, response, designSystem }) {
  const now = new Date().toISOString()
  const humanModel = normalizeHumanModel(response.humanModel || response.human || response.state?.humanModel)
  const technicalModel = normalizeTechnicalModel(response)
  return {
    id: `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mode,
    creationRequest: request,
    humanModel,
    technicalModel,
    currentApplication: response.html || '',
    systemPrompt: response.systemPrompt || '',
    applicationState: response.state || {},
    generationHistory: [{ at: now, request, response }],
    evolutionHistory: [createEvolutionEntry({ at: now, request, response })],
    aiSuggestionsHistory: Array.isArray(response.suggestedActions) ? [{ at: now, suggestions: response.suggestedActions }] : [],
    continuationPlan: response.continuationPlan || null,
    preloadQueue: Array.isArray(response.preload) ? response.preload : [],
    capabilities: response.capabilities || {},
    metadata: { createdAt: now, updatedAt: now, designSystem, renderer: 'html' }
  }
}

export function evolveProject(project, request, response) {
  const now = new Date().toISOString()
  const currentHtml = response.html || project.currentApplication
  return {
    ...project,
    humanModel: normalizeHumanModel(response.humanModel || response.human || project.humanModel || response.state?.humanModel),
    technicalModel: normalizeTechnicalModel(response),
    currentApplication: currentHtml,
    systemPrompt: response.systemPrompt || project.systemPrompt,
    applicationState: response.state || project.applicationState || {},
    continuationPlan: response.continuationPlan || project.continuationPlan || null,
    preloadQueue: Array.isArray(response.preload) ? response.preload : project.preloadQueue || [],
    capabilities: response.capabilities || project.capabilities || {},
    generationHistory: [...(project.generationHistory || []), { at: now, request, response }],
    evolutionHistory: [...(project.evolutionHistory || []), createEvolutionEntry({ at: now, request, response })],
    aiSuggestionsHistory: Array.isArray(response.suggestedActions)
      ? [...(project.aiSuggestionsHistory || []), { at: now, suggestions: response.suggestedActions }]
      : project.aiSuggestionsHistory || [],
    metadata: { ...(project.metadata || {}), updatedAt: now, renderer: 'html' }
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
