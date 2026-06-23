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

## Position dans le flux

La position conceptuelle est **avant `Prompt Assembly`**.

```txt
User request
  → Capability Discovery
  → Prompt Assembly
  → AI generation / runtime generation
  → Normalization and host consumption
```

Cette position permettrait à `Prompt Assembly` de recevoir une description structurée de ce qui est nécessaire, sans déplacer la responsabilité de génération vers la découverte.

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
  "requiredDomainSkills": ["adaptive_questions"],
  "requiredNeeds": ["standalone_app", "mobile_scroll"],
  "constraints": ["no_fake_bridge", "no_full_rebuild_when_runtimePayload_is_sufficient"]
}
```

### Champs

- `mode` : classe le type de flux attendu, par exemple création simple, co-création, génération runtime ou besoin de clarification.
- `requiredCapabilities` : liste les capacités système Creatia nécessaires, issues de `system-capabilities/`.
- `requiredDomainSkills` : liste optionnelle de compétences métier issues de `domain-skills/`; ces compétences ne définissent jamais l'API runtime.
- `requiredNeeds` : exprime les besoins produit ou interactionnels requis par la demande.
- `constraints` : capture les limites non négociables à transmettre à `Prompt Assembly`.

L'objet doit rester descriptif. Il ne doit pas contenir de contenu final pré-généré, de prompt complet, de code applicatif, ni de payload runtime prêt à appliquer.

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
