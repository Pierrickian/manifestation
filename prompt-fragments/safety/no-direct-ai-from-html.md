# Fragment — Safety: No Direct AI From HTML

## Statut

- Type : prompt-fragment
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Empêcher une application HTML générée de contacter directement un fournisseur IA ou de demander des secrets à l'utilisateur.

## Fragment

Le HTML généré ne contacte jamais directement OpenAI ou un autre fournisseur IA. Il ne demande pas de clé API, ne stocke pas de secret et n'appelle pas d'endpoint IA depuis l'iframe.

Quand une génération IA est nécessaire, l'application émet une intention via `window.requestAiGeneration`. Creatia host orchestre l'appel IA, conserve les secrets, valide le résultat et renvoie un `runtimePayload` applicable.

## Sources

- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `contracts/creatia-compatible-html/README.md`
- Source normative : `.agent/skills/prompting.md`
