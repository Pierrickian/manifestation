import { storeProject } from './projectModel'
import { withCreatiaUiGuards } from './renderers/HtmlViewer'

const PROJECT_EXPORT_VERSION = 1

function safeSlug(value = 'creatia') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'creatia'
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  return url
}

export function buildHtmlExport(project) {
  const html = withCreatiaUiGuards(project?.currentApplication || '')
  const filename = `${safeSlug(project?.creationRequest || project?.id || 'creatia-app')}.html`
  return { html, filename, blob: new Blob([html], { type: 'text/html;charset=utf-8' }) }
}

export function exportHtmlProject(project) {
  const exportData = buildHtmlExport(project)
  const url = downloadBlob(exportData.blob, exportData.filename)
  return { ...exportData, url }
}

export function buildProjectExport(project) {
  const now = new Date().toISOString()
  const latestResponse = project?.generationHistory?.at(-1)?.response || {}
  const payload = {
    format: 'manifestation.project',
    app: 'Creatia',
    rootApp: 'Evolutia',
    version: PROJECT_EXPORT_VERSION,
    exportedAt: now,
    request: project?.creationRequest || '',
    systemPrompt: project?.systemPrompt || latestResponse.systemPrompt || '',
    state: project?.applicationState || latestResponse.state || {},
    humanModel: project?.humanModel || latestResponse.humanModel || {},
    technicalModel: project?.technicalModel || { files: latestResponse.files || { 'index.html': project?.currentApplication || latestResponse.html || '', 'styles.css': '', 'app.js': '' } },
    evolutionHistory: project?.evolutionHistory || [],
    history: project?.generationHistory || [],
    currentApplication: project?.currentApplication || latestResponse.html || '',
    aiSuggestions: project?.aiSuggestionsHistory || [],
    continuationPlan: project?.continuationPlan || latestResponse.continuationPlan || null,
    preloadMetadata: project?.preloadQueue || latestResponse.preload || [],
    project
  }
  const json = JSON.stringify(payload, null, 2)
  const filename = `${safeSlug(project?.creationRequest || project?.id || 'creatia-project')}.manifestation.json`
  return { payload, json, filename, blob: new Blob([json], { type: 'application/json;charset=utf-8' }) }
}

export function exportProjectJson(project) {
  const exportData = buildProjectExport(project)
  const url = downloadBlob(exportData.blob, exportData.filename)
  return { ...exportData, url }
}

export async function shareExport({ blob, filename, title = 'Export Creatia', text = 'Projet Creatia exporté.' }) {
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, text, files: [file] })
    return true
  }
  if (navigator.share) {
    await navigator.share({ title, text })
    return true
  }
  return false
}

export function normalizeImportedProject(payload) {
  const sourceProject = payload?.project || payload
  const history = Array.isArray(payload?.history) ? payload.history : sourceProject?.generationHistory || []
  const latestResponse = history.at(-1)?.response || {}
  const project = {
    ...(sourceProject || {}),
    id: sourceProject?.id || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mode: sourceProject?.mode || 'create',
    creationRequest: payload?.request ?? sourceProject?.creationRequest ?? '',
    currentApplication: payload?.currentApplication ?? sourceProject?.currentApplication ?? latestResponse.html ?? '',
    systemPrompt: payload?.systemPrompt ?? sourceProject?.systemPrompt ?? latestResponse.systemPrompt ?? '',
    applicationState: payload?.state ?? sourceProject?.applicationState ?? latestResponse.state ?? {},
    humanModel: payload?.humanModel ?? sourceProject?.humanModel ?? latestResponse.humanModel ?? {},
    technicalModel: payload?.technicalModel ?? sourceProject?.technicalModel ?? { files: latestResponse.files || { 'index.html': payload?.currentApplication ?? sourceProject?.currentApplication ?? latestResponse.html ?? '', 'styles.css': '', 'app.js': '' } },
    evolutionHistory: Array.isArray(payload?.evolutionHistory) ? payload.evolutionHistory : sourceProject?.evolutionHistory || [],
    generationHistory: history,
    aiSuggestionsHistory: Array.isArray(payload?.aiSuggestions) ? payload.aiSuggestions : sourceProject?.aiSuggestionsHistory || [],
    continuationPlan: payload?.continuationPlan ?? sourceProject?.continuationPlan ?? latestResponse.continuationPlan ?? null,
    preloadQueue: Array.isArray(payload?.preloadMetadata) ? payload.preloadMetadata : sourceProject?.preloadQueue || latestResponse.preload || [],
    capabilities: sourceProject?.capabilities || latestResponse.capabilities || {},
    metadata: { renderer: 'html', ...(sourceProject?.metadata || {}) }
  }

  if (!project.currentApplication || !Array.isArray(project.generationHistory)) {
    throw new Error('Fichier projet Creatia invalide ou incomplet.')
  }

  return storeProject(project)
}
