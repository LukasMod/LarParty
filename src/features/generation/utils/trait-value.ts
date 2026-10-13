export const TRAIT_VALUE_MIN = -3
export const TRAIT_VALUE_MAX = 3
export const DEFAULT_TRAIT_VALUE = 0

export function clampTraitValue(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_TRAIT_VALUE
  }

  const rounded = Math.round(value)

  if (rounded < TRAIT_VALUE_MIN) {
    return TRAIT_VALUE_MIN
  }

  if (rounded > TRAIT_VALUE_MAX) {
    return TRAIT_VALUE_MAX
  }

  return rounded
}

export function hasNonDefaultTraitValue(values: readonly number[]) {
  return values.some((value) => clampTraitValue(value) !== DEFAULT_TRAIT_VALUE)
}

export function getLoudestTraitIndex(values: readonly number[]) {
  let loudestIndex = -1
  let loudestMagnitude = 0

  values.forEach((value, index) => {
    const magnitude = Math.abs(clampTraitValue(value))

    if (magnitude > loudestMagnitude) {
      loudestIndex = index
      loudestMagnitude = magnitude
    }
  })

  return loudestIndex
}

export function formatTraitValue(value: number) {
  const clamped = clampTraitValue(value)

  return clamped > 0 ? `+${clamped}` : `${clamped}`
}

export function describeTraitValue(value: number) {
  switch (clampTraitValue(value)) {
    case 3:
      return 'pushed to a too-much, unmissable extreme'
    case 2:
      return 'strongly present, a habit other guests notice at once'
    case 1:
      return 'noticeably present'
    case -1:
      return 'noticeably lacking'
    case -2:
      return 'clearly missing, and worked around'
    case -3:
      return 'the exact opposite of the trait, held as a principle'
    default:
      return 'plain and unexaggerated, exactly as the trait name reads'
  }
}

export const traitValueScaleLines = [
  'Intensity scale. Each trait carries an integer from -3 to 3. The trait names the axis and',
  'the value names the position on it.',
  '- 0 is the default: the trait exactly as its name reads, in plain measure, with no',
  'exaggeration and no twist. Funny at 0 is simply a funny character, not a comedian and not',
  'a killjoy.',
  '- 1 and 2 make the trait noticeably, then strongly present.',
  '- 3 pushes the trait past reasonable. It dominates the character, is slightly out of',
  'control, and is the funniest or most troublesome thing about them. Play 3 as excess, never',
  'as a superpower or a threat.',
  '- -1 and -2 mean the trait is lacking, then clearly missing. The character notices the gap',
  'and works around it.',
  '- -3 inverts the trait: the character behaves in the exact opposite way and treats it as a',
  'principle. Loyal at -3 never commits to anyone or anything. Calm at -3 is a walking panic.',
  '- A value changes only the strength and direction of its own trait. Never let a negative',
  'value change the mood, the genre, or another trait.',
  '- A negative value is a comedy hook or an endearing flaw, never depression, cruelty, grief,',
  'or trauma. A humourless character is still fun to play at a party.',
  '- The traits are allowed to disagree. Do not blend them into one smooth personality. Let',
  'the loudest value win the scene and let the other traits react to it.',
  '- Never print a number, the word "intensity", or a rating in any generated value.',
]
