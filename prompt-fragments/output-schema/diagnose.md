# Fragment — Output schema Diagnose

## Statut

- Type : prompt-fragment
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Structurer une réponse de diagnostic Creatia à partir d'observations, traces et contrats.

## Fragment

Pour un diagnostic, retourne une réponse structurée qui contient :

- les observations utilisées : action, trace, logs host, diagnostics iframe, statut runtime ou réponse IA normalisée ;
- l'étape fautive probable dans le flux : bridge, demande, prompt, appel IA, validation host, transport ou application du payload ;
- la cause probable et son niveau de confiance ;
- les preuves qui soutiennent cette cause ;
- la prochaine action recommandée ;
- les preuves manquantes si la conclusion reste incertaine.

Ne conclus pas que l'IA est fautive sans vérifier le bridge, la demande, la validation host et l'application du payload. Ne considère pas un fallback protecteur comme une preuve de compatibilité complète.

## Sources

- Source normative : `contracts/diagnose/README.md`
- Source normative : `protocols/diagnose/v1.md`
- Source normative : `runtime-api/creatia-runtime/v1/README.md`
