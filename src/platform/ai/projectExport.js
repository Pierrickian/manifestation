import { createProject, normalizePreloadQueue, normalizeTechnicalModel, storeProject } from './projectModel'
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
    id: project?.id || '',
    mode: project?.mode || 'create',
    metadata: project?.metadata || {},
    request: project?.creationRequest || '',
    systemPrompt: project?.systemPrompt || latestResponse.systemPrompt || '',
    state: project?.applicationState || latestResponse.state || {},
    humanModel: project?.humanModel || latestResponse.humanModel || {},
    technicalModel: normalizeTechnicalModel(project?.technicalModel || latestResponse),
    evolutionHistory: project?.evolutionHistory || [],
    history: project?.generationHistory || [],
    currentApplication: project?.currentApplication || latestResponse.html || '',
    aiSuggestions: project?.aiSuggestionsHistory || [],
    continuationPlan: project?.continuationPlan || latestResponse.continuationPlan || null,
    preloadMetadata: normalizePreloadQueue(project?.preloadQueue || latestResponse.preload || [])
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


export function createProjectFromImportedHtml(importedHtml, { mode = 'create', designSystem } = {}) {
  const html = String(importedHtml || '')
  if (!html.trim()) {
    throw new Error('Le fichier importé est vide.')
  }

  const response = {
    html,
    humanModel: {},
    files: {},
    analysis: 'Application importée directement.',
    decisions: ['Application active créée depuis un import direct'],
    generatedChanges: ['Application active renseignée'],
    systemPrompt: '',
    state: {},
    suggestedActions: [],
    capabilities: {}
  }
  const project = createProject({
    mode,
    request: 'Application importée',
    response,
    designSystem
  })

  return storeProject({
    ...project,
    metadata: {
      ...(project.metadata || {}),
      lastExternalImport: { at: new Date().toISOString(), source: 'html' },
      requiresHumanModelRefresh: true
    }
  })
}

export function importHtmlIntoProject(project, importedHtml) {
  if (!project?.id || !Array.isArray(project.generationHistory)) {
    throw new Error('Aucun projet Creatia actif à mettre à jour.')
  }

  const html = String(importedHtml || '')
  if (!html.trim()) {
    throw new Error('Le fichier importé est vide.')
  }

  const now = new Date().toISOString()
  return storeProject({
    ...project,
    currentApplication: html,
    generationHistory: [
      ...(project.generationHistory || []),
      {
        at: now,
        request: 'HTML imported',
        response: {
          source: 'html-import'
        }
      }
    ],
    evolutionHistory: [
      ...(project.evolutionHistory || []),
      {
        at: now,
        userRequest: 'HTML imported',
        analysis: 'External HTML replaced the active application.',
        decisions: [
          'Current application replaced',
          'Human model may no longer match'
        ],
        generatedChanges: [
          'currentApplication updated'
        ]
      }
    ],
    metadata: {
      ...(project.metadata || {}),
      updatedAt: now,
      lastExternalImport: {
        at: now,
        source: 'html'
      },
      requiresHumanModelRefresh: true
    }
  })
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
    technicalModel: normalizeTechnicalModel(payload?.technicalModel ?? sourceProject?.technicalModel ?? latestResponse),
    evolutionHistory: Array.isArray(payload?.evolutionHistory) ? payload.evolutionHistory : sourceProject?.evolutionHistory || [],
    generationHistory: history,
    aiSuggestionsHistory: Array.isArray(payload?.aiSuggestions) ? payload.aiSuggestions : sourceProject?.aiSuggestionsHistory || [],
    continuationPlan: payload?.continuationPlan ?? sourceProject?.continuationPlan ?? latestResponse.continuationPlan ?? null,
    preloadQueue: normalizePreloadQueue(Array.isArray(payload?.preloadMetadata) ? payload.preloadMetadata : sourceProject?.preloadQueue || latestResponse.preload || []),
    capabilities: sourceProject?.capabilities || latestResponse.capabilities || {},
    metadata: { renderer: 'html', ...(sourceProject?.metadata || {}) }
  }

  if (!project.currentApplication || !Array.isArray(project.generationHistory)) {
    throw new Error('Fichier projet Creatia invalide ou incomplet.')
  }

  return storeProject(project)
}
