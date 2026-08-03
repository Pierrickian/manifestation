# Recette documentaire — `create`

## Objectif

Produire une application HTML initiale, autonome, visible et mobile-first à partir de la demande utilisateur. Ce mode ne promet pas de continuation IA : il ne reçoit donc pas les instructions runtime ou Co-Create par défaut.

## Entrées

- Demande utilisateur et contraintes produit.
- Mode explicite `create`.
- Contexte de design Creatia utile à l'application initiale.
- Éventuelle expertise métier, seulement si une domain skill validée existe un jour.

## Inventaire des blocs

| Bloc | Statut | Contenu documentaire | Source canonique |
| --- | --- | --- | --- |
| System capability | Obligatoire | `CreatiaCompatibleApp` pour les obligations minimales d'exécution dans le viewer. | `system-capabilities/README.md` ; `contracts/html-app/README.md` ; `contracts/creatia-compatible-html/README.md` |
| Contrats | Obligatoires | HTML visible/exécutable et compatibilité avec les responsabilités Creatia. | `contracts/html-app/README.md` ; `contracts/creatia-compatible-html/README.md` |
| Protocoles | Aucun | Une création initiale sans runtime n'a pas de séquence opérationnelle dédiée dans `protocols/`. | `protocols/` ; `.agent/skills/runtime.md` |
| Prompt fragments | Obligatoires | `prompt-fragments/compatibility-rules/html-app.md`, `prompt-fragments/output-schema/html-app.md`, `prompt-fragments/design-system/creatia-compact.md`. | Sources listées dans chaque fragment, principalement les deux contrats HTML et `design/` |
| Prompt fragments | Optionnels | Aucun fragment runtime ou Co-Create. Des exemples métier peuvent être ajoutés seulement s'ils proviennent d'une source de domaine validée. | `prompt-fragments/README.md` ; `domain-skills/README.md` |
| Domain skills | Optionnelles | Vocabulaire, ton, exemples et contraintes métier ; aucune skill réutilisable n'est actuellement extraite. | `domain-skills/README.md` ; `domain-skills/inventory.md` |

## Ordre d'assemblage

1. **User Request** — demande originale, sans la réinterpréter en besoin runtime. Source : utilisateur.
2. **Mode** — instruction `create` : générer l'application initiale. Source : cette recette et `contracts/html-app/README.md`.
3. **Runtime API fragment** — **omis**.
4. **Protocol fragment** — **omis**.
5. **System capability fragments** — obligations `CreatiaCompatibleApp`, dérivées des contrats HTML.
6. **Compatibility rules** — `prompt-fragments/compatibility-rules/html-app.md`, en ignorant toute clause runtime conditionnelle puisqu'aucun runtime n'est demandé.
7. **Output schema** — `prompt-fragments/output-schema/html-app.md`.
8. **Design fragment** — `prompt-fragments/design-system/creatia-compact.md`.
9. **Optional domain skills** — seulement une skill extraite et pertinente ; aucune candidate n'est injectée comme si elle était active.
10. **Relevant examples** — exemples directement liés à la demande ou à une source métier validée.
11. **Validation checklist** — validations de `contracts/html-app/README.md` et responsabilités applicables de `contracts/creatia-compatible-html/README.md`.

## Exclusions explicites

- `prompt-fragments/runtime-api/creatia-runtime-v1.md` et `prompt-fragments/protocols/co-create-flow.md`.
- Fragments de compatibilité Co-Create et schéma `runtime-generation`.
- `continuationPlan`, `preload`, callbacks, faux bridge, appel IA runtime ou reconstruction runtime.
- Fragments Diagnose/Repair et mécanismes prospectifs de discovery/résolution.

## Schéma de sortie attendu

La réponse suit le schéma documentaire de `prompt-fragments/output-schema/html-app.md` : un champ `html` non vide contenant une expérience exécutable. La forme et les validations restent définies par `contracts/html-app/README.md` ; cette recette n'en crée pas une variante.

## Validations PASS/FAIL

**PASS** si `html` est présent, exécutable, visible, mobile-first, sans fuite d'instructions, scrollable lorsque nécessaire et cohérent avec les capacités demandées. **PASS** si aucune instruction runtime ou Co-Create inutile n'a été injectée.

**FAIL** si la réponse est du texte/JSON au lieu d'une app, si elle expose les prompts internes, ou si elle invente un bridge, une continuation IA ou des obligations runtime non demandées. Les critères détaillés et exemples d'échec viennent exclusivement de `contracts/html-app/README.md` et `contracts/creatia-compatible-html/README.md`.
