# Contrats Creatia

Ce dossier regroupe les contrats documentaires de Creatia. Ils décrivent les exigences, les validations PASS/FAIL, des exemples d'échec, les sources API/protocole/design et la correspondance éventuelle avec `src/platform/ai/generationPipeline.js`.

Ces contrats ne sont pas tous automatisés aujourd'hui. Quand une validation est déjà couverte par le healthcheck existant, la correspondance est indiquée explicitement. Quand elle reste documentaire, elle doit guider les futures automatisations sans créer de protocole parallèle.

## Contrats

- [`html-app/`](html-app/) : sortie HTML autonome minimale.
- [`creatia-compatible-html/`](creatia-compatible-html/) : compatibilité iframe/host et projection runtime.
- [`co-create-app/`](co-create-app/) : application Co-Create callback-driven.
- [`runtime-generation/`](runtime-generation/) : réponse IA runtime `runtime_generation` et `runtimePayload`.
- [`import-export/`](import-export/) : portabilité projet et absence de fuite de responsabilités.
- [`diagnose/`](diagnose/) : diagnostic actionnable des écarts runtime.
- [`repair/`](repair/) : réparation ciblée en préservant le chemin validé.
