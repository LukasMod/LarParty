export const themeCategories = [
  'fantasy',
  'sci-fi',
  'horror',
  'magic',
  'casual',
  'corporation',
] as const

export const themeCategoryLabels: Record<
  (typeof themeCategories)[number],
  string
> = {
  fantasy: 'Fantasy',
  'sci-fi': 'Sci-Fi',
  horror: 'Horror',
  magic: 'Magic',
  casual: 'Casual',
  corporation: 'Corporation',
}

export const partyMoods = [
  'fun',
  'serious',
  'scary',
  'silly',
  'dramatic',
  'chaotic',
  'mysterious',
  'adventurous',
  'epic',
  'playful',
  'dark',
  'tense',
  'whimsical',
  'romantic',
  'noble',
  'melancholic',
  'rebellious',
  'cozy',
] as const

export const partyMoodLabels: Record<(typeof partyMoods)[number], string> = {
  fun: 'Fun',
  serious: 'Serious',
  scary: 'Scary',
  silly: 'Silly',
  dramatic: 'Dramatic',
  chaotic: 'Chaotic',
  mysterious: 'Mysterious',
  adventurous: 'Adventurous',
  epic: 'Epic',
  playful: 'Playful',
  dark: 'Dark',
  tense: 'Tense',
  whimsical: 'Whimsical',
  romantic: 'Romantic',
  noble: 'Noble',
  melancholic: 'Melancholic',
  rebellious: 'Rebellious',
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
