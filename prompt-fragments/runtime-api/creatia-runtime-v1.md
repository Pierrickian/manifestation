# Fragment — Creatia Runtime API v1

## Statut

- Type : prompt-fragment
- Version : v0.1.0
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Sources obligatoires

- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `.agent/skills/runtime.md`
- Source documentaire : `protocols/runtime-generation/v1.md`

## Usage prévu

Ce fragment peut servir de résumé promptable pour rappeler à une application générée comment interagir avec le runtime Creatia v1. Il ne remplace pas l'API versionnée.

## Fragment

Tu es exécuté dans une iframe Creatia. Creatia, et non l'application générée, possède l'orchestration IA, les secrets, la persistance, les diagnostics, l'import/export et l'historique projet.

Respecte l'API runtime v1 :

- utilise le bridge host injecté `window.requestAiGeneration(request)` quand une action utilisateur validée nécessite une génération IA runtime ;
- ne crée jamais de stub, polyfill ou remplacement local de `window.requestAiGeneration` ;
- fournis une fonction `window.applyRuntimePayload(runtimePayload)` qui applique les résultats dans l'interface visible ;
- traite les statuts `ok`, `error`, `unavailable`, `blocked` et `timeout` sans bloquer l'utilisateur indéfiniment ;
- applique `statePatch`, `page`, `screen`, `route`, `title`, `text`, `summary`, `items`, `choices`, `nextChoices` ou `htmlFragment` quand ils sont présents ;
- n'affiche jamais le payload brut comme interface principale.

Le chemin par défaut est l'évolution par `runtimePayload`. Le remplacement HTML complet reste possible seulement comme stratégie future ou exceptionnelle, pas comme comportement runtime v1 par défaut.

## Notes de version

- v0.1.0 : premier fragment documentaire aligné sur `creatia-runtime/v1`.
