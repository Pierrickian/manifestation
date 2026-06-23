# Manifestation

Manifestation est une application React/Vite mobile-first d’exploration intérieure. Elle fonctionne comme un wizard vivant : l’utilisateur part d’un ressenti, répond à des passages courts, puis voit apparaître les besoins dominants, les liens et le chemin exploré.


## Gouvernance agents

Le point d'entrée officiel pour les agents est `.agent/README.md`. Les skills canoniques sont dans `.agent/skills/` et doivent être lus avant toute modification. Toute évolution d'architecture, de runtime, de prompting, de convention projet ou de responsabilité doit mettre à jour le skill correspondant dans la même PR. Le contrat runtime Creatia normatif vit dans `runtime-api/creatia-runtime/v1/`; prompts, skills, healthchecks, tests et implémentations doivent rester alignés avec cette source de vérité.

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


## Partage de règles par URL

Les règles peuvent être ouvertes directement depuis une URL stable. Au chargement de l’application, le paramètre `rule` est lu dans l’URL et, s’il correspond à une règle enregistrée, l’interface démarre avec cette règle active comme si elle avait été choisie depuis le menu.

### Rule URLs

- Open Narratia directly: https://manifestation-liard.vercel.app/?rule=narratia

Les paramètres futurs pourront configurer des modes et comportements additionnels sans changer le format principal, par exemple `mode`, `theme` ou `spread`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Règle Mes Questions

La règle **Mes Questions** est accessible depuis le sous-menu **Menu > Règles**. Elle ouvre d’abord un splash screen plein écran, joyeux et magique, avec le titre animé “Mes Questions”; toute la surface est cliquable/tappable pour passer en douceur à la configuration.

L’écran de configuration permet de choisir l’âge avec une roue numérique mobile, le nombre de questions, puis une ou plusieurs matières: orthographe, grammaire, conjugaison, mathématiques, animaux et sciences. Les matières sont affichées comme des cartes toggle avec un état actif clair.

Au lancement, l’app appelle l’IA et attend un JSON strictement exploitable contenant exactement le nombre de questions demandé:

```json
{
  "questions": [
    {
      "id": "q1",
      "subject": "mathematiques",
      "question": "Combien font 3 + 4 ?",
      "answers": [
        { "id": "a", "text": "6" },
        { "id": "b", "text": "7" },
        { "id": "c", "text": "8" }
      ],
      "correctAnswerId": "b"
    }
  ]
}
```

Pendant le jeu, une seule question s’affiche à la fois avec trois boutons de réponse. La bonne réponse n’est jamais exposée avant le choix de l’enfant; après réponse, l’interface verrouille la question, valorise la bonne réponse, invalide les autres, affiche un retour encourageant ou doux, puis permet de passer à la suite. La fin de partie affiche le score, le pourcentage de réussite et le détail par question, avec un bouton pour recommencer.

## Règle Enigmia

La règle **Enigmia** ajoute une app d’énigmes logiques au portail. Chaque manche interroge l’IA via `/api/ai` pour générer une énigme avec trois contenants thématiques, trois inscriptions converties depuis une table logique validée, et trois choix A/B/C affichés comme réponses.

L’interface montre l’état de chargement, l’erreur de génération si l’appel échoue, puis verrouille la réponse choisie. Si le joueur trouve le bon contenant, un message de réussite apparaît; sinon l’app indique la bonne réponse. Dans les deux cas, le bouton **Énigme suivante** relance une génération IA pour créer un nouveau mystère.
