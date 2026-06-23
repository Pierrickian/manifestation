# Prompt fragments Creatia

`prompt-fragments/` est une couche documentaire, non canonique, destinée à rendre les briques de prompt Creatia lisibles, réutilisables et traçables avant leur éventuelle intégration dans un prompt builder.

## Statut

- **Non canonique** : un fragment ne définit pas à lui seul un contrat, une API, un protocole ou une skill.
- **Traçable** : chaque fragment doit citer ses sources normatives ou documentaires.
- **Non branché** : les fragments de ce dossier ne sont pas consommés par le prompt builder dans cette étape.
- **Révisable** : un fragment peut être ajusté, remplacé ou supprimé tant qu'il reste aligné avec ses sources.

## Différences entre fragment, contrat, API, protocole et skill

| Type | Rôle | Autorité | Exemple |
| --- | --- | --- | --- |
| Fragment | Texte prêt à être injecté ou adapté dans un prompt. | Non canonique ; il dérive de sources citées. | Une consigne courte sur `applyRuntimePayload`. |
| Contrat | Ensemble d'exigences validables et PASS/FAIL. | Canonique pour les validations documentées dans `contracts/`. | `contracts/runtime-generation/README.md`. |
| API | Définition opérationnelle des fonctions, messages, statuts et shapes. | Canonique quand elle est versionnée dans `runtime-api/`. | `runtime-api/creatia-runtime/v1/`. |
| Protocole | Séquence d'acteurs, responsabilités, entrées/sorties et erreurs. | Canonique pour le déroulé opérationnel dans `protocols/`. | `protocols/runtime-generation/v1.md`. |
| Skill | Gouvernance agent : architecture, runtime, prompting ou workflow. | Autorité de haut niveau dans `.agent/skills/`. | `.agent/skills/prompting.md`. |

Un fragment peut reprendre le vocabulaire de ces couches, mais il ne doit jamais les contredire, les étendre silencieusement ou créer une version parallèle.

## Format recommandé

Chaque fragment devrait suivre ce squelette :

```md
# Nom du fragment

## Statut

- Type : prompt-fragment
- Version : vX.Y.Z
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Sources obligatoires

- Source normative : `chemin/vers/source`
- Source documentaire : `chemin/vers/source`

## Usage prévu

Décrire le contexte de prompt visé sans promettre une intégration active.

## Fragment

Texte de prompt proposé.

## Notes de version

- vX.Y.Z : changement.
```

## Convention de source obligatoire

Tout fragment doit contenir une section `## Sources obligatoires` avec au minimum une source. Les sources doivent utiliser des chemins relatifs au dépôt et être classées ainsi :

- `Source normative` : contrat, API, protocole ou skill qui fait autorité.
- `Source documentaire` : document explicatif, historique ou exemple.
- `Source d'alignement` : fichier de code, test ou healthcheck quand le fragment reflète un comportement implémenté.

Si une source normative existe, elle doit être citée avant les sources documentaires. Si aucune source normative n'existe, le fragment doit le dire explicitement et rester expérimental.

## Règles de versionnement

Les fragments utilisent une version documentaire `vMAJOR.MINOR.PATCH` indépendante des versions d'API runtime.

- `PATCH` : correction de formulation, typo, clarification sans changement de sens.
- `MINOR` : ajout compatible de consignes, exemple ou contrainte dérivée d'une source existante.
- `MAJOR` : changement de portée, retrait significatif ou réalignement après évolution d'une source normative.

Quand une source normative versionnée change, les fragments concernés doivent être relus. Un fragment ne peut pas prétendre versionner ou remplacer une API comme `creatia-runtime/v1`.

## Exemples de fragments

- `runtime-api/creatia-runtime-v1.md` : résumé promptable de l'API runtime v1.
- `compatibility-rules/html-app.md` : consignes de compatibilité pour une app HTML générée.
- `output-schema/html-app.md` : contraintes de sortie HTML initiale.
- `output-schema/runtime-generation.md` : contraintes de sortie runtime `runtimePayload`.
- `design-system/creatia-compact.md` : direction visuelle compacte pour interfaces générées.
