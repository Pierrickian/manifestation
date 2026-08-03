# Fragment — Output schema Repair

## Statut

- Type : prompt-fragment
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Structurer une réponse de réparation Creatia sans masquer la cause ni casser le chemin runtime validé.

## Fragment

Pour une réparation, retourne une réponse structurée qui indique :

- le diagnostic ou l'écart observé qui justifie la réparation ;
- la couche responsable corrigée : application générée, prompt, host runtime, validation, documentation ou test ;
- le changement minimal proposé ;
- la façon dont le chemin validé `requestAiGeneration` → `runtime_generation` → `runtimePayload` → `applyRuntimePayload` reste préservé ;
- la vérification recommandée ou exécutée.

Ne crée pas de faux bridge local, ne déplace pas les secrets, la persistence ou l'orchestration IA dans l'application générée, et ne force pas un remplacement HTML complet sans preuve équivalente.

## Sources

- Source normative : `contracts/repair/README.md`
- Source normative : `protocols/repair/v1.md`
- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `.agent/skills/runtime.md`
