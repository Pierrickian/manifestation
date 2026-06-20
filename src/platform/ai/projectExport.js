import { createProject, normalizePreloadQueue, normalizeTechnicalModel, storeProject } from './projectModel'
import { withCreatiaUiGuards } from './renderers/HtmlViewer'

const PROJECT_EXPORT_VERSION = 1

function extractBalancedLiteral(source = '', startIndex = 0) {
  const text = String(source || '')
  const opening = text[startIndex]
  const closing = opening === '{' ? '}' : opening === '[' ? ']' : ''
  if (!closing) return ''

  let depth = 0
  let quote = ''
  let escaped = false

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index]
    if (quote) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = ''
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === opening) depth += 1
    if (char === closing) depth -= 1
    if (depth === 0) return text.slice(startIndex, index + 1)
  }

  return ''
}

function parseLooseJsonLiteral(literal = '') {
  if (!literal) return null

  try {
    return JSON.parse(literal)
  } catch {
    // Continue with a conservative JSON-ish parser for inline generated JS metadata.
  }

  try {
    const normalized = literal
      .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
      .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, value) => JSON.stringify(value.replace(/\\'/g, "'")))
      .replace(/,\s*([}\]])/g, '$1')
    return JSON.parse(normalized)
  } catch {
    return null
  }
}

function extractDeclaredLiteral(html = '', name = '') {
  const declaration = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*`, 'i').exec(String(html || ''))
  if (!declaration) return null

  return parseLooseJsonLiteral(extractBalancedLiteral(html, declaration.index + declaration[0].length))
}

function deriveRuntimeMetadataFromHtml(html = '') {
  const continuationPlan = extractDeclaredLiteral(html, 'continuationPlan')
  const preload = extractDeclaredLiteral(html, 'preload')

  return {
    continuationPlan: continuationPlan && typeof continuationPlan === 'object' && !Array.isArray(continuationPlan) ? continuationPlan : null,
    preload: Array.isArray(preload) ? preload : []
  }
}

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
  const html = withCreatiaUiGuards(project?.currentApplication || project?.lastValidApplication || '', {
    mode: project?.mode || 'create',
    capabilities: project?.capabilities || {},
    runtimeCapabilities: project?.capabilities?.runtimeCapabilities || {},
    continuationPlan: project?.continuationPlan || null,
    preload: normalizePreloadQueue(project?.preloadQueue || [])
  })
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
    currentApplication: project?.currentApplication || project?.lastValidApplication || latestResponse.html || '',
    lastValidApplication: project?.lastValidApplication || project?.currentApplication || latestResponse.html || '',
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
    kind: 'html_app',
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
    lastValidApplication: html,
    lastValidApplication: html,
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
  const currentApplication = payload?.currentApplication ?? sourceProject?.currentApplication ?? sourceProject?.lastValidApplication ?? latestResponse.html ?? ''
  const derivedRuntimeMetadata = deriveRuntimeMetadataFromHtml(currentApplication)
  const project = {
    ...(sourceProject || {}),
    id: sourceProject?.id || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mode: sourceProject?.mode || 'create',
    creationRequest: payload?.request ?? sourceProject?.creationRequest ?? '',
    currentApplication,
    lastValidApplication: payload?.lastValidApplication ?? sourceProject?.lastValidApplication ?? currentApplication ?? latestResponse.html ?? '',
    systemPrompt: payload?.systemPrompt ?? sourceProject?.systemPrompt ?? latestResponse.systemPrompt ?? '',
    applicationState: payload?.state ?? sourceProject?.applicationState ?? latestResponse.state ?? {},
    humanModel: payload?.humanModel ?? sourceProject?.humanModel ?? latestResponse.humanModel ?? {},
    technicalModel: normalizeTechnicalModel(payload?.technicalModel ?? sourceProject?.technicalModel ?? latestResponse),
    evolutionHistory: Array.isArray(payload?.evolutionHistory) ? payload.evolutionHistory : sourceProject?.evolutionHistory || [],
    generationHistory: history,
    aiSuggestionsHistory: Array.isArray(payload?.aiSuggestions) ? payload.aiSuggestions : sourceProject?.aiSuggestionsHistory || [],
    continuationPlan: payload?.continuationPlan ?? sourceProject?.continuationPlan ?? latestResponse.continuationPlan ?? derivedRuntimeMetadata.continuationPlan,
    preloadQueue: normalizePreloadQueue(Array.isArray(payload?.preloadMetadata) && payload.preloadMetadata.length ? payload.preloadMetadata : sourceProject?.preloadQueue || latestResponse.preload || derivedRuntimeMetadata.preload || []),
    capabilities: sourceProject?.capabilities || latestResponse.capabilities || {},
    metadata: { renderer: 'html', ...(sourceProject?.metadata || {}) }
  }

  if (!project.currentApplication || !Array.isArray(project.generationHistory)) {
    throw new Error('Fichier projet Creatia invalide ou incomplet.')
  }

  return storeProject(project)
}
