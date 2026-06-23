# Contrat Repair

## Exigences

- Toute réparation part d'un diagnostic explicite.
- La correction cible la plus petite couche responsable : application générée, prompt, host runtime, validation, documentation ou test.
- Elle préserve le chemin validé : bridge host, `runtime_generation`, `runtimePayload`, application visible du payload.
- Elle ne crée pas de stub local, ne déplace pas secrets/persistence/orchestration vers l'application générée et ne supprime pas le chemin validé au profit d'une théorie non démontrée.
- Si une règle durable est clarifiée, la documentation, les prompts, tests ou contrats concernés sont mis à jour.

## Validations PASS/FAIL

| Validation | PASS | FAIL |
| --- | --- | --- |
| Diagnostic source | La réparation référence un écart identifié. | Refactor opportuniste sans cause. |
| Minimalité | La couche fautive seule est corrigée. | Plusieurs responsabilités sont déplacées. |
| Chemin validé | `runtimePayload` reste supporté. | Remplacement HTML forcé sans preuve équivalente. |
| Vérification | L'erreur initiale est contrôlée après correction. | Aucun test/check ou reproduction. |

## Exemples de fail

- Corriger une indisponibilité bridge en ajoutant `window.requestAiGeneration = fakeFn` dans l'app.
- Supprimer `applyRuntimePayload` et recharger toute la page à chaque réponse.
- Modifier le prompt pour retourner du Markdown au lieu du payload attendu.
- Réparer sans mettre à jour le contrat alors que la règle devient permanente.

## Source API/protocole/design

- Protocole : `protocols/repair/v1.md`.
- API : `runtime-api/creatia-runtime/v1/`.
- Design : `CreatiaRepairer` répare en préservant les responsabilités et chemins validés.

## Correspondance avec `generationPipeline.js`

Automatisé partiellement par `isAutoRepairableHealthcheck`, `repairConfidence`, `repairable`, `severity` et les checks réparables produits par `runGeneratedAppHealthcheck`. Le protocole Repair complet n'est pas encore automatisé.
