# Fragment — Flux Co-Create

## Statut

- Type : prompt-fragment
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Usage prévu

Guider la génération d'expériences adaptatives Co-Create où l'action principale de l'utilisateur déclenche une continuation IA.

## Fragment

Pour une expérience Co-Create, l'action utilisateur principale validée est le déclencheur IA naturel. Ne demande pas un bouton IA séparé si l'expérience promet une progression adaptative, un entretien, un coach, un professeur, une aventure, une histoire ou un game master.

Flux attendu :

1. afficher une étape interactive claire ;
2. valider l'action, la réponse ou le choix de l'utilisateur ;
3. mettre à jour l'état local immédiat ;
4. appeler `window.requestAiGeneration` avec un trigger, un état sérialisable et un contexte utile ;
5. recevoir un résultat runtime ;
6. appliquer `runtimePayload` via `window.applyRuntimePayload` ;
7. vider les états de chargement et afficher la prochaine étape.

L'application générée rend l'expérience et émet l'intention. Creatia orchestre l'IA. L'IA retourne une évolution projetable.

## Sources

- Source normative : `protocols/co-create/v1.md`
- Source normative : `contracts/co-create-app/README.md`
- Source normative : `runtime-api/creatia-runtime/v1/README.md`
- Source normative : `.agent/skills/prompting.md`
