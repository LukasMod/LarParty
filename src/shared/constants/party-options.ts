export const themeCategories = [
  'fantasy',
  'sci-fi',
  'horror',
  'starwars',
  'harry-potter',
  'witcher',
] as const;

export const themeCategoryLabels: Record<(typeof themeCategories)[number], string> = {
  fantasy: 'Fantasy',
  'sci-fi': 'Sci-Fi',
  horror: 'Horror',
  starwars: 'StarWars',
  'harry-potter': 'Harry Potter',
  witcher: 'Witcher',
};

export const partyMoods = [
  'fun',
  'serious',
  'scary',
  'silly',
  'dramatic',
  'chaotic',
  'mysterious',
  'adventurous',
] as const;

export const partyMoodLabels: Record<(typeof partyMoods)[number], string> = {
  fun: 'Fun',
  serious: 'Serious',
  scary: 'Scary',
  silly: 'Silly',
  dramatic: 'Dramatic',
  chaotic: 'Chaotic',
  mysterious: 'Mysterious',
  adventurous: 'Adventurous',
};

export const cardTraits = [
  'calm',
  'aggressive',
  'funny',
  'mysterious',
  'loyal',
  'shy',
  'arrogant',
  'chaotic',
] as const;

export const cardTraitLabels: Record<(typeof cardTraits)[number], string> = {
  calm: 'Calm',
  aggressive: 'Aggressive',
  funny: 'Funny',
  mysterious: 'Mysterious',
  loyal: 'Loyal',
  shy: 'Shy',
  arrogant: 'Arrogant',
  chaotic: 'Chaotic',
};

export const sexOptions = ['male', 'female', 'other'] as const;

export const sexOptionLabels: Record<(typeof sexOptions)[number], string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

export const cardDisplayModes = ['collectible', 'info'] as const;
