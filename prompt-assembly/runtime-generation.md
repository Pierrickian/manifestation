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
| Contrat | Obligatoire | Réponse IA `runtime_generation` avec payload consommable, puis validation et normalisation par le host. | `contracts/runtime-generation/README.md` ; `runtime-api/creatia-runtime/v1/README.md` |
| Protocole | Obligatoire | Séquence de la demande iframe jusqu'à l'application du résultat. | `protocols/runtime-generation/v1.md` |
| Prompt fragments | Obligatoires | Runtime API v1 et output schema runtime-generation. | `runtime-api/creatia-runtime/v1/README.md` ; `contracts/runtime-generation/README.md` |
| Prompt fragments | Optionnels | `prompt-fragments/design-system/creatia-compact.md` si le payload produit du contenu UI ; `prompt-fragments/safety/no-raw-payload.md` comme rappel de projection. | Sources de ces fragments |
| Domain skills | Optionnelles | Contraintes de contenu nécessaires à la prochaine évolution, jamais une shape runtime. | `domain-skills/README.md` |

## Ordre d'assemblage

1. **User Request** — intention runtime émise et contexte utile, sans secret ni état non sérialisable.
2. **Mode** — `runtime-generation` et instruction de produire une évolution, pas une nouvelle app.
3. **Runtime API fragment** — `prompt-fragments/runtime-api/creatia-runtime-v1.md`.
4. **Protocol fragment** — bloc dérivé de `protocols/runtime-generation/v1.md` ; aucun fichier dérivé séparé n'existe actuellement.
5. **System capability fragments** — obligations `CreatiaRuntimeGenerator`.
6. **Compatibility rules** — contrat d'aliases, statuts et contenu projetable de l'API v1 ; pas de règles de génération HTML initiale.
7. **Output schema** — `prompt-fragments/output-schema/runtime-generation.md` pour la réponse attendue de l'IA ; `runtime-api/creatia-runtime/v1/README.md` reste la source de la normalisation et de l'enveloppe produite ensuite par le host.
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

Les sorties successives doivent rester distinguées :

1. **Sortie de l'IA runtime** — l'IA retourne une réponse structurée de type `runtime_generation` contenant un `runtimePayload` avec au moins un contenu projetable ou `statePatch` utile. `prompt-fragments/output-schema/runtime-generation.md` formule cette attente à partir de `contracts/runtime-generation/README.md`.
2. **Normalisation par Creatia host** — le host valide la réponse IA, refuse un succès vide et normalise le succès ou l'erreur conformément à `runtime-api/creatia-runtime/v1/README.md`.
3. **Réponse host vers l'iframe** — le host produit alors le `RuntimeResult` normatif et conserve, en cas de succès, les alias de compatibilité `payload` et `runtimePayload` définis par l'API v1.

La recette porte sur le prompt adressé à l'IA et ne demande donc pas à l'IA de fabriquer elle-même l'enveloppe host/iframe.

## Validations PASS/FAIL

**PASS** si la réponse IA est de type `runtime_generation` et contient un payload applicable, puis si le host la valide, la normalise et préserve les alias compatibles dans son propre `RuntimeResult`. **PASS** si une mise à jour locale suffit et qu'aucun remplacement complet n'est demandé.

**FAIL** pour une réponse IA conversationnelle, un payload absent ou vide, une normalisation host qui annonce un faux succès, un `RuntimeResult` host qui omet un alias de compatibilité, un échec silencieux ou une reconstruction HTML par défaut. Source exclusive des critères : `contracts/runtime-generation/README.md` ; source exclusive des shapes et messages host/iframe : `runtime-api/creatia-runtime/v1/README.md`.
