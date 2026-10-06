export const themeCategories = ['fantasy', 'sci-fi', 'horror'] as const

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

export const cardTraits = [
  'calm',
  'aggressive',
  'funny',
  'mysterious',
  'loyal',
  'shy',
  'arrogant',
  'chaotic',
] as const

export const cardTraitLabels: Record<(typeof cardTraits)[number], string> = {
  calm: 'Calm',
  aggressive: 'Aggressive',
  funny: 'Funny',
  mysterious: 'Mysterious',
  loyal: 'Loyal',
  shy: 'Shy',
  arrogant: 'Arrogant',
  chaotic: 'Chaotic',
}

export const sexOptions = ['male', 'female', 'other'] as const

export const sexOptionLabels: Record<(typeof sexOptions)[number], string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
}

export const cardDisplayModes = ['collectible', 'info'] as const
