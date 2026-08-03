# Recette documentaire — `runtime-generation`

## Objectif

Transformer une intention applicative sérialisable et l'état courant en une mise à jour runtime projetable. Ce mode fait évoluer l'application existante par `runtimePayload` ; il ne reconstruit pas l'application complète par défaut.

## Entrées

- `RuntimeRequest` et contexte projet disponibles côté Creatia.
- Mode explicite `runtime-generation`.
- État, trigger, continuation, preload et historique utile selon la demande.
- Contrat de sortie runtime v1.

## Inventaire des blocs

| Bloc | Statut | Contenu documentaire | Source canonique |
| --- | --- | --- | --- |
| System capability | Obligatoire | `CreatiaRuntimeGenerator`. | `system-capabilities/README.md` |
| Contrat | Obligatoire | Résultat `runtime_generation` avec payload consommable ou erreur normalisée. | `contracts/runtime-generation/README.md` |
| Protocole | Obligatoire | Séquence de la demande iframe jusqu'à l'application du résultat. | `protocols/runtime-generation/v1.md` |
| Prompt fragments | Obligatoires | Runtime API v1 et output schema runtime-generation. | `runtime-api/creatia-runtime/v1/README.md` ; `contracts/runtime-generation/README.md` |
| Prompt fragments | Optionnels | `design-system/creatia-compact.md` si le payload produit du contenu UI ; `safety/no-raw-payload.md` comme rappel de projection. | Sources de ces fragments |
| Domain skills | Optionnelles | Contraintes de contenu nécessaires à la prochaine évolution, jamais une shape runtime. | `domain-skills/README.md` |

## Ordre d'assemblage

1. **User Request** — intention runtime émise et contexte utile, sans secret ni état non sérialisable.
2. **Mode** — `runtime-generation` et instruction de produire une évolution, pas une nouvelle app.
3. **Runtime API fragment** — `prompt-fragments/runtime-api/creatia-runtime-v1.md`.
4. **Protocol fragment** — bloc dérivé de `protocols/runtime-generation/v1.md` ; aucun fichier dérivé séparé n'existe actuellement.
5. **System capability fragments** — obligations `CreatiaRuntimeGenerator`.
6. **Compatibility rules** — contrat d'aliases, statuts et contenu projetable de l'API v1 ; pas de règles de génération HTML initiale.
7. **Output schema** — `prompt-fragments/output-schema/runtime-generation.md`.
8. **Design fragment** — optionnel et limité aux champs visibles demandés.
9. **Optional domain skills** — seulement le contexte métier nécessaire à ce tour.
10. **Relevant examples** — patch d'état, contenu, items ou prochains choix ; jamais un exemple qui élargit la shape normative.
11. **Validation checklist** — validations de `contracts/runtime-generation/README.md`.

## Exclusions explicites

- HTML complet ou recréation de l'application comme réponse par défaut.
- Analyse conversationnelle, succès vide, payload purement analytique ou schéma ad hoc.
- Fragments de génération HTML initiale, de Co-Create initial, de Diagnose ou de Repair.
- API runtime redéfinie par un exemple ou une domain skill.

## Schéma de sortie attendu

Un `RuntimeResult` de type `runtime_generation` conforme à `runtime-api/creatia-runtime/v1/README.md`, contenant les aliases de succès attendus et un `runtimePayload` avec au moins un contenu projetable ou `statePatch` utile ; sinon, une erreur normalisée. Le fragment `prompt-fragments/output-schema/runtime-generation.md` n'est qu'une formulation dérivée de ces sources.

## Validations PASS/FAIL

**PASS** si le type runtime est correct, le payload est applicable, les aliases compatibles sont préservés et toute erreur porte un statut explicite. **PASS** si une mise à jour locale suffit et qu'aucun remplacement complet n'est demandé.

**FAIL** pour une réponse conversationnelle, un succès sans contenu, un seul alias cassant les consommateurs, un échec silencieux ou une reconstruction HTML par défaut. Source exclusive des critères : `contracts/runtime-generation/README.md` ; source exclusive des shapes : `runtime-api/creatia-runtime/v1/README.md`.
