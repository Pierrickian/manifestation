# Contrat Diagnose

## Exigences

- Le diagnostic part d'observations : action utilisateur, trace, logs host, diagnostics iframe, statut runtime et réponse IA normalisée si disponible.
- Il identifie l'étape fautive dans l'ordre du flux : bridge, demande, prompt, appel IA, validation host, transport, application du payload.
- Il compare au contrat `creatia-runtime/v1` sans inventer de shape locale.
- Il produit une cause probable, des preuves et une prochaine action recommandée.
- Il distingue fallback protecteur et preuve réelle de compatibilité.

## Validations PASS/FAIL

| Validation | PASS | FAIL |
| --- | --- | --- |
| Preuves | Le diagnostic cite les traces ou observations utilisées. | Conclusion sans preuve disponible. |
| Étape responsable | Une couche responsable est nommée. | Diagnostic vague : “ça ne marche pas”. |
| Alignement contrat | Référence le contrat v1 applicable. | Propose une shape ad hoc. |
| Action | Recommandation concrète ou besoin de preuves manquantes. | Aucune suite actionnable. |

## Exemples de fail

- Conclure que l'IA est fautive sans vérifier si le bridge est injecté.
- Considérer un rendu fallback comme une application compatible.
- Réparer un stub local sans noter qu'il masque le bridge host.
- Ignorer un `status: 'blocked'` et relancer plusieurs générations concurrentes.

## Source API/protocole/design

- Protocole : `protocols/diagnose/v1.md`.
- API : logs, statuts, messages et diagnostics décrits dans `runtime-api/creatia-runtime/v1/`.
- Design : le diagnostic appartient à la capacité système `CreatiaDiagnoser`.

## Correspondance avec `generationPipeline.js`

Automatisé partiellement par les objets `checks`, `failedChecks`, `repairConfidence`, `isRepairable`, `severity`, `expected` et `actual` produits par `runGeneratedAppHealthcheck`. Ce n'est pas un diagnostic runtime complet.
