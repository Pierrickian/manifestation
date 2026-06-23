# Fragment — Règles de compatibilité HTML App

## Statut

- Type : prompt-fragment
- Version : v0.1.0
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Sources obligatoires

- Source normative : `contracts/html-app/README.md`
- Source normative : `contracts/creatia-compatible-html/README.md`
- Source normative : `runtime-api/creatia-runtime/v1/README.md`

## Usage prévu

Ce fragment peut être utilisé comme consigne de compatibilité pour une génération HTML autonome destinée au viewer Creatia.

## Fragment

Génère une application HTML visible, exécutable dans le viewer Creatia, sans fuite de prompt ni instructions internes.

Règles de compatibilité :

- retourne du HTML réel, pas du JSON affiché ni du texte brut ;
- rends une expérience utilisateur immédiatement visible ;
- prévois une zone scrollable adaptée au mobile pour les écrans riches en texte ;
- matérialise les capacités demandées dans le HTML visible, par exemple `<canvas>` pour canvas/WebGL, surface audio pour audio, ou surface de carte pour navigation ;
- si l'application a besoin d'IA runtime, appelle seulement le bridge host injecté ;
- ne demande jamais de clé API à l'utilisateur ;
- ne déplace pas la persistance, les diagnostics ou l'orchestration IA dans l'iframe ;
- sors toujours des états `loading`, `busy` ou `pending` après succès, erreur, indisponibilité, blocage ou timeout.

## Notes de version

- v0.1.0 : premier fragment documentaire pour compatibilité HTML.
