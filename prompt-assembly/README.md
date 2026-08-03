# Assemblage documentaire des prompts Creatia

## Statut et portée

Ce dossier décrit les **recettes cibles** de composition des prompts Creatia. Il ne constitue ni un prompt builder, ni un registre exécutable, ni un pipeline de sélection. Aucun fragment documenté ici n'est branché à `src/platform/ai/promptBuilder.js` et cette couche ne change pas les prompts actuellement envoyés à l'IA.

Les cinq modes sont documentés séparément :

- [`create`](create.md) ;
- [`co-create`](co-create.md) ;
- [`runtime-generation`](runtime-generation.md) ;
- [`diagnose`](diagnose.md) ;
- [`repair`](repair.md).

`Capability Discovery`, `Capability Resolution` et `Skill Resolution` restent des évolutions prospectives. Leur automatisation est explicitement hors de cette couche ; voir [`discovery.md`](discovery.md).

## Autorité des sources

L'assemblage ne change pas la responsabilité des couches :

1. `runtime-api/creatia-runtime/v1/` est la source normative des fonctions, messages, enveloppes, statuts et shapes runtime.
2. `contracts/` porte les exigences et validations PASS/FAIL.
3. `protocols/` porte le déroulé des séquences opérationnelles. Les acteurs, responsabilités, entrées/sorties et erreurs y servent à expliquer ces séquences ; les protocoles ne définissent ni les shapes runtime ni les validations PASS/FAIL.
4. `system-capabilities/` classe les capacités structurelles Creatia.
5. `design/` porte les attentes documentaires d'interface et d'accessibilité.
6. `prompt-fragments/` fournit des formulations dérivées, non canoniques. En cas d'écart, la source canonique citée par le fragment prévaut.
7. `domain-skills/` reste optionnel et métier. Une domain skill ne peut jamais redéfinir l'API runtime, le bridge, les messages, `runtime_generation`, `runtimePayload`, les diagnostics, la réparation ou l'orchestration host.

## Gabarit d'ordre commun

Chaque recette explicite la présence, l'absence ou le caractère conditionnel de chacun des blocs suivants, dans cet ordre :

```txt
1. User Request
2. Mode
3. Runtime API fragment, si applicable
4. Protocol fragment, si applicable
5. System capability fragments
6. Compatibility rules
7. Output schema
8. Design fragment
9. Optional domain skills
10. Relevant examples
11. Validation checklist
```

« Fragment » désigne ici un bloc promptable dérivé d'une source citée. Quand un fichier existe dans `prompt-fragments/`, la recette le nomme. Quand aucun fichier dérivé n'existe, la recette identifie la source canonique à adapter manuellement au lieu de prétendre qu'un fragment est disponible.

Les validations sont assemblées en dernier afin de contrôler la réponse sans diluer l'objectif ou le schéma de sortie. Les exemples illustrent les blocs précédents et ne peuvent pas introduire de règle absente d'une source canonique.

## Règles transversales

- N'inclure que les blocs utiles au mode ; davantage de contexte n'est pas automatiquement plus sûr.
- Ne jamais injecter les fragments runtime ou Co-Create dans `create` par défaut.
- Préserver l'évolution par `runtimePayload` comme chemin runtime v1 validé ; le remplacement HTML complet n'est pas le chemin runtime par défaut.
- Garder `diagnose` et `repair` distincts : le premier explique à partir de preuves, le second corrige à partir d'un diagnostic.
- Une recette documentaire ne garantit pas que l'assemblage live actuel suit cet ordre.
- Toute intégration future doit faire l'objet d'un changement fonctionnel séparé, avec analyse du prompt réel, tests et diagnostics.

## Sources canoniques

- Gouvernance : `.agent/skills/architecture.md`, `.agent/skills/prompting.md`, `.agent/skills/runtime.md`.
- Capacités : `system-capabilities/README.md`.
- API runtime : `runtime-api/creatia-runtime/v1/README.md`.
- Contrats : `contracts/README.md` et les contrats cités par chaque mode.
- Protocoles : `protocols/*/v1.md` cités par chaque mode.
- Fragments dérivés : `prompt-fragments/README.md`.
- Domain skills : `domain-skills/README.md`, `domain-skills/inventory.md`.
