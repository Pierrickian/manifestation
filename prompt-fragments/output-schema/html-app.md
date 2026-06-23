# Fragment — Output schema HTML App

## Statut

- Type : prompt-fragment
- Version : v0.1.0
- Canonicalité : non canonique
- Intégration : non branché au prompt builder

## Sources obligatoires

- Source normative : `contracts/html-app/README.md`
- Source documentaire : `.agent/skills/prompting.md`

## Usage prévu

Ce fragment décrit une contrainte de sortie initiale pour une application HTML générée. Il ne définit pas un schéma canonique indépendant du contrat HTML App.

## Fragment

La sortie doit fournir un champ `html` non vide contenant un document ou fragment HTML exécutable par le viewer.

Contraintes :

- `html` contient le markup, les styles et le script nécessaires à l'expérience demandée ;
- le contenu ne doit pas ressembler à une réponse conversationnelle, à un objet JSON rendu comme texte, ni à une explication du prompt ;
- le HTML ne doit pas afficher les instructions système, le prompt builder, les contrats internes ou les schémas de validation ;
- l'expérience visible doit être mobile-first, lisible et utilisable dès l'ouverture ;
- pour les demandes textuelles longues, une zone de contenu doit pouvoir défiler sans casser l'écran mobile.

## Notes de version

- v0.1.0 : premier fragment documentaire pour sortie HTML initiale.
