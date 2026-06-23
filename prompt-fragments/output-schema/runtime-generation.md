# Fragment — Output schema Runtime Generation

## Statut

- Type : prompt-fragment
- Version : v0.1.0
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Sources obligatoires

- Source normative : `contracts/runtime-generation/README.md`
- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `protocols/runtime-generation/v1.md`

## Usage prévu

Ce fragment peut guider une réponse IA de type `runtime_generation`. Il reste documentaire et ne remplace pas les shapes normatives de l'API runtime v1.

## Fragment

Pour une génération runtime, réponds avec un résultat structuré de type `runtime_generation` contenant un `runtimePayload` directement consommable par l'application générée.

Le payload doit fournir au moins un changement utile et projetable :

- `statePatch` pour faire évoluer l'état sémantique ;
- `title`, `text`, `summary`, `page`, `screen` ou `route` pour changer l'écran ou le contenu ;
- `items`, `choices` ou `nextChoices` pour ajouter ou remplacer des éléments interactifs ;
- `htmlFragment` seulement si un fragment local est utile et sûr.

Ne retourne pas un succès vide. Ne réponds pas par une analyse générale. N'utilise pas le remplacement complet du HTML comme chemin par défaut quand un `runtimePayload` suffit.

En cas d'impossibilité, retourne une erreur normalisée avec un statut explicite plutôt qu'un succès trompeur.

## Notes de version

- v0.1.0 : premier fragment documentaire pour réponse runtime.
