export type CreateYourAppMode = 'issue' | 'pr'

export type CreateYourAppConfig = {
  repo: string
  mode: CreateYourAppMode
  endpoint?: string
  defaultTitle: string
}

export type CreateYourAppContext = Record<string, unknown>

export type CreateYourAppSubmitInput = {
  config: CreateYourAppConfig
  requestText: string
  context?: CreateYourAppContext
}

export type CreateYourAppSubmitResult = {
  title: string
  body: string
  number?: number
  url?: string
}

const MAX_TITLE_LENGTH = 72

function firstUsefulLine(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)
}

export function buildCreateYourAppTitle(requestText: string, fallbackTitle: string) {
  const rawTitle = firstUsefulLine(requestText) || fallbackTitle
  const cleanedTitle = rawTitle
    .replace(/^#+\s*/, '')
    .replace(/[\t\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[<>]/g, '')
    .trim()

  if (cleanedTitle.length <= MAX_TITLE_LENGTH) return cleanedTitle
  return `${cleanedTitle.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`
}

function formatRequestTarget(context?: CreateYourAppContext) {
  const target = context?.requestTarget as { type?: string; appId?: string; label?: string } | undefined
  if (!target) return ''

  if (target.type === 'new-app') {
    return '## Cible de la demande\nNouvelle app a integrer au portail.'
  }

  if (target.type === 'existing-app') {
    return `## Cible de la demande\nEvolution de l app existante: ${target.label || target.appId || 'app non precisee'}${target.appId ? ` (id: ${target.appId})` : ''}.`
  }

  return ''
}

function formatContext(context?: CreateYourAppContext) {
  if (!context || Object.keys(context).length === 0) return ''

  return [
    '## Contexte applicatif',
    '```json',
    JSON.stringify(context, null, 2),
    '```'
  ].join('\n')
}

export function buildCreateYourAppBody(requestText: string, context?: CreateYourAppContext) {
  const targetBlock = formatRequestTarget(context)
  const contextBlock = formatContext(context)

  return [
    '## Demande utilisateur',
    requestText.trim(),
    '',
    targetBlock,
    targetBlock ? '' : null,
    contextBlock,
    contextBlock ? '' : null,
    '## Instructions pour l’agent IA/codegen',
    '- Respecter l’architecture existante du dépôt et les conventions déjà en place.',
    '- Ne pas casser l’existant : préserver les parcours, APIs, styles et comportements actuels sauf demande explicite.',
    '- Proposer une implémentation propre, découplée, réutilisable et maintenable.',
    '- Isoler la logique métier des composants UI quand c’est pertinent.',
    '- Mettre à jour la documentation, les notes de release ou les exemples si l’évolution le nécessite.',
    '- Préparer une PR claire, limitée au besoin exprimé, avec résumé et vérifications effectuées.',
    '',
    '## Critères de livraison attendus',
    '- Code lisible, testé par les commandes disponibles du projet.',
    '- Gestion des erreurs et états de chargement si une interaction réseau est ajoutée.',
    '- Expérience mobile soignée et accessible.'
  ].filter((line): line is string => line !== null).join('\n')
}

export function buildGitHubIssueUrl(repo: string, title: string, body: string) {
  const cleanRepo = repo.trim().replace(/^\/+|\/+$/g, '')
  const params = new URLSearchParams({ title, body })
  return `https://github.com/${cleanRepo}/issues/new?${params.toString()}`
}

export async function submitCreateYourAppRequest({
  config,
  requestText,
  context
}: CreateYourAppSubmitInput): Promise<CreateYourAppSubmitResult> {
  const trimmedRequest = requestText.trim()
  if (!trimmedRequest) {
    throw new Error('Décris l’app ou l’évolution que tu veux créer avant d’envoyer.')
  }

  const title = buildCreateYourAppTitle(trimmedRequest, config.defaultTitle)
  const body = buildCreateYourAppBody(trimmedRequest, context)

  if (config.endpoint) {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: config.repo,
        type: config.mode,
        title,
        body,
        context
      })
    })

    if (!response.ok) {
      throw new Error(`La demande GitHub a échoué (${response.status}). Réessaie dans un instant.`)
    }

    const payload = await response.json().catch(() => ({})) as { number?: number; url?: string }
    return { title, body, number: payload.number, url: payload.url }
  }

  const url = buildGitHubIssueUrl(config.repo, title, body)
  window.open(url, '_blank', 'noopener,noreferrer')
  return { title, body, url }
}
