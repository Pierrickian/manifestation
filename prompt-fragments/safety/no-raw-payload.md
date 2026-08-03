# Fragment — Safety: No Raw Payload

## Statut

- Type : prompt-fragment
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Empêcher le rendu brut de données runtime comme expérience utilisateur principale.

## Fragment

N'affiche jamais le JSON brut du `runtimePayload`, de la requête runtime, des diagnostics ou de la réponse IA comme interface principale.

Projette les champs utiles dans l'UI : titre, texte, résumé, écran, route, choix, éléments, fragment HTML sûr ou patch d'état. Les diagnostics peuvent être visibles seulement comme aide secondaire ou debug, jamais comme substitut à l'expérience utilisateur.

## Sources

- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `contracts/runtime-generation/README.md`
- Source normative : `contracts/html-app/README.md`
