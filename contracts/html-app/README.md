# Contrat HTML App

## Exigences

- La réponse de génération contient un champ `html` non vide.
- Le contenu est un document ou fragment HTML exécutable par le viewer, pas du texte brut ni du JSON.
- L'application rend une expérience utilisateur visible et ne fuit pas le prompt, les schémas internes ou les instructions builder.
- Les écrans riches en texte disposent d'une surface scrollable adaptée au mobile.
- Les capacités déclarées sont matérialisées dans l'HTML quand elles sont demandées : canvas/WebGL, audio, simulation, carte/navigation ou speech.

## Validations PASS/FAIL

| Validation | PASS | FAIL |
| --- | --- | --- |
| `html-present` | `html` contient du markup non vide. | `html` est vide ou absent. |
| `html-document-shape` | Le contenu ressemble à du HTML exécutable. | Le contenu ressemble à du JSON ou à du texte brut. |
| `html-no-internal-prompt-leak` | Aucun prompt/schéma interne visible. | Le prompt builder ou la réponse JSON sont affichés. |
| `text_screens_scrollable` | Une zone scrollable existe quand le texte est dense. | Un long contenu mobile n'a pas de conteneur scrollable. |
| Validations par capacité | L'élément attendu existe selon la capacité. | La capacité est déclarée mais aucune surface correspondante n'existe. |

## Exemples de fail

- `html: ""`.
- Une page qui affiche `Return ONLY valid JSON` ou `STRUCTURED_APP_INSTRUCTIONS`.
- Une réponse `{ "kind": "html_app" }` affichée dans un `<pre>` au lieu d'une interface.
- Une demande WebGL qui ne contient aucun `<canvas>` ni initialisation de contexte.

## Source API/protocole/design

- Design : application mobile-first, expérience visible, pas de fuite de prompt.
- API runtime : `runtime-api/creatia-runtime/v1/` pour le statut de compatibilité avec le viewer et les responsabilités de l'application générée.
- Implémentation viewer : `src/platform/ai/renderers/HtmlViewer.jsx` injecte le guard runtime et exécute l'application HTML.

## Correspondance avec `generationPipeline.js`

Automatisé partiellement par `runGeneratedAppHealthcheck` : `html-present`, `html-document-shape`, `html-no-internal-prompt-leak`, `text_screens_scrollable`, `canvas_exists`, `renderer_initialized`, `scene_visible`, `audio_context_initialized`, `simulation_loop_running`, `map_surface_exists`, `speech_api_initialized`.
