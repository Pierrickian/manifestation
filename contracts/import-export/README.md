# Contrat Import Export

## Exigences

- L'import/export est une responsabilité Creatia, pas une responsabilité de l'application générée.
- Un export de projet doit préserver l'application courante, la dernière application valide, le plan de continuation, les preload utiles, l'historique de génération et les métadonnées nécessaires à la reprise.
- L'import doit restaurer un projet sans exiger que l'HTML généré possède des secrets, une persistence host ou un provider IA local.
- Les données exportées doivent rester sérialisables et ne pas inclure de clés API ou secrets.
- Après import, le chemin runtime validé doit rester disponible si le projet était compatible : bridge host, diagnostics, continuation et payload runtime.

## Validations PASS/FAIL

| Validation | PASS | FAIL |
| --- | --- | --- |
| Portabilité | Le projet se recharge avec ses applications et métadonnées utiles. | L'import perd l'application valide ou l'historique critique. |
| Responsabilités | Secrets et provider restent hors export. | L'export contient une clé API ou attend une IA dans l'iframe. |
| Runtime après import | Le host peut réinjecter le bridge et reprendre le flux. | L'app importée dépend d'un stub local ou d'un état non sérialisable. |
| Données | JSON projet sérialisable et versionnable. | Fonctions, cycles ou données non portables dans le modèle. |

## Exemples de fail

- Exporter uniquement l'HTML courant sans `continuationPlan` alors que l'expérience est Co-Create.
- Importer un projet qui affiche l'UI mais a perdu la dernière application valide.
- Stocker une clé OpenAI dans le JSON exporté.
- Demander à l'application générée de gérer elle-même l'historique projet.

## Source API/protocole/design

- Design : Creatia possède import/export, persistence et historique projet.
- Source code : `src/platform/ai/projectExport.js` et `src/platform/ai/projectModel.js` portent le modèle projet côté host.
- API runtime : `runtime-api/creatia-runtime/v1/` pour préserver les responsabilités host/iframe.

## Correspondance avec `generationPipeline.js`

Non automatisé aujourd'hui. `generationPipeline.js` contribue indirectement via les checks de compatibilité applicative, mais ne valide pas le contenu des exports/imports projet.
