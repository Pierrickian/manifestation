# Fragment — Règles de compatibilité Co-Create App

## Statut

- Type : prompt-fragment
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Décrire les règles promptables pour une application générée Co-Create compatible avec le callback runtime Creatia.

## Fragment

Si l'application est Co-Create, elle doit exposer une progression adaptative réelle :

- activer `runtimeCapabilities.aiGeneration` quand une capacité runtime est décrite ;
- fournir et consommer un `continuationPlan` utile ;
- utiliser `preload` quand le mode Co-Create le requiert ;
- déclencher l'IA sur l'action utilisateur principale validée ;
- inclure un trigger, un état sérialisable et un contexte utile dans chaque demande runtime ;
- afficher un statut IA/runtime compréhensible ;
- appliquer les retours via `runtimePayload` au lieu de simuler localement une continuation IA ;
- préserver une reprise douce en cas d'erreur, d'indisponibilité, de blocage ou de timeout.

## Sources

- Source normative : `contracts/co-create-app/README.md`
- Source normative : `protocols/co-create/v1.md`
- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `.agent/skills/runtime.md`
