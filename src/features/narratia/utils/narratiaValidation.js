export function createSlug(value, fallback = 'item') {
  const slug = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return slug || fallback
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

export function clampText(value, fallback, maxLength = 1200) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  return (text || fallback).slice(0, maxLength)
}

export function uniqueById(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export function validateChildChoices(payload) {
  const rawChoices = ensureArray(payload?.childChoices)
  const childChoices = uniqueById(rawChoices.map((choice, index) => ({
    id: createSlug(choice?.id || choice?.label, `choice_${index + 1}`),
    label: clampText(choice?.label, `Merveille ${index + 1}`, 64),
    category: ['object', 'creature', 'place', 'magic', 'atmosphere'].includes(choice?.category) ? choice.category : 'magic'
  }))).slice(0, 12)

  return childChoices.length >= 6 ? { childChoices } : null
}

export function validateStoryPackage(payload, context = {}) {
  const narrators = ensureArray(payload?.narrators).map((narrator) => ({
    id: ['virtual_child_a', 'virtual_child_b', 'player_child', 'parent'].includes(narrator?.id) ? narrator.id : 'parent',
    displayName: clampText(narrator?.displayName, 'Ami de l’histoire', 40),
    personality: clampText(narrator?.personality, 'Doux et curieux.', 120),
    voiceHint: clampText(narrator?.voiceHint, 'soft', 40)
  }))

  const narratorMap = new Map(narrators.map((narrator) => [narrator.id, narrator.displayName]))
  const milestones = ensureArray(payload?.milestones).map((milestone, index) => ({
    id: Number(milestone?.id || index + 1),
    title: clampText(milestone?.title, `Milestone ${index + 1}`, 80),
    text: clampText(milestone?.text, 'Un moment promis attend ici.', 220),
    visualHint: clampText(milestone?.visualHint, 'Une scène illustrée douce', 100)
  })).slice(0, 5)

  const segments = ensureArray(payload?.segments).map((segment, index) => {
    const narrator = ['virtual_child_a', 'virtual_child_b', 'player_child', 'parent'].includes(segment?.narrator) ? segment.narrator : (index % 2 ? 'virtual_child_b' : 'virtual_child_a')
    return {
      id: createSlug(segment?.id || `segment_${index + 1}`, `segment_${index + 1}`),
      from: Number(segment?.from || index + 1),
      to: Number(segment?.to || index + 2),
      narrator,
      narratorDisplayName: clampText(segment?.narratorDisplayName, narratorMap.get(narrator) || 'Ami de l’histoire', 40),
      text: clampText(segment?.text, 'Le chemin entre deux moments promis s’ouvre avec douceur.', 1400),
      mood: clampText(segment?.mood, 'wonder', 40)
    }
  })

  const endings = ensureArray(payload?.endings).map((ending, index) => ({
    id: createSlug(ending?.id || ending?.title, `ending_${index + 1}`),
    title: clampText(ending?.title, `Ending ${index + 1}`, 64),
    emotion: clampText(ending?.emotion, 'happy', 40),
    text: clampText(ending?.text, 'L’histoire se termine doucement et garde une pensée chaude pour la nuit.', 1600),
    visualHint: clampText(ending?.visualHint, 'Une illustration finale calme', 100)
  })).slice(0, 3)

  if (milestones.length < 3 || milestones.length > 5 || segments.length < milestones.length - 1 || endings.length !== 3) return null

  return {
    id: createSlug(payload?.id || `narratia_${Date.now()}`, `narratia_${Date.now()}`),
    title: clampText(payload?.title, 'La nuit des trois merveilles', 90),
    narrators: narrators.length ? narrators : context.defaultNarrators,
    milestones,
    segments: segments.slice(0, Math.max(1, milestones.length - 1)),
    endings,
    metadata: {
      duration: context.parentConfiguration?.duration || 'short',
      readingMode: context.parentConfiguration?.readingMode || 'mixed_narration',
      ageRange: context.parentConfiguration?.ageRange || '6-8',
      createdAt: payload?.metadata?.createdAt || new Date().toISOString()
    }
  }
}
