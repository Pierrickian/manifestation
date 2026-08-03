# Fragment — Safety: No Fake Bridge

## Statut

- Type : prompt-fragment
- Version : v0.1.0
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Empêcher une app générée de masquer une absence de runtime host avec une simulation locale.

## Fragment

Ne définis jamais `window.requestAiGeneration` toi-même. Ne crée pas de fake bridge, stub, mock, polyfill, fallback IA local ou simulation qui prétend remplacer le bridge Creatia.

Si le bridge n'est pas disponible, l'application doit l'indiquer doucement, écouter l'événement de disponibilité runtime si pertinent, vider ses états de chargement et permettre une reprise ou un réessai. Elle ne doit pas inventer une réponse IA locale.

## Sources

- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `contracts/repair/README.md`
- Source normative : `.agent/skills/runtime.md`
