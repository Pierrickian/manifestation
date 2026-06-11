# Manifestation

Manifestation est une application React/Vite mobile-first d’exploration intérieure. Elle fonctionne comme un wizard vivant : l’utilisateur part d’un ressenti, répond à des passages courts, puis voit apparaître les besoins dominants, les liens et le chemin exploré.

## Philosophie produit

Créer, c’est découvrir ce qu’on crée. Découvrir, c’est créer une nouvelle réalité intérieure.

L’app ne remplace jamais l’utilisateur par un verdict. Elle propose des pistes, des chemins et des reformulations possibles. Le système de besoins et couleurs reste central ; l’IA sert seulement à varier, reformuler et faire émerger des liens.

## Parcours utilisateur

1. L’utilisateur choisit un ressenti de départ : perdu, bloqué, seul, enfermé, vide ou fragile.
2. Le système calcule les besoins dominants à partir des scores locaux.
3. Une question dynamique est générée avec 3 à 5 réponses possibles.
4. Chaque réponse rescrore le chemin et influence la question suivante.
5. Après quelques passages, l’app affiche une découverte, une carte du chemin et les besoins liés.
6. Les sessions sont préparées pour l’historique local avec `sessionId`, `feeling`, `answers`, `needs`, `links`, `discovery` et `timestamp`.

## Couleurs et besoins

- Violet : sens, clarté mentale, conscience, expansion.
- Indigo : direction, imagination, intuition, perception.
- Bleu : autonomie, liberté, expression, justesse.
- Vert : amour, lien, âme, rayonnement.
- Jaune : estime, amour propre, confiance, valeur personnelle.
- Orange : découverte, apprentissage, enrichissement, créativité, exploration.
- Rouge : évolution, sécurité de mouvement, support, stabilité.

## Architecture

```txt
api/
  ai.js
src/
  ai/
    buildPrompt.js
    generateQuestion.js
    generateAnswers.js
    generateDiscovery.js
    generateLinks.js
  components/
    DiscoveryCard.jsx
    DynamicQuestionStep.jsx
    FeelingStep.jsx
    HistoryPanel.jsx
    ManifestationWizard.jsx
    NeedBadge.jsx
    NeedMap.jsx
    ReflectionStep.jsx
  data/
    needs.js
    staticQuestions.js
  logic/
    needGraph.js
    wizardScoring.js
  services/
    aiClient.js
```

## IA et secrets

La clé OpenAI ne doit jamais être exposée au frontend. N’utilise pas de variable `VITE_OPENAI_API_KEY`, car tout ce qui commence par `VITE_` peut être envoyé au navigateur.

En local, crée un fichier ignoré par Git :

```txt
.env.local
OPENAI_API_KEY=...
```

Sur Vercel ou un autre hébergeur, ajoute `OPENAI_API_KEY` dans les variables d’environnement du projet. La fonction `api/ai.js` lit `process.env.OPENAI_API_KEY` côté serveur. Si la clé est absente ou si l’appel échoue, l’app utilise un moteur local de secours.

Tu peux aussi définir le modèle serveur :

```txt
OPENAI_MODEL=gpt-5.4-mini
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
