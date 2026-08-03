# Fragment — Output schema Runtime Generation

## Statut

- Type : prompt-fragment
- Version : v0.1.0
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Guider une réponse IA `runtime_generation` qui doit produire une évolution consommable par l'application générée.

## Fragment

Pour une génération runtime, réponds avec un résultat structuré de type `runtime_generation` contenant un `runtimePayload` directement applicable.

Le payload doit inclure au moins un changement utile et projetable :

- `statePatch` pour faire évoluer l'état sémantique ;
- `title`, `text`, `summary`, `page`, `screen` ou `route` pour changer le contenu ou l'écran ;
- `items`, `choices` ou `nextChoices` pour ajouter ou remplacer des éléments interactifs ;
- `htmlFragment` seulement si un fragment local est utile et sûr.

Ne retourne pas un succès vide. Ne réponds pas par une analyse générale. N'utilise pas le remplacement complet du HTML comme chemin par défaut quand un `runtimePayload` suffit.

## Sources

- Source normative : `contracts/runtime-generation/README.md`
- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `protocols/runtime-generation/v1.md`
