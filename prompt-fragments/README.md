# Prompt fragments Creatia

`prompt-fragments/` est une couche documentaire non canonique pour des snippets de prompt prêts à relire, adapter ou intégrer plus tard. Les fragments ne sont pas branchés au prompt builder dans cette étape.

## Statut

- Type : documentation de prompt
- Canonicalité : non canonique
- Intégration : non branché à `src/platform/ai/promptBuilder.js`
- Règle : chaque fragment doit contenir une section `Sources`

## Rôle

Les fragments résument des contrats, protocoles, API runtime, règles de compatibilité, schémas de sortie, règles de sécurité ou directions design déjà documentés ailleurs dans le dépôt. Ils ne doivent jamais redéfinir, forker ou étendre silencieusement les couches canoniques.

## Versionnement documentaire

Chaque fragment porte un champ `Version` au format `vMAJOR.MINOR.PATCH`, indépendant de la version des API et contrats cités :

- `PATCH` pour une correction de formulation sans changement de sens ;
- `MINOR` pour un ajout compatible dérivé des sources existantes ;
- `MAJOR` pour un changement de portée ou un réalignement important.

La version d'un fragment reste documentaire : elle ne versionne ni ne remplace ses sources canoniques.

## Fragments disponibles

- `runtime-api/creatia-runtime-v1.md` : résumé promptable de l'API runtime Creatia v1.
- `protocols/co-create-flow.md` : flux Co-Create callback-driven.
- `compatibility-rules/html-app.md` : compatibilité générale d'une app HTML générée.
- `compatibility-rules/co-create-app.md` : compatibilité d'une app Co-Create.
- `output-schema/html-app.md` : sortie initiale attendue pour une app HTML.
- `output-schema/runtime-generation.md` : sortie runtime attendue avec `runtimePayload`.
- `output-schema/repair.md` : forme attendue d'une réponse de réparation.
- `output-schema/diagnose.md` : forme attendue d'une réponse de diagnostic.
- `design-system/creatia-compact.md` : direction UI compacte compatible Creatia.
- `safety/no-fake-bridge.md` : interdiction des faux bridges runtime.
- `safety/no-raw-payload.md` : interdiction d'afficher le payload brut comme UI principale.
- `safety/no-direct-ai-from-html.md` : interdiction des appels IA directs depuis l'HTML généré.

## Sources

- Source de gouvernance : `.agent/skills/architecture.md`
- Source de gouvernance : `.agent/skills/prompting.md`
- Source de gouvernance : `.agent/skills/runtime.md`
- Source normative : `runtime-api/creatia-runtime/v1/README.md`
