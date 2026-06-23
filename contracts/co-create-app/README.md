# Contrat Co-Create App

## Exigences

- L'application Co-Create déclenche l'IA sur l'action utilisateur principale validée, sans attendre un bouton IA séparé.
- La réponse de génération initiale fournit un `continuationPlan` non vide et des entrées `preload` utiles quand le mode Co-Create le requiert.
- `runtimeCapabilities.aiGeneration` est vrai.
- L'UI expose un statut runtime compréhensible : connexion, génération, indisponibilité, reconnexion ou fallback local.
- L'application consomme `continuationPlan` et `preload` pendant l'exécution.
- Les appels runtime contiennent un trigger, un état sérialisable et du contexte utile.

## Validations PASS/FAIL

| Validation | PASS | FAIL |
| --- | --- | --- |
| Plan de continuation | `continuationPlan` est un objet non vide. | Plan absent, nul ou vide. |
| Preload | `preload` contient des entrées. | Tableau absent ou vide. |
| Capacité IA runtime | `runtimeCapabilities.aiGeneration === true`. | Capacité absente ou fausse. |
| Chemin génération | `requestAiGeneration` ou trigger équivalent existe. | Aucun chemin runtime détectable. |
| Statut runtime | L'utilisateur voit l'état IA réel. | L'app affiche `Offline` par défaut. |

## Exemples de fail

- Une aventure adaptative où le choix principal ne déclenche jamais `requestAiGeneration`.
- `runtimeCapabilities: { aiGeneration: false }` en mode Co-Create.
- Un `continuationPlan` vide accompagné d'une UI qui promet une progression adaptative.
- Un statut initial `Offline` affiché même après injection du bridge.

## Source API/protocole/design

- Protocole : `protocols/co-create/v1.md` décrit le flux callback-driven.
- API : `runtime-api/creatia-runtime/v1/` définit les requêtes, résultats, statuts et obligations générées.
- Prompting : les applications adaptatives doivent traiter l'action principale comme déclencheur IA.

## Correspondance avec `generationPipeline.js`

Automatisé partiellement en mode `co-create` : `cocreate_continuation_plan_exists`, `cocreate_preload_entries_exist`, `cocreate_runtime_ai_generation_enabled`, `cocreate_runtime_ai_status_exposed`, `cocreate_ai_generation_pathway_exists`, `cocreate_consumes_continuation_plan`, `cocreate_consumes_preload`, plus les checks de compatibilité runtime payload.
