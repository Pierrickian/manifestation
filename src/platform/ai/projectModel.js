export const PROJECTS_STORAGE_KEY = 'manifestation:ai-projects'

export function createProject({ mode, request, response, designSystem }) {
  const now = new Date().toISOString()
  return {
    id: `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mode,
    creationRequest: request,
    currentApplication: response.html || '',
    systemPrompt: response.systemPrompt || '',
    applicationState: response.state || {},
    generationHistory: [{ at: now, request, response }],
    aiSuggestionsHistory: Array.isArray(response.suggestedActions) ? [{ at: now, suggestions: response.suggestedActions }] : [],
    continuationPlan: response.continuationPlan || null,
    preloadQueue: Array.isArray(response.preload) ? response.preload : [],
    capabilities: response.capabilities || {},
    metadata: { createdAt: now, updatedAt: now, designSystem, renderer: 'html' }
  }
}

export function evolveProject(project, request, response) {
  const now = new Date().toISOString()
  return {
    ...project,
    currentApplication: response.html || project.currentApplication,
    systemPrompt: response.systemPrompt || project.systemPrompt,
    applicationState: response.state || project.applicationState || {},
    continuationPlan: response.continuationPlan || project.continuationPlan || null,
    preloadQueue: Array.isArray(response.preload) ? response.preload : project.preloadQueue || [],
    capabilities: response.capabilities || project.capabilities || {},
    generationHistory: [...(project.generationHistory || []), { at: now, request, response }],
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
