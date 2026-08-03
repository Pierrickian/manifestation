# Recette documentaire — `co-create`

## Objectif

Produire une application initiale Co-Create dont l'action utilisateur principale peut déclencher une continuation IA réelle via le bridge host, puis appliquer un `runtimePayload` sans simuler l'IA localement.

## Entrées

- Demande utilisateur pour une expérience adaptative ou évolutive.
- Mode explicite `co-create`.
- Besoin de continuation, état initial, contexte et éventuelles données de preload.
- Contraintes de sécurité, de compatibilité et de design.
- Domain skill optionnelle validée, si elle existe.

## Inventaire des blocs

| Bloc | Statut | Contenu documentaire | Source canonique |
| --- | --- | --- | --- |
| System capabilities | Obligatoires | `CreatiaCompatibleApp`, `CreatiaCoCreate`, `CreatiaRuntimeGenerator`. | `system-capabilities/README.md` |
| Contrats | Obligatoires | App HTML, compatibilité host, Co-Create et résultat de continuation runtime. | `contracts/html-app/README.md` ; `contracts/creatia-compatible-html/README.md` ; `contracts/co-create-app/README.md` ; `contracts/runtime-generation/README.md` |
| Protocoles | Obligatoires | Séquence callback Co-Create et sous-séquence de génération runtime. | `protocols/co-create/v1.md` ; `protocols/runtime-generation/v1.md` |
| Prompt fragments | Obligatoires | Runtime API v1, flux Co-Create, compatibilité HTML et Co-Create, schéma HTML initial, schéma runtime de continuation, design compact, `no-fake-bridge`, `no-direct-ai-from-html`, `no-raw-payload`. | Sources canoniques déclarées dans chaque fichier `prompt-fragments/` cité |
| Prompt fragments | Optionnels | Exemples de déclencheurs, d'états ou de choix propres au domaine, seulement s'ils sont traçables. | Contrat Co-Create ; domain skill validée éventuelle |
| Domain skills | Optionnelles | Contenu métier et interaction ; elles dépendent des capacités système et ne définissent jamais bridge, callback ou payload. | `domain-skills/README.md` ; `domain-skills/inventory.md` |

## Ordre d'assemblage

1. **User Request** — expérience et résultat utilisateur recherchés.
2. **Mode** — `co-create`, avec continuation réelle sur l'action principale. Source : `contracts/co-create-app/README.md`.
3. **Runtime API fragment** — `prompt-fragments/runtime-api/creatia-runtime-v1.md`.
4. **Protocol fragment** — `prompt-fragments/protocols/co-create-flow.md`, puis les seules étapes pertinentes de `protocols/runtime-generation/v1.md` pour la continuation ; aucun fragment dérivé séparé n'existe aujourd'hui pour ce second protocole.
5. **System capability fragments** — obligations combinées de `CreatiaCompatibleApp`, `CreatiaCoCreate` et `CreatiaRuntimeGenerator`.
6. **Compatibility rules** — compatibilité HTML, compatibilité Co-Create et les trois fragments de sécurité obligatoires.
7. **Output schema** — schéma HTML pour la génération initiale, complété par les obligations `continuationPlan` et `runtimeCapabilities`, et par la fourniture et la consommation de `preload` conformément aux exigences définies dans `contracts/co-create-app/README.md` ; schéma runtime-generation pour les callbacks ultérieurs. Les deux moments ne doivent pas être confondus.
8. **Design fragment** — `prompt-fragments/design-system/creatia-compact.md`, incluant un statut runtime compréhensible.
9. **Optional domain skills** — après les règles runtime afin qu'elles ne puissent pas les réinterpréter.
10. **Relevant examples** — action principale déclenchante, demande sérialisable, projection d'un prochain écran/choix et récupération après erreur.
11. **Validation checklist** — critères combinés des quatre contrats applicables.

## Exclusions explicites

- Bouton IA séparé imposé alors que l'action principale est le déclencheur sémantique.
- Stub/polyfill de `window.requestAiGeneration`, appel direct à un fournisseur IA, secret ou orchestration dans l'iframe.
- Continuation simulée localement, `runtimePayload` affiché en JSON brut ou succès vide.
- Remplacement HTML complet comme stratégie de continuation par défaut.
- Diagnostic ou réparation exécutés dans ce mode ; ils utilisent leurs recettes distinctes.

## Schéma de sortie attendu

La génération initiale retourne le `html` exécutable défini par `contracts/html-app/README.md` et respecte les métadonnées Co-Create requises par `contracts/co-create-app/README.md`. Elle doit notamment fournir et consommer `preload` conformément aux exigences de ce contrat, sans que la présente recette décide quand ces exigences s'appliquent.

Pour un callback ultérieur, l'IA runtime retourne une réponse structurée de type `runtime_generation` contenant un `runtimePayload` utile. Creatia host valide et normalise ensuite cette réponse, puis renvoie à l'iframe un `RuntimeResult` conforme à `runtime-api/creatia-runtime/v1/README.md`, avec les alias de compatibilité `payload` et `runtimePayload` en cas de succès. `contracts/runtime-generation/README.md` reste la source des validations PASS/FAIL de cette continuation.

## Validations PASS/FAIL

**PASS** si l'app visible déclenche le host sur l'action principale, respecte les exigences de continuation et de `preload` du contrat Co-Create, expose l'état runtime, n'usurpe pas le bridge et applique un payload projetable. **PASS** si les erreurs permettent de sortir du chargement.

**FAIL** si la capacité runtime est annoncée mais absente, si le plan est vide, si le callback dépend d'un bouton artificiel, si l'app appelle l'IA directement, simule le host, rend le payload brut ou remplace toute l'app par défaut. Les critères détaillés proviennent de `contracts/co-create-app/README.md`, `contracts/creatia-compatible-html/README.md`, `contracts/runtime-generation/README.md` et `contracts/html-app/README.md`.
