# Contrat Creatia Compatible HTML

## Exigences

- L'application générée s'exécute dans l'iframe Creatia sans prendre les responsabilités du host.
- Elle appelle le bridge host `window.requestAiGeneration(request)` quand une génération runtime est nécessaire.
- Elle ne définit, n'assigne, ne polyfill et ne stub jamais `window.requestAiGeneration` localement.
- Elle implémente un consommateur de payload, idéalement `window.applyRuntimePayload(runtimePayload)`.
- Elle projette `statePatch`, `items`, `choices`, `title`, `text`, `summary`, `htmlFragment` ou champs équivalents dans l'UI visible.
- Elle ne rend pas le `runtimePayload`, le `payload`, le `result` ou le `statePatch` comme JSON brut dans l'interface principale.
- Elle sort proprement des états `loading`, `busy` ou `pending` en cas de succès, erreur, indisponibilité, blocage ou timeout.

## Validations PASS/FAIL

| Validation | PASS | FAIL |
| --- | --- | --- |
| Bridge host utilisé | L'app appelle le bridge injecté. | L'app crée son propre stub local. |
| Consommateur runtime | `applyRuntimePayload` ou `onAiResponse` applique les champs. | Aucun consommateur standard n'existe. |
| Projection UI | Le payload modifie l'état sémantique et des éléments visibles. | Le JSON brut est affiché tel quel. |
| Responsabilités | Secrets, persistence et orchestration restent côté Creatia. | L'app prétend appeler OpenAI directement ou persister côté host. |

## Exemples de fail

- `window.requestAiGeneration = async () => ({ status: 'ok' })` dans l'HTML généré.
- `document.body.innerHTML = JSON.stringify(runtimePayload)`.
- Un bouton IA qui reste indéfiniment en `loading` après `status: 'timeout'`.
- Une application qui demande à l'utilisateur de saisir une clé API pour continuer.

## Source API/protocole/design

- Source normative : `runtime-api/creatia-runtime/v1/` pour `requestAiGeneration`, `applyRuntimePayload`, statuts et messages host/iframe.
- Design : Creatia possède l'orchestration IA, la persistence et le runtime ; l'application générée possède le rendu, l'interaction locale et l'émission d'intention.

## Correspondance avec `generationPipeline.js`

Automatisé partiellement en mode Co-Create : `cocreate_does_not_stub_request_ai_generation`, `cocreate_runtime_payload_consumer_exists`, `cocreate_runtime_payload_projects_fields`, `cocreate_runtime_payload_not_rendered_raw`, `cocreate_not_offline_by_default`.
