# Recette documentaire — `diagnose`

## Objectif

Expliquer un écart à partir de preuves observables, identifier la couche probablement responsable et recommander la prochaine action. Ce mode n'applique aucune correction.

## Entrées

- Action utilisateur et symptôme observé.
- Traces, logs host, diagnostics iframe, statut runtime et réponse normalisée disponibles.
- Mode explicite `diagnose`.
- Contrat(s) dont la conformité doit être évaluée.

## Inventaire des blocs

| Bloc | Statut | Contenu documentaire | Source canonique |
| --- | --- | --- | --- |
| System capability | Obligatoire | `CreatiaDiagnoser`. | `system-capabilities/README.md` |
| Contrat | Obligatoire | Preuves, étape responsable, alignement contractuel et action. | `contracts/diagnose/README.md` |
| Protocole | Obligatoire | Collecter, localiser, comparer, classer et recommander. | `protocols/diagnose/v1.md` |
| Prompt fragment | Obligatoire | `prompt-fragments/output-schema/diagnose.md`. | `contracts/diagnose/README.md` ; `protocols/diagnose/v1.md` |
| Prompt fragments | Conditionnels | Runtime API v1 pour un incident runtime ; règles HTML/Co-Create comme référentiel de comparaison selon l'app examinée. | `runtime-api/creatia-runtime/v1/README.md` ; contrats applicables |
| Prompt fragments | Optionnels | Design compact uniquement si le symptôme concerne l'UI, l'accessibilité ou un overlay. | `design/` et sources du fragment design |
| Domain skills | Optionnelles | Aide à interpréter une exigence métier, sans modifier le diagnostic runtime. | `domain-skills/README.md` |

## Ordre d'assemblage

1. **User Request** — question de diagnostic et observations brutes.
2. **Mode** — `diagnose`, avec interdiction de corriger.
3. **Runtime API fragment** — `prompt-fragments/runtime-api/creatia-runtime-v1.md` seulement pour un incident runtime.
4. **Protocol fragment** — bloc dérivé de `protocols/diagnose/v1.md` ; aucun fichier de protocole dérivé autonome n'existe actuellement.
5. **System capability fragments** — responsabilités `CreatiaDiagnoser`.
6. **Compatibility rules** — seulement les règles du contrat effectivement vérifié (HTML, Co-Create ou runtime).
7. **Output schema** — `prompt-fragments/output-schema/diagnose.md`.
8. **Design fragment** — conditionnel à un symptôme d'interface.
9. **Optional domain skills** — contexte métier seulement si nécessaire à l'interprétation.
10. **Relevant examples** — preuves présentes/manquantes, fallback trompeur et localisation dans l'ordre du flux.
11. **Validation checklist** — `contracts/diagnose/README.md`, plus le contrat évalué pour déterminer l'écart.

## Exclusions explicites

- Modification de code, de prompt, de document ou de payload.
- Réparation implicite, refactor opportuniste ou passage silencieux au mode `repair`.
- Conclusion sans preuve, shape runtime inventée ou fallback traité comme preuve complète.
- Domain skill utilisée pour contredire l'API ou attribuer arbitrairement une cause runtime.

## Schéma de sortie attendu

Une réponse structurée contenant observations, étape fautive probable, cause et confiance, preuves, prochaine action et preuves manquantes. La forme dérivée se trouve dans `prompt-fragments/output-schema/diagnose.md` ; les obligations PASS/FAIL restent dans `contracts/diagnose/README.md`.

## Validations PASS/FAIL

**PASS** si les preuves sont citées, une couche responsable est identifiée, le bon contrat est utilisé et une action concrète ou un besoin de preuves supplémentaires est fourni.

**FAIL** si le résultat reste vague, accuse l'IA sans parcourir le flux, invente une shape, masque un mismatch derrière un fallback ou applique déjà une correction. Source exclusive des validations : `contracts/diagnose/README.md`.
