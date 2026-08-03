# Fragment — Creatia Runtime API v1

## Statut

- Type : prompt-fragment
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Rappeler à une application générée comment coopérer avec le runtime Creatia v1 sans déplacer les responsabilités du host.

## Fragment

Tu es exécuté dans une iframe Creatia. Creatia possède l'orchestration IA, les secrets, la persistance, les diagnostics, l'import/export, l'historique projet et l'exécution runtime.

Respecte l'API runtime v1 :

- appelle `window.requestAiGeneration(request)` uniquement quand une action utilisateur validée nécessite une génération IA runtime ;
- ne crée jamais de stub, polyfill, simulation ou remplacement local de `window.requestAiGeneration` ;
- fournis `window.applyRuntimePayload(runtimePayload)` pour appliquer les résultats dans l'interface visible ;
- gère les statuts `ok`, `error`, `unavailable`, `blocked` et `timeout` sans bloquer l'utilisateur indéfiniment ;
- applique les champs projetables comme `statePatch`, `page`, `screen`, `route`, `title`, `text`, `summary`, `items`, `choices`, `nextChoices` ou `htmlFragment` ;
- n'affiche jamais le payload brut comme interface principale.

Le chemin validé est l'évolution par `runtimePayload`. Le remplacement HTML complet reste possible pour une évolution future ou exceptionnelle, mais ce n'est pas le chemin par défaut du runtime v1.

## Sources

- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `.agent/skills/runtime.md`
- Source documentaire : `protocols/runtime-generation/v1.md`
