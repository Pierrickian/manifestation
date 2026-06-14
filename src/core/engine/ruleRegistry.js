export const DEFAULT_RULE_ID = 'default'
export const RECONCILIATION_RULE_ID = 'emotional-reconciliation'
export const FLOW_RULE_ID = 'flow'
export const NARRATIA_RULE_ID = 'narratia'
export const MES_QUESTIONS_RULE_ID = 'mes-questions'

export const ruleRegistry = {
  [DEFAULT_RULE_ID]: {
    id: DEFAULT_RULE_ID,
    label: 'Mes Besoins',
    description: 'La regle actuelle: partir d un ressenti, lire les besoins, puis orienter les phases.',
    family: 'guided-journey',
    isEnabled: () => true
  },
  [RECONCILIATION_RULE_ID]: {
    id: RECONCILIATION_RULE_ID,
    label: 'Mes Emotions',
    description: 'Retrouver une vibration positive et relier la part qui la porte a celle qui signale le negatif.',
    family: 'reconciliation',
    isEnabled: () => true
  },
  [FLOW_RULE_ID]: {
    id: FLOW_RULE_ID,
    label: 'Flow',
    description: 'Naviguer dans des mots qui filent, choisir ceux qui appellent, puis laisser l IA orienter la suite.',
    family: 'flow',
    isEnabled: () => true
  },
  [NARRATIA_RULE_ID]: {
    id: NARRATIA_RULE_ID,
    label: 'Narratia',
    description: 'Partager une histoire guidée entre parent, enfant et deux compagnons narrateurs.',
    family: 'narratia',
    isEnabled: () => true
  },
  [MES_QUESTIONS_RULE_ID]: {
    id: MES_QUESTIONS_RULE_ID,
    label: 'Mes Questions',
    description: 'Créer un quiz éducatif joyeux, adapté à l’âge et généré par IA.',
    family: 'mes-questions',
    isEnabled: () => true
  }
}

export const defaultRuleSet = [
  DEFAULT_RULE_ID,
  RECONCILIATION_RULE_ID,
  FLOW_RULE_ID,
  NARRATIA_RULE_ID,
  MES_QUESTIONS_RULE_ID
]

export function getRule(ruleId) {
  return ruleRegistry[ruleId] || null
}

export function hasRule(ruleId) {
  return Boolean(getRule(ruleId))
}

export function isGuidedJourneyRule(ruleId) {
  return getRule(ruleId)?.family === 'guided-journey'
}

export function getRules(ruleIds = defaultRuleSet) {
  return ruleIds.map(getRule).filter(Boolean)
}

export function getEnabledRules(context, ruleIds = defaultRuleSet) {
  return getRules(ruleIds).filter((rule) => rule.isEnabled(context))
}
