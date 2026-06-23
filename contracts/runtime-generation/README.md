# Contrat Runtime Generation

## Exigences

- Creatia envoie une demande `runtime_generation` à l'IA à partir d'une intention applicative sérialisable.
- La réponse IA contient un `runtimePayload` directement consommable ou une erreur normalisée.
- Un succès ne doit pas être retourné sans contenu projetable ou `statePatch` utile.
- Le payload privilégie des champs projetables : `statePatch`, `page`, `screen`, `route`, `title`, `text`, `summary`, `items`, `choices`, `nextChoices`, `htmlFragment`.
- Le remplacement complet du HTML reste non par défaut en v1.
- Le host conserve diagnostics, réponse brute normalisée et logs de progression.

## Validations PASS/FAIL

| Validation | PASS | FAIL |
| --- | --- | --- |
| Type runtime | La réponse est traitée comme `runtime_generation`. | Réponse conversationnelle non structurée. |
| Payload exploitable | `runtimePayload` contient un contenu ou patch utile. | Payload absent, vide ou purement analytique. |
| Alias compatibles | Le host renvoie `payload` et `runtimePayload` en succès. | Un seul alias casse un consommateur existant. |
| Erreurs normalisées | Erreur avec statut explicite. | Échec silencieux ou succès trompeur. |

## Exemples de fail

- L'IA répond : `Voici ce que je ferais...` sans objet runtime.
- `status: 'ok'` avec `runtimePayload: {}`.
- Un payload contenant uniquement des consignes au développeur, sans champ affichable.
- Une réponse qui remplace toute l'application alors que le flux `runtimePayload` suffisait.

## Source API/protocole/design

- Source normative : `runtime-api/creatia-runtime/v1/` pour `RuntimeRequest`, `RuntimeResult` et `RuntimePayload`.
- Protocole : `protocols/runtime-generation/v1.md`.
- Design : chemin validé par `runtimePayload`, remplacement HTML complet non par défaut.

## Correspondance avec `generationPipeline.js`

Non automatisé exhaustivement dans `runGeneratedAppHealthcheck`, qui vérifie surtout l'application générée initiale. Les checks Co-Create `cocreate_runtime_payload_consumer_exists`, `cocreate_runtime_payload_projects_fields` et `cocreate_runtime_payload_not_rendered_raw` valident seulement que l'application saura consommer le résultat runtime.
