export const themeCategories = ['fantasy', 'sci-fi', 'horror'] as const

export const partyThemeGlyphs: Record<
  (typeof themeCategories)[number],
  string
> = {
  fantasy: '⚔️',
  'sci-fi': '🪐',
  horror: '💀',
}

export const themeCategoryLabels: Record<
  (typeof themeCategories)[number],
  string
> = {
  fantasy: 'Fantasy',
  'sci-fi': 'Sci-Fi',
  horror: 'Horror',
}

export const partyMoods = [
  'fun',
  'serious',
  'dramatic',
  'mysterious',
  'adventurous',
  'epic',
  'dark',
  'romantic',
  'chaotic',
  'cozy',
] as const

export const partyMoodLabels: Record<(typeof partyMoods)[number], string> = {
  fun: 'Fun',
  serious: 'Serious',
  dramatic: 'Dramatic',
  mysterious: 'Mysterious',
  adventurous: 'Adventurous',
  epic: 'Epic',
  dark: 'Dark',
  romantic: 'Romantic',
  chaotic: 'Chaotic',
  cozy: 'Cozy',
}

// Six light and six dark traits. Each names its own axis, so any three combine
// without one cancelling another. Ordered in loose clusters: drive, warmth,
// mind, composure.
export const cardTraits = [
  'vengeful',
  'ambitious',
  'chaotic',
  'empathetic',
  'loyal',
  'funny',
  'intelligent',
  'manipulative',
  'charismatic',
  'calm',
  'mysterious',
  'arrogant',
] as const

export type CardTrait = (typeof cardTraits)[number]

export const cardTraitLabels: Record<CardTrait, string> = {
  vengeful: 'Vengeful',
  ambitious: 'Ambitious',
  chaotic: 'Chaotic',
  empathetic: 'Empathetic',
  loyal: 'Loyal',
  funny: 'Funny',
  intelligent: 'Intelligent',
  manipulative: 'Manipulative',
  charismatic: 'Charismatic',
  calm: 'Calm',
  mysterious: 'Mysterious',
  arrogant: 'Arrogant',
}

// Trait values on cards saved before the current set existed. They are never
// selectable, only readable, so a stored card still gets a localized label when
// it is viewed or regenerated.
export const legacyCardTraits = ['aggressive', 'shy'] as const

export type LegacyCardTrait = (typeof legacyCardTraits)[number]
export type StoredCardTrait = CardTrait | LegacyCardTrait

export const sexOptions = ['male', 'female', 'other'] as const

export const sexOptionLabels: Record<(typeof sexOptions)[number], string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
}

export const cardDisplayModes = ['collectible', 'info'] as const
