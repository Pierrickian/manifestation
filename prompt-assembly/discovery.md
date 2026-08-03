# Capability Discovery — note prospective

## Statut

`Capability Discovery` est une direction prospective de conception. Cette note décrit le rôle possible d'une étape de découverte des capacités, mais ne crée pas de pipeline d'exécution, ne modifie aucun prompt runtime et ne valide aucune implémentation immédiate. Le contrat runtime normatif reste `runtime-api/creatia-runtime/v1/`.

Décision actuelle : **ne pas l'implémenter immédiatement**. La priorité reste de préserver le chemin validé existant défini par `runtime-api/creatia-runtime/v1/`, notamment le rappel runtime et l'application de `runtimePayload`.

## Rôle exact

`Capability Discovery` serait une étape de **classification et d'analyse**, pas une étape de génération.

Elle ne doit pas :

- écrire du HTML ;
- produire une application ;
- générer un `runtimePayload` ;
- simuler une réponse de l'IA runtime ;
- prendre en charge la persistance, les diagnostics ou l'orchestration host.

Elle doit seulement analyser l'intention utilisateur et la demande produit afin de préparer le bon contrat de prompt pour l'étape suivante.

## Position dans le flux prospectif

La position conceptuelle est **en amont des résolutions et avant `Prompt Assembly`**. Elle intervient une fois la demande utilisateur reçue, mais avant de choisir des éléments concrets dans `system-capabilities/` ou `domain-skills/`.

```txt
User request
  → Capability Discovery
  → Capability Resolution
  → Skill Resolution
  → Prompt Assembly
  → AI generation / runtime generation
  → Normalization and host consumption
```

Cette position permettrait de séparer quatre questions : ce que la demande exige (`Discovery`), quelles capacités système y répondent (`Capability Resolution`), quelles compétences métier optionnelles sont pertinentes (`Skill Resolution`) et comment leurs instructions sont composées (`Prompt Assembly`). Elle n'ajoute aujourd'hui aucune étape au pipeline réel : le schéma décrit seulement une frontière possible pour une évolution ultérieure.

## Couches de capacités

La découverte prospective ne doit plus supposer une modélisation unique `skills/`. Elle doit distinguer deux couches :

- `system-capabilities/` : capacités structurelles Creatia, capables de porter des contrats, fragments de compatibilité, API runtime, diagnostics, réparations et fragments de prompt.
- `domain-skills/` : compétences métier optionnelles, limitées au vocabulaire, au ton, aux exemples, aux contraintes produit et aux besoins d'interaction du domaine.

Un `domain skill` ne définit jamais l'API runtime Creatia. Il peut seulement déclarer qu'il a besoin d'une capacité système existante.

### Classement canonique

- `CreatiaCompatibleApp` : contrat + fragment de compatibilité.
- `CreatiaRuntimeGenerator` : capacité runtime + contrat de sortie.
- `CreatiaDiagnoser` : capacité système de diagnostic.
- `CreatiaRepairer` : capacité système de réparation.
- `CreatiaCoCreate` : combinaison API runtime + contrat Co-Create + fragments de prompt.

## Output conceptuel

L'output attendu serait un objet conceptuel minimal :

```json
{
  "mode": "create | coCreate | runtime | clarification",
  "requiredCapabilities": ["CreatiaCompatibleApp", "CreatiaCoCreate"],
  "requiredNeeds": ["adaptive_questions", "standalone_app", "mobile_scroll"],
  "constraints": ["no_fake_bridge", "no_full_rebuild_when_runtimePayload_is_sufficient"]
}
```

### Champs

- `mode` : classe le type de flux attendu, par exemple création simple, co-création, génération runtime ou besoin de clarification.
- `requiredCapabilities` : liste les capacités système Creatia nécessaires, issues de `system-capabilities/`.
- `requiredNeeds` : exprime les besoins produit, métier ou interactionnels requis par la demande, sans choisir prématurément le composant qui les satisfera.
- `constraints` : capture les limites non négociables à transmettre à `Prompt Assembly`.

L'objet doit rester descriptif. Il ne doit pas contenir de contenu final pré-généré, de prompt complet, de code applicatif, ni de payload runtime prêt à appliquer.

## Pourquoi retourner des `requiredNeeds`

Une intention utilisateur ne correspond pas toujours directement au nom d'une capacité ou d'une skill disponible. `requiredNeeds` conserve donc le **pourquoi fonctionnel** entre la demande brute et les inventaires du dépôt. Par exemple, `adaptive_questions` décrit un besoin d'expérience ; il ne présume ni qu'une skill de même nom existe, ni qu'elle peut définir le mécanisme runtime nécessaire.

Ce champ permettrait notamment :

- de ne pas confondre une exigence produit avec son mécanisme d'implémentation ;
- de conserver un besoin qui n'a encore aucune résolution connue et de demander une clarification plutôt que d'inventer une capacité ;
- de justifier et diagnostiquer les choix faits ensuite par les étapes de résolution ;
- de laisser plusieurs capacités système ou skills métier contribuer à un même besoin, sans coupler la découverte à la structure actuelle des répertoires.

`requiredCapabilities` reste utile pour les obligations structurelles déjà certaines, par exemple la compatibilité Creatia. `requiredNeeds` couvre ce qui doit encore être mis en correspondance ou vérifié.

## Alimentation des résolutions ultérieures

Dans ce modèle prospectif, les deux résolutions consommeraient la classification sans l'altérer :

1. **Capability Resolution** confronterait `mode`, `requiredCapabilities`, `requiredNeeds` et `constraints` à l'inventaire de `system-capabilities/`. Elle sélectionnerait les capacités structurelles capables de satisfaire les obligations runtime, de compatibilité, de diagnostic ou de réparation. Elle ne générerait pas l'application.
2. **Skill Resolution** examinerait les besoins métier encore pertinents et l'inventaire de `domain-skills/`. Elle sélectionnerait éventuellement du vocabulaire, un ton, des exemples ou des contraintes métier. Elle ne pourrait ni remplacer une capacité système requise, ni définir une API runtime.
3. **Prompt Assembly** composerait ensuite les sources résolues avec les instructions de base et la demande utilisateur. Les contraintes issues de la découverte resteraient traçables afin que l'assemblage ne les perde pas.

Les formes de sortie de `Capability Resolution` et de `Skill Resolution` ne sont pas définies ici : les figer reviendrait à spécifier une implémentation automatique que cette note exclut explicitement.

## Pourquoi la découverte ne génère pas d'application

La découverte ne dispose que d'une lecture classifiée de l'intention. Elle n'a pas encore résolu les contrats, les fragments et les éventuelles skills à assembler ; elle ne peut donc pas produire une application conforme sans court-circuiter les responsabilités suivantes.

Lui permettre de générer du HTML, un prompt final ou un `runtimePayload` mélangerait analyse et exécution, rendrait les choix de capacités moins auditables et créerait un second chemin de génération concurrent du chemin validé. La génération reste la responsabilité de l'IA après assemblage, tandis que Creatia conserve l'orchestration et la consommation runtime.

## Pourquoi l'assemblage peut rester manuel ou heuristique

Cette séparation conceptuelle n'impose pas un moteur de résolution. À l'état actuel, un assemblage manuel ou fondé sur quelques heuristiques explicites reste acceptable parce qu'il :

- préserve le prompt et le chemin `runtimePayload` déjà validés ;
- garde les choix de fragments lisibles et révisables tant que les inventaires sont maîtrisables ;
- évite d'ajouter un appel IA, de la latence et un nouveau format de sortie à diagnostiquer ;
- permet d'accumuler des cas et des validations avant de stabiliser un contrat automatique.

Une heuristique actuelle peut donc faire implicitement une partie de la découverte et des résolutions, à condition de respecter la séparation entre capacités système et skills métier. La présente note donne un vocabulaire pour raisonner sur ces choix ; elle ne rend ni les quatre étapes exécutables, ni leur automatisation obligatoire.

## Options d'approche

### 1. Heuristiques

Approche basée sur des règles déterministes : mots-clés, types de déclencheurs, présence d'une demande adaptive, mention de co-création ou besoin d'application standalone.

**Avantages**

- Prévisible et facilement testable.
- Peu coûteux.
- Simple à auditer dans des tests PASS/FAIL.

**Limites**

- Sensible aux formulations ambiguës.
- Peut manquer les intentions implicites.
- Risque d'accumuler des règles difficiles à maintenir.

### 2. IA légère

Approche basée sur un petit appel IA de classification avant l'assemblage du prompt.

**Avantages**

- Meilleure compréhension des demandes ambiguës.
- Peut produire directement une structure proche de l'output conceptuel.
- Plus adaptable aux formulations naturelles.

**Limites**

- Ajoute latence, coût et surface d'erreur.
- Nécessite un contrat strict de sortie.
- Ne doit pas devenir une génération cachée avant `Prompt Assembly`.

### 3. Hybride

Approche combinant heuristiques conservatrices et IA légère seulement lorsque les règles ne suffisent pas.

**Avantages**

- Garde un chemin rapide et déterministe pour les cas simples.
- Réserve l'IA aux ambiguïtés réelles.
- Peut produire des diagnostics plus lisibles : décision heuristique, escalade IA, ou clarification.

**Limites**

- Plus complexe à concevoir.
- Demande une frontière claire entre règle, classification IA et assemblage du prompt.
- Nécessite des tests couvrant les deux chemins.

## Validations PASS/FAIL envisagées

Ces validations décrivent ce qu'il faudrait vérifier si une implémentation est proposée plus tard.

### PASS

- PASS si une demande de création simple est classée en `mode: "create"` sans activer de capacités runtime inutiles.
- PASS si une demande adaptive, questionnaire, coach, histoire progressive ou expérience évolutive est classée en mode compatible co-création/runtime selon le contexte.
- PASS si l'output contient uniquement `mode`, `requiredCapabilities`, `requiredNeeds` et `constraints`, ou une extension explicitement documentée.
- PASS si la découverte reste avant `Prompt Assembly` et ne produit pas de prompt final.
- PASS si les contraintes critiques comme `no_fake_bridge` ou `no_full_rebuild_when_runtimePayload_is_sufficient` sont transmises sans altérer le chemin validé.
- PASS si les cas ambigus peuvent conduire à une clarification plutôt qu'à une génération spéculative.

### FAIL

- FAIL si `Capability Discovery` génère du HTML, du contenu applicatif final ou un `runtimePayload`.
- FAIL si elle remplace `Prompt Assembly` au lieu de l'informer.
- FAIL si elle introduit un nouveau pipeline runtime sans preuve de fiabilité équivalente au chemin `runtimePayload` validé.
- FAIL si elle masque les responsabilités entre Creatia, application générée et IA.
- FAIL si elle active la co-création ou le runtime AI sans besoin utilisateur ou contrat explicite.
- FAIL si elle ajoute une dépendance IA obligatoire pour tous les prompts sans stratégie de fallback ou de test.

## Décision actuelle

Ne pas implémenter `Capability Discovery` maintenant.

Raison : la documentation clarifie une frontière future utile, mais l'introduction d'une étape active modifierait le contrat de prompt et le flux d'orchestration. Cette modification doit attendre une proposition démontrable avec tests, diagnostics et préservation du contrat runtime v1 documenté dans `runtime-api/creatia-runtime/v1/`.

Pour le moment, cette note sert uniquement de référence d'architecture prospective pour guider une éventuelle évolution future.
