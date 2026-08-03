# Recette documentaire — `repair`

## Objectif

Proposer une correction minimale de la couche responsable à partir d'un diagnostic explicite, tout en préservant le chemin validé et en indiquant comment vérifier la correction. `repair` ne remplace pas `diagnose`.

## Entrées

- Diagnostic actionnable avec preuves, cause probable et couche responsable.
- Reproduction ou trace de l'échec.
- Mode explicite `repair`.
- Artefact responsable et contrat(s) enfreint(s).

## Inventaire des blocs

| Bloc | Statut | Contenu documentaire | Source canonique |
| --- | --- | --- | --- |
| System capability | Obligatoire | `CreatiaRepairer`. `CreatiaDiagnoser` est une étape préalable, pas une fusion de modes. | `system-capabilities/README.md` |
| Contrat | Obligatoire | Diagnostic source, minimalité, préservation et vérification. | `contracts/repair/README.md` |
| Protocoles | Obligatoire/entrée | Repair v1 ; Diagnose v1 fournit le diagnostic préalable mais n'est pas rejoué si l'entrée est suffisante. | `protocols/repair/v1.md` ; `protocols/diagnose/v1.md` |
| Prompt fragment | Obligatoire | `prompt-fragments/output-schema/repair.md`. | `contracts/repair/README.md` ; `protocols/repair/v1.md` |
| Prompt fragments | Conditionnels | Runtime API et fragments sécurité pour une réparation runtime ; compatibilité HTML/Co-Create pour une app concernée. | API et contrats correspondant à l'écart diagnostiqué |
| Prompt fragments | Optionnels | Design compact pour une réparation visuelle ; fragment `no-raw-payload` pour un rendu brut. | Sources déclarées dans ces fragments |
| Domain skills | Optionnelles | Seulement pour corriger un écart métier identifié ; jamais pour réparer ou redéfinir le runtime. | `domain-skills/README.md` |

## Ordre d'assemblage

1. **User Request** — correction demandée et diagnostic fourni.
2. **Mode** — `repair`, correction minimale et vérifiable.
3. **Runtime API fragment** — obligatoire seulement si le diagnostic touche bridge, runtime generation, payload ou application runtime.
4. **Protocol fragment** — bloc dérivé de `protocols/repair/v1.md` ; le diagnostic est une entrée issue de Diagnose v1.
5. **System capability fragments** — responsabilités `CreatiaRepairer`.
6. **Compatibility rules** — uniquement celles enfreintes selon le diagnostic, avec les fragments de sécurité pertinents.
7. **Output schema** — `prompt-fragments/output-schema/repair.md`.
8. **Design fragment** — seulement pour une cause visuelle ou d'accessibilité.
9. **Optional domain skills** — seulement si la couche fautive est métier.
10. **Relevant examples** — correction minimale de la même classe d'écart et anti-exemples de stub/remplacement complet.
11. **Validation checklist** — contrat Repair, contrat initialement enfreint et contrôle de reproduction.

## Exclusions explicites

- Réparation sans diagnostic : la demande doit être renvoyée vers `diagnose` si les preuves sont insuffisantes.
- Modification de couches non responsables, refactor général ou changement de contrat dissimulé.
- Faux bridge, secret/persistance/orchestration déplacés dans l'app, suppression de `runtimePayload` ou remplacement HTML complet sans preuve équivalente.
- Nouvelle shape runtime, nouvelle API ou pipeline de réparation automatique.

## Schéma de sortie attendu

Une réponse structurée indiquant diagnostic source, couche corrigée, changement minimal, préservation du chemin validé et vérification. `prompt-fragments/output-schema/repair.md` fournit la formulation dérivée ; le contrat normatif des validations reste `contracts/repair/README.md`.

## Validations PASS/FAIL

**PASS** si la réparation référence le diagnostic, cible uniquement la couche responsable, préserve le chemin validé et décrit ou exécute un contrôle de l'erreur initiale.

**FAIL** si elle refactore sans cause, déplace des responsabilités, crée un stub, force le remplacement HTML, change la shape attendue ou omet toute vérification. Les critères détaillés viennent de `contracts/repair/README.md`, complétés par le contrat dont l'écart a été diagnostiqué.
