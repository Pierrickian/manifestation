# Domain skills inventory

This inventory prevents confusion between shipped application features, business/domain areas, extracted domain skills, and future skill ideas.

## Existing features

These are implemented or documented product features. They may contain domain knowledge, but they are not automatically reusable domain skills.

| Feature | Current classification | Notes |
| --- | --- | --- |
| `ManifestationWizard` | Existing application feature and domain candidate | The main reflective exploration flow. It can inspire a future self-reflection or guided-discovery domain skill, but no standalone reusable skill has been extracted from it yet. |
| `Narratia` | Existing feature and domain candidate | A child-facing cozy story experience. It is a candidate for a future storyteller domain skill, not a skill already available. |
| `Enigmia` | Existing feature and domain candidate | A logical riddle game. It is a candidate for a future puzzle/dungeon/game-master domain skill, not a skill already available. |
| `Mes Questions` | Existing feature and domain candidate | A generated quiz/question experience. It is a candidate for a future interview, questionnaire, or teaching skill, not a skill already available. |

## Existing business/domain areas

These are domain areas currently visible in the repository through product behavior, prompts, or documentation.

| Domain area | Related feature/domain candidate | Extraction status |
| --- | --- | --- |
| Guided inner exploration and needs reflection | `ManifestationWizard` | Candidate only. |
| Cozy child-facing storytelling | `Narratia` | Candidate only. |
| Logic riddles and constrained puzzle generation | `Enigmia` | Candidate only. |
| Personalized question flows and quizzes | `Mes Questions` | Candidate only. |

## Skills actually extracted

No reusable domain skill is currently extracted and available from `domain-skills/`.

The files in `domain-skills/candidates/` are draft candidates only. They do not define active prompt behavior, runtime behavior, bridge contracts, or reusable skill selection logic.

## Hypothetical future skills

These are possible future extractions. They require validation, examples, scope decisions, and integration work before they can be treated as available skills.

| Hypothetical skill | Candidate source(s) | Possible purpose |
| --- | --- | --- |
| `storyteller` | `Narratia`, `candidates/storyteller.md` | Generate warm, age-aware story worlds, choices, scenes, and endings. |
| `dungeon-master` | `Enigmia`, `Narratia`, `candidates/dungeon-master.md` | Run interactive quests, rules-light adventures, riddles, and choice consequences. |
| `math-teacher` | `Mes Questions`, `candidates/math-teacher.md` | Produce progressive math explanations, practice questions, and feedback. |
| `interview-coach` | `Mes Questions`, `ManifestationWizard`, `candidates/interview-coach.md` | Guide reflective or professional interview preparation with adaptive questions and feedback. |

## Classification rule

`Narratia`, `Enigmia`, `Mes Questions`, and `ManifestationWizard` must be classified as existing features and domain candidates. They must not be listed as skills already available until a future change extracts, validates, documents, and wires a reusable domain skill.
