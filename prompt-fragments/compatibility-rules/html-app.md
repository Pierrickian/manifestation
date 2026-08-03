# Fragment — Règles de compatibilité HTML App

## Statut

- Type : prompt-fragment
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Décrire les contraintes minimales d'une app HTML autonome destinée au viewer Creatia.

## Fragment

Génère une application HTML visible, mobile-first et exécutable dans le viewer Creatia.

Règles de compatibilité :

- retourne du HTML réel, pas du JSON affiché ni du texte brut ;
- rends une expérience utilisateur immédiatement visible ;
- prévois une zone scrollable pour les écrans riches en texte ;
- matérialise les capacités demandées dans le HTML visible ;
- si l'application a besoin d'IA runtime, appelle seulement le bridge host injecté ;
- ne demande jamais de clé API à l'utilisateur ;
- ne déplace pas la persistance, les diagnostics ou l'orchestration IA dans l'iframe ;
- sors toujours des états `loading`, `busy` ou `pending` après succès, erreur, indisponibilité, blocage ou timeout.

## Sources

- Source normative : `contracts/html-app/README.md`
- Source normative : `contracts/creatia-compatible-html/README.md`
- Source normative : `runtime-api/creatia-runtime/v1/README.md`
