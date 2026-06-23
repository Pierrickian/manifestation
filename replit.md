# Workspace


## Gouvernance agents

Avant toute modification, lire `.agent/README.md` puis tous les fichiers de `.agent/skills/`. Ces skills sont l'emplacement officiel des règles d'architecture, runtime, prompting et workflow agent. Ils doivent être respectés même si le prompt utilisateur ne les mentionne pas, et mis à jour dans la même modification lorsqu'une nouvelle direction, convention ou responsabilité apparaît.

## Overview

Application React + Vite mobile-first appelée **Manifestation**.

Manifestation remplace l’ancien template de jeu par un guide d’exploration intérieure. L’utilisateur part d’un ressenti simple, répond à quelques questions courtes, puis relit un chemin qui met en évidence un besoin dominant, des besoins liés, une couleur et une découverte possible.

## Stack

- Node.js: 24
- React + Vite
- Framer Motion pour transitions courtes uniquement
- CSS mobile-first

## Key Commands

- `npm run dev`
- `npm run build`
- `npm run preview`

## Architecture

```txt
src/
  main.jsx
  App.jsx
  style.css
  data/
    needs.js
    questions.js
  logic/
    wizardScoring.js
  components/
    DiscoveryCard.jsx
    FeelingStep.jsx
    ManifestationWizard.jsx
    NeedBadge.jsx
    NeedMap.jsx
    QuestionStep.jsx
    ReflectionStep.jsx
```

## Principes produit

- L’app est un guide d’exploration intérieure, pas un formulaire figé.
- Le résultat ne doit jamais énoncer une vérité absolue sur l’utilisateur.
- Préférer les formulations douces : “tu sembles peut-être chercher…”, “ce chemin pointe vers…”, “une piste possible serait…”.
- Toujours montrer comment le chemin s’est construit : ressenti, réponse, reflets, besoin dominant, besoins liés.
- Les couleurs structurent les besoins de façon subtile, sans surcharge spirituelle.

## Principes d’architecture

- Garder les données séparées de l’UI.
- Garder la logique de scoring dans `src/logic/wizardScoring.js`.
- Préférer de petits composants lisibles.
- Éviter les gros fichiers monolithiques.
- Éviter les animations infinies lourdes ; privilégier des transitions courtes déclenchées par les choix utilisateur.
- Penser d’abord au mobile portrait : grandes zones tactiles, texte court, hiérarchie claire.

## Besoins et couleurs

- Violet : sens, clarté mentale.
- Indigo : direction, imagination.
- Bleu : autonomie, liberté, expression.
- Vert : amour, lien.
- Jaune : soi, estime, amour propre.
- Orange : découverte, apprentissage, enrichissement, créativité.
- Rouge : évolution, sécurité de mouvement, support.
