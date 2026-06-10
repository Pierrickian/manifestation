# Manifestation

Manifestation est une application React/Vite mobile-first d’exploration intérieure. Elle remplace l’ancien template de jeu par un wizard vivant qui part d’un ressenti simple et aide l’utilisateur à découvrir une piste intérieure douce, jamais présentée comme une vérité absolue.

## Philosophie produit

Créer, c’est découvrir ce qu’on crée. Découvrir, c’est créer une nouvelle réalité intérieure.

L’app n’est pas un questionnaire théorique : elle accompagne l’utilisateur dans son propre paysage intérieur en montrant comment chaque choix construit le chemin affiché à l’écran.

## Parcours utilisateur

1. L’utilisateur choisit un ressenti de départ : perdu, bloqué, seul, enfermé, vide ou fragile.
2. Une question adaptative affine ce qui semble demander de l’attention.
3. Trois questions de réflexion ajoutent des nuances au chemin.
4. Le résultat formule une découverte possible avec un besoin dominant, des besoins liés et une carte lisible du chemin.
5. L’utilisateur peut explorer un autre chemin à tout moment.

## Couleurs et besoins

Les sept couleurs structurent les besoins sans surcharger l’expérience spirituellement :

- Violet : sens et clarté mentale.
- Indigo : direction et imagination.
- Bleu : autonomie, liberté et expression.
- Vert : amour et lien.
- Jaune : soi, estime et amour propre.
- Orange : découverte, apprentissage, enrichissement et créativité.
- Rouge : évolution, sécurité de mouvement et support.

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

- `data/needs.js` décrit les couleurs, besoins, états et phrases de guidance.
- `data/questions.js` contient les ressentis, réponses adaptatives et questions de réflexion.
- `logic/wizardScoring.js` calcule les scores, le besoin dominant et les besoins liés.
- Les composants React restent petits, lisibles et centrés sur une responsabilité.
- Framer Motion est utilisé uniquement pour des transitions courtes entre étapes.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Évolutions possibles

Cette base est prête pour ajouter :

- un historique des chemins explorés ;
- un graphe visuel des besoins ;
- une navigation plus avancée dans la carte intérieure ;
- des textes localisés ;
- une sauvegarde locale des découvertes.
