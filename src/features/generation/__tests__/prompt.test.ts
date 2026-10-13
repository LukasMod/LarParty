import { buildCharacterCardPrompt } from '@/features/generation/prompt'
import { makeCardInput, makeParty } from '@test/factories'

const party = makeParty({ themeCategory: 'horror', mood: 'dramatic' })
const input = makeCardInput({
  name: 'Vesper Nightbloom',
  sex: 'female',
  selectedTraits: ['vengeful', 'calm', 'mysterious'],
})

function build(
  extra: Partial<Parameters<typeof buildCharacterCardPrompt>[0]> = {},
) {
  return buildCharacterCardPrompt({
    party,
    input,
    outputLanguage: 'en',
    ...extra,
  })
}

describe('buildCharacterCardPrompt', () => {
  it('includes the character seed values', () => {
    const prompt = build()

    expect(prompt).toContain('- Name: Vesper Nightbloom')
    expect(prompt).toContain('- Sex: Female')
    expect(prompt).not.toContain('- Age:')
  })

  it('lists the selected traits comma separated', () => {
    expect(build()).toContain('- Selected traits: Vengeful, Calm, Mysterious')
  })

  it('includes the localized theme and mood', () => {
    const prompt = build()

    expect(prompt).toContain('- Theme category: Horror')
    expect(prompt).toContain('- Mood: Dramatic')
  })

  it('instructs the model in the requested output language', () => {
    expect(build({ outputLanguage: 'en' })).toContain(
      'Write all generated field values in English.',
    )
    expect(build({ outputLanguage: 'pl' })).toContain(
      'Write all generated field values in Polish.',
    )
  })

  it('localizes the seed labels for Polish', () => {
    const prompt = build({ outputLanguage: 'pl' })

    expect(prompt).toContain('- Mood: Dramatyczny')
    expect(prompt).toContain('- Sex: Kobieta')
    expect(prompt).toContain('- Selected traits: Mściwy, Spokojny, Tajemniczy')
  })

  it('keeps the schema-stability instruction', () => {
    expect(build()).toContain(
      'Keep the JSON schema keys exactly as requested and localize only the string values.',
    )
  })

  it('requires JSON-only output', () => {
    expect(build()).toContain(
      'Return only valid JSON matching the requested schema.',
    )
  })

  it('states the exact field rules the schema enforces', () => {
    const prompt = build()

    expect(prompt).toContain(
      '- backgroundHistory must be exactly 3 short sentences.',
    )
    expect(prompt).toContain(
      '- characterTraits must contain exactly 3 short trait phrases.',
    )
  })

  it('asks for safe-for-work content', () => {
    expect(build()).toContain(
      '- Avoid explicit, hateful, or inappropriate content.',
    )
  })

  it('joins every line with newlines and no trailing newline', () => {
    const prompt = build()

    expect(prompt).not.toContain('\r')
    expect(prompt.endsWith('\n')).toBe(false)
    expect(prompt.split('\n').length).toBeGreaterThan(10)
  })

  it('renders an empty trait list as an empty string, not undefined', () => {
    const prompt = buildCharacterCardPrompt({
      party,
      input: makeCardInput({ selectedTraits: [] }),
      outputLanguage: 'en',
    })

    expect(prompt).toContain('- Selected traits: ')
    expect(prompt).not.toContain('undefined')
  })

  it('keeps the plain trait list while every value is the default', () => {
    expect(build()).not.toContain('intensity value')
    expect(build()).not.toContain('Intensity scale')
  })

  it('lists values and the scale once any value leaves the default', () => {
    const prompt = buildCharacterCardPrompt({
      party,
      input,
      outputLanguage: 'en',
      seedTraits: [
        { trait: 'vengeful', traitValue: -3 },
        { trait: 'calm', traitValue: 0 },
        { trait: 'mysterious', traitValue: 3 },
      ],
    })

    expect(prompt).toContain('- Selected traits, each with an intensity value:')
    expect(prompt).toContain('- Vengeful (value -3)')
    expect(prompt).toContain('- Calm (value 0)')
    expect(prompt).toContain('- Mysterious (value +3)')
    expect(prompt).toContain('Intensity scale')
    expect(prompt).toContain('0 is the default')
  })

  it('ties the loudest trait to the name and movement rules', () => {
    const prompt = buildCharacterCardPrompt({
      party,
      input,
      outputLanguage: 'en',
      seedTraits: [
        { trait: 'vengeful', traitValue: 1 },
        { trait: 'calm', traitValue: -3 },
        { trait: 'mysterious', traitValue: 2 },
      ],
    })

    expect(prompt).toContain('the loudest trait (Calm)')
    expect(prompt).toContain(
      'characterTraits must contain exactly 3 short trait phrases, one per selected trait in the seed order',
    )
  })

  it('localizes trait values in the seed lines for Polish', () => {
    const prompt = buildCharacterCardPrompt({
      party,
      input: makeCardInput({ selectedTraits: ['vengeful', 'calm'] }),
      outputLanguage: 'pl',
      seedTraits: [
        { trait: 'vengeful', traitValue: -3 },
        { trait: 'calm', traitValue: 2 },
      ],
    })

    expect(prompt).toContain('- Mściwy (value -3)')
    expect(prompt).toContain('- Spokojny (value +2)')
  })

  it('omits the divergence block on the first variant', () => {
    expect(build({ attempt: 1 })).not.toContain('Divergence:')
    expect(build()).not.toContain('Divergence:')
  })

  it('asks later variants to diverge while holding the values', () => {
    const prompt = build({ attempt: 3 })

    expect(prompt).toContain('Divergence:')
    expect(prompt).toContain('This is variant 3 for this exact seed')
    expect(prompt).toContain('Keep every trait and intensity value')
  })

  it('omits the sibling block when the party has no other cards', () => {
    expect(build({ siblings: [] })).not.toContain('already at this party')
  })

  it('lists sibling summaries with traits, phrase, and movement', () => {
    const prompt = build({
      siblings: [
        {
          nameWithClass: 'Bram the Unbothered',
          traits: [
            { trait: 'loyal', traitValue: -2 },
            { trait: 'funny', traitValue: 3 },
          ],
          specialPhrase: 'I already packed.',
          specialMovement: 'A long sigh and a wave',
        },
      ],
    })

    expect(prompt).toContain('Other characters already at this party')
    expect(prompt).toContain(
      '- Bram the Unbothered | traits: Loyal -2, Funny +3',
    )
    expect(prompt).toContain('phrase: "I already packed."')
    expect(prompt).toContain('movement: "A long sigh and a wave"')
  })

  it('drops the value from a sibling trait at the default', () => {
    const prompt = build({
      siblings: [
        {
          nameWithClass: 'Bram the Unbothered',
          traits: [
            { trait: 'loyal', traitValue: 0 },
            { trait: 'funny', traitValue: -1 },
          ],
          specialPhrase: 'I already packed.',
          specialMovement: 'A long sigh and a wave',
        },
      ],
    })

    expect(prompt).toContain('- Bram the Unbothered | traits: Loyal, Funny -1')
    expect(prompt).not.toContain('Loyal 0')
  })

  it('caps the sibling list', () => {
    const siblings = Array.from({ length: 20 }, (_unused, index) => ({
      nameWithClass: `Guest ${index}`,
      traits: [{ trait: 'loyal' as const, traitValue: 1 }],
      specialPhrase: `Line ${index}`,
      specialMovement: `Move ${index}`,
    }))

    const prompt = build({ siblings })

    expect(prompt).toContain('Guest 14')
    expect(prompt).not.toContain('Guest 15')
  })

  it('includes the uniqueness guardrails', () => {
    const prompt = build()

    expect(prompt).toContain('Uniqueness:')
    expect(prompt).toContain('Do not write that archetype')
    expect(prompt).toContain('the chosen one, the fallen noble')
    expect(prompt).toContain('Never restate the trait word')
  })

  describe('party world', () => {
    const world = 'The gate opens once a season.'

    it('asks the first card to found the world and emit partyHistory', () => {
      const prompt = build()

      expect(prompt).toContain('Shared world (first guest, you establish it):')
      expect(prompt).toContain(
        'partyHistory must be exactly 2-3 short sentences',
      )
    })

    it('omits the partyHistory field rule once a world exists', () => {
      expect(build({ partyHistory: world })).not.toContain(
        'partyHistory must be',
      )
    })

    it('reuses the stored world verbatim and forbids changing it', () => {
      const prompt = build({ partyHistory: world })

      expect(prompt).toContain(
        'Shared world (already founded, do not change it):',
      )
      expect(prompt).toContain(`- ${world}`)
      expect(prompt).not.toContain('you establish it')
    })

    it('treats a blank stored world as none', () => {
      const prompt = build({ partyHistory: '   ' })

      expect(prompt).toContain('Shared world (first guest, you establish it):')
    })

    it('keeps the world instruction under the output language rule', () => {
      expect(build({ outputLanguage: 'pl' })).toContain(
        'Write all generated field values in Polish.',
      )
    })
  })
})
