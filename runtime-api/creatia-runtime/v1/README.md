# Creatia Runtime API v1

Cette couche documente l’API opérationnelle entre trois acteurs : le **Creatia host**, l’**application générée** exécutée dans l’iframe, et l’**IA runtime**. Elle décrit le contrat observé dans l’implémentation actuelle, sans modifier le comportement runtime.

## Statut du contrat

- Version : `creatia-runtime/v1`.
- Bridge host : `host-postmessage-v1`.
- Stratégie validée : évolution par `runtimePayload` appliqué dans l’application générée.
- Stratégie non par défaut : remplacement complet du HTML, qui reste possible pour une évolution future mais ne fait pas partie du chemin runtime v1 par défaut.

## Couche propriétaire

Le contrat runtime v1 appartient à la couche `system-capabilities/`, pas à `domain-skills/`. Les capacités système concernées sont notamment `CreatiaRuntimeGenerator` pour le contrat de sortie runtime, `CreatiaCoCreate` pour la combinaison API runtime + contrat Co-Create + fragments de prompt, `CreatiaCompatibleApp` pour la compatibilité applicative, `CreatiaDiagnoser` pour le diagnostic et `CreatiaRepairer` pour la réparation.

Un domain skill peut déclarer qu'il a besoin d'une de ces capacités, mais il ne définit jamais l'API runtime Creatia, les fonctions de bridge, les enveloppes postMessage, les shapes `runtime_generation` ou les règles de projection `runtimePayload`.

## Source de vérité

`runtime-api/creatia-runtime/v1/` est la source de vérité officielle du contrat runtime Creatia. Les prompts, skills, healthchecks, tests de contrat, guards iframe, bridge host et implémentations runtime doivent rester alignés avec cette définition. Les autres documents peuvent fournir de la gouvernance ou du contexte historique, mais ils ne doivent pas redéfinir, élargir ou contredire ce contrat v1.

## Acteurs et responsabilités

### Creatia host

Le host Creatia est responsable de :

- injecter le guard runtime dans l’iframe via `HtmlViewer` ;
- exposer le bridge `window.requestAiGeneration` côté application générée ;
- détecter/remplacer les stubs locaux de `requestAiGeneration` créés par erreur par l’application générée ;
- recevoir les messages `ai-runtime-generation` depuis l’iframe ;
- construire et envoyer une demande `runtime_generation` à l’orchestration IA ;
- valider que la réponse contient un `runtimePayload` exploitable ;
- renvoyer `ai-runtime-generation-result` à l’iframe ;
- publier des logs de progression `creatia-runtime-host-log` ;
- conserver les diagnostics, traces, réponses brutes normalisées et erreurs runtime.

### Application générée

L’application générée est responsable de :

- rendre l’expérience utilisateur et gérer son état UI local ;
- appeler `window.requestAiGeneration(request)` lorsqu’une action utilisateur validée requiert une génération IA runtime ;
- écouter `creatia-runtime-ready` ou vérifier le bridge au moment du clic avant de conclure à une indisponibilité ;
- implémenter `window.applyRuntimePayload(runtimePayload)` pour appliquer le résultat dans des champs visibles, sans recharger la page ;
- vider les états `loading`, `busy`, `pending` après succès, échec, blocage ou timeout ;
- journaliser les étapes applicatives utiles avec le `traceId` si disponible.

### IA runtime

L’IA runtime est responsable de :

- produire une réponse de type `runtime_generation` ;
- retourner un `runtimePayload` directement consommable par `window.applyRuntimePayload` ;
- privilégier un `statePatch` pour faire évoluer l’état sémantique ;
- fournir des champs projetables comme `page`, `screen`, `route`, `title`, `text`, `htmlFragment`, `choices` ou `items` selon le besoin ;
- ne pas prétendre que l’application générée contacte directement OpenAI ou possède les secrets du host.

## Fonctions exposées côté application générée

### `window.requestAiGeneration(request)`

Fonction injectée par Creatia dans l’iframe. Elle accepte un `RuntimeRequest` et retourne une `Promise<RuntimeResult>`.

Comportement attendu :

1. crée ou propage un `traceId` ;
2. bloque la demande si aucun provider host n’est enregistré ;
3. bloque les appels concurrents si une demande runtime est déjà en cours ;
4. fusionne `continuationPlan` et `preload` issus de la requête, de l’application et du contexte host ;
5. publie un message `ai-runtime-generation` vers le parent ;
6. résout la promesse après réception de `ai-runtime-generation-result` ;
7. applique un payload d’erreur sur indisponibilité, blocage ou timeout.

Statuts de retour usuels :

- `ok` : résultat IA runtime valide ;
- `error` : erreur de génération ou de validation ;
- `unavailable` : aucun bridge parent/provider disponible ;
- `blocked` : une demande est déjà en cours ;
- `timeout` : aucune réponse host reçue dans le délai runtime.

Les statuts `unavailable`, `blocked` et `timeout` peuvent être produits localement par le guard iframe sans appel IA réussi. Ils utilisent la même enveloppe de compatibilité (`status`, `error`, `payload`, `runtimePayload`, `statePatch`) afin que l’application générée puisse vider ses états de chargement de manière uniforme.

### `window.applyRuntimePayload(runtimePayload)`

Fonction fournie par l’application générée. Creatia l’appelle lorsque `ai-runtime-generation-result` contient un payload consommable.

Règles d’application :

- fusionner d’abord `runtimePayload.statePatch` dans l’état applicatif sémantique ;
- mapper `runtimePayload.items` par `id`, `type` ou `kind` vers les cartes, questions, contrôles, textes ou lignes visibles ;
- appliquer les champs directs comme `page`, `screen`, `route`, `title`, `text`, `summary`, `choices` ou `htmlFragment` ;
- ne jamais afficher le JSON brut comme interface principale ;
- laisser l’utilisateur poursuivre l’expérience après application.

Si l’application générée n’implémente pas cette fonction, le guard host peut utiliser un rendu fallback, mais ce fallback est un filet de sécurité et non le contrat applicatif recommandé.

## Événements

### `creatia-runtime-ready`

Événement `CustomEvent` dispatché sur `window` et `document` après installation du bridge host.

Payload :

```ts
type CreatiaRuntimeReadyEvent = CustomEvent<{
  diagnostics: RuntimeIframeDiagnostics
}>
```

Usage attendu côté app :

- actualiser l’indicateur runtime/IA ;
- réessayer les actions qui attendaient le bridge ;
- éviter de figer l’état en “offline” si le bridge est simplement en cours d’injection.

## Messages host/iframe

### `ai-runtime-generation`

Message envoyé par l’iframe vers le parent lorsque l’application générée appelle `window.requestAiGeneration`.

```ts
type AiRuntimeGenerationMessage = {
  source: 'creatia-generated-html'
  type: 'ai-runtime-generation'
  request: RuntimeRequest
  timestamp: string
  traceId: string
}
```

### `ai-runtime-generation-result`

Message envoyé par le host vers l’iframe après l’appel IA runtime.

```ts
type AiRuntimeGenerationResultMessage = RuntimeResult & {
  source: 'creatia-host'
  type: 'ai-runtime-generation-result'
  requestId: string
  traceId: string
  responseType: 'runtime_generation' | 'generation_error'
  finalStructured?: unknown
  projectPatch?: {
    projectId?: string | null
    currentApplicationUpdated?: boolean
    lastValidApplicationUpdated?: boolean
    continuationPlanUpdated?: boolean
    preloadUpdated?: boolean
    generationHistoryIndex?: number
  }
}
```

Sur succès, le host renvoie les alias `payload` et `runtimePayload` pour compatibilité avec les consommateurs existants.

### Logs runtime host

Message envoyé par le host vers l’iframe pour rendre la progression observable.

```ts
type CreatiaRuntimeHostLogMessage = {
  source: 'creatia-host'
  type: 'creatia-runtime-host-log'
  requestId: string
  traceId: string
  step: string
  message: string
  detail: Record<string, unknown>
  timestamp: string
}
```

Étapes actuellement utilisées : `host_request_received`, `host_trigger_classified`, `host_runtime_prompt_built`, `host_ai_call_started`, `host_ai_raw_response_received`, `host_validation_completed`, `host_payload_missing`, `host_runtime_payload_extracted`, `host_response_returned_to_app`, `host_response_error`, `host_failure`.

### Logs d’activité IA

L’iframe peut publier au parent :

```ts
type AiActivityMessage = {
  source: 'creatia-generated-html'
  type: 'ai-activity'
  status: 'request' | 'response' | 'error' | 'needs_generation' | string
  title?: string
  timestamp: string
}
```

Ces logs alimentent l’overlay et le journal de l’activité IA côté Creatia.

## Shapes

> Note : ces shapes sont des **shapes documentaires déduites du runtime actuel**. Elles formalisent les objets observés dans le bridge, les prompts, les healthchecks et les tests de contrat ; elles ne sont pas encore des types exportés par le code ni une validation exhaustive appliquée à l’exécution.

Les shapes ci-dessous décrivent le contrat v1 en termes opérationnels. Les champs additionnels sont autorisés s’ils restent sérialisables et ne déplacent pas les responsabilités du host vers l’application générée.

### Niveaux de stabilité des champs

- Champs requis par le flux actuel : `source`, `type`, `request`, `requestId`, `traceId`, et les alias `payload` / `runtimePayload` sur une réponse runtime réussie.
- Champs optionnels ou observés : `projectPatch`, `finalStructured`, `healthcheck`, `repairAttempts`, `hasRuntimePayload`, `hasFinalStructured` et les diagnostics de validation.
- Champs projetables du `RuntimePayload` : `page`, `screen`, `route`, `title`, `text`, `summary`, `items`, `htmlFragment`, `choices`, `nextChoices` et `statePatch`. Aucun de ces champs n’est obligatoire individuellement, mais un payload réussi doit contenir au moins un contenu consommable ou un `statePatch` utile.

### `RuntimeRequest`

```ts
type RuntimeRequest = {
  requestId?: string
  traceId?: string
  trigger: string
  state: Record<string, unknown>
  continuationPlan?: Record<string, unknown> | null
  preload?: Array<Record<string, unknown>>
  context?: {
    traceId?: string
    source?: string
    userIntent?: string
    lastUserAction?: string
    lastAnswer?: string
    userHistory?: unknown[]
    [key: string]: unknown
  }
}
```

### `RuntimeResult`

```ts
type RuntimeResult = {
  ok?: boolean
  status: 'ok' | 'error' | 'unavailable' | 'blocked' | 'timeout' | string
  traceId?: string
  requestId?: string
  responseType?: 'runtime_generation' | 'generation_error' | string
  payload?: RuntimePayload | RuntimeError
  runtimePayload?: RuntimePayload | RuntimeError
  statePatch?: Record<string, unknown>
  error?: string
  diagnostics?: RuntimeIframeDiagnostics | RuntimeHostDiagnostics | Record<string, unknown>
}
```

### `RuntimePayload`

```ts
type RuntimePayload = {
  kind?: string
  page?: Record<string, unknown>
  screen?: Record<string, unknown>
  route?: string
  title?: string
  text?: string
  summary?: string
  description?: string
  htmlFragment?: string
  choices?: Array<string | Record<string, unknown>>
  nextChoices?: Array<string | Record<string, unknown>>
  items?: Array<{
    id?: string
    type?: string
    kind?: string
    title?: string
    label?: string
    text?: string
    value?: unknown
    description?: string
    [key: string]: unknown
  }>
  statePatch?: Record<string, unknown>
  preload?: Array<Record<string, unknown>>
  [key: string]: unknown
}
```

### `RuntimeError`

```ts
type RuntimeError = {
  kind: 'runtime_error'
  status: 'error'
  error: string
  statePatch: {
    loading: false
    isLoading: false
    pending: false
    busy: false
    aiStatus: 'error'
    runtimeStatus: 'error' | 'unavailable' | 'blocked' | 'timeout' | 'failed' | string
    error: string
  }
}
```

### `RuntimeIframeDiagnostics`

Diagnostics exposés dans l’iframe, notamment dans `window.creatiaRuntimeDiagnostics` et dans l’événement `creatia-runtime-ready`.

```ts
type RuntimeIframeDiagnostics = {
  status: string
  providerRegistered: boolean
  providerConnected: boolean
  runtimeCapabilities: Record<string, unknown>
  continuationPlanLoaded: boolean
  preloadEntries: number
  pendingRequests: number
  currentTraceId: string
  lastAiError: string
}
```

### `RuntimeHostDiagnostics`

Diagnostics renvoyés par le host dans `ai-runtime-generation-result`. Ils décrivent la validation et l’état du traitement IA côté Creatia pour une requête donnée.

```ts
type RuntimeHostDiagnostics = {
  traceId: string
  validation?: Record<string, unknown>
  healthcheck?: Record<string, unknown> | null
  repairAttempts?: number
  hasRuntimePayload?: boolean
  hasFinalStructured?: boolean
}
```

### `RuntimeDiagnostics`

Alias documentaire utilisé quand le contexte n’a pas besoin de distinguer les diagnostics iframe des diagnostics host.

```ts
type RuntimeDiagnostics = RuntimeIframeDiagnostics | RuntimeHostDiagnostics
```

## Comportements interdits

Côté application générée :

- définir, assigner, wrapper, polyfiller, shadow ou stubber `window.requestAiGeneration` ;
- simuler localement une réponse IA, un `runtimePayload`, un bridge host ou une persistance projet ;
- afficher `JSON.stringify(runtimePayload)` ou `JSON.stringify(statePatch)` comme rendu utilisateur principal ;
- marquer une expérience Co-Create runtime comme “offline-ready” si elle dépend d’une génération IA runtime ;
- attendre un bouton IA séparé lorsque l’action utilisateur principale est le déclencheur sémantique attendu ;
- laisser l’interface bloquée en chargement après `unavailable`, `blocked`, `timeout` ou `error` ;
- prétendre contacter OpenAI directement ou gérer les secrets API ;
- déplacer la persistance, l’orchestration IA, les diagnostics host ou l’historique projet dans l’app générée.

Côté host :

- supprimer le chemin validé `runtimePayload` sans remplacement démontré ;
- avaler silencieusement une réponse IA invalide ;
- retourner un succès runtime sans payload consommable ;
- modifier le contrat de message sans mise à jour de cette couche documentaire, des prompts et des tests de contrat.

Côté IA runtime :

- retourner uniquement une analyse textuelle non projetable ;
- retourner du HTML complet comme chemin par défaut d’une demande runtime v1 ;
- omettre le `runtimePayload` sur une réponse `runtime_generation` ;
- exposer des détails internes de prompt ou des schémas bruts à l’utilisateur final.

## Compatibilité et versionnement

- `creatia-runtime/v1` est compatible avec le bridge `host-postmessage-v1`.
- Le host doit conserver les alias `payload` et `runtimePayload` sur succès runtime pour les applications générées existantes.
- Les nouveaux champs doivent être ajoutés de manière additive.
- Les changements cassants exigent une nouvelle couche versionnée, par exemple `runtime-api/creatia-runtime/v2/`.
- Le remplacement complet HTML peut être documenté dans une version future, mais ne doit pas remplacer implicitement le contrat v1 `runtimePayload`.
- Les prompts, healthchecks et tests de contrat doivent être mis à jour avec toute évolution du contrat runtime.

## Sources d’implémentation actuelles

- `src/platform/ai/renderers/HtmlViewer.jsx` : injection du bridge, diagnostics iframe, message `ai-runtime-generation`, réception `ai-runtime-generation-result`, fallback et événement `creatia-runtime-ready`.
- `src/features/html-app-generator/HtmlAppGenerator.jsx` : réception host, dispatch IA runtime, validation du résultat, logs host et réponse à l’iframe.
- `src/platform/ai/promptBuilder.js` : instructions données aux applications générées et à l’IA runtime.
- `src/platform/ai/generationPipeline.js` : healthchecks vérifiant la présence du bridge, l’absence de stub et la projection du `runtimePayload`.
- `tests/creatia-bridge.test.mjs` : tests de contrat textuel du bridge Creatia.
