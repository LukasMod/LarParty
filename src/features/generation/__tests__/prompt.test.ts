import { buildCharacterCardPrompt } from '@/features/generation/prompt'
import { makeCardInput, makeParty } from '@test/factories'

const party = makeParty({ themeCategory: 'horror', mood: 'dramatic' })
const input = makeCardInput({
  name: 'Vesper Nightbloom',
  sex: 'female',
  age: 34,
  selectedTraits: ['vengeful', 'calm', 'mysterious'],
})

function build(outputLanguage: 'en' | 'pl' = 'en') {
  return buildCharacterCardPrompt({ party, input, outputLanguage })
}

describe('buildCharacterCardPrompt', () => {
  it('includes the character seed values', () => {
    const prompt = build()

    expect(prompt).toContain('- Name: Vesper Nightbloom')
    expect(prompt).toContain('- Age: 34')
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
    expect(build('en')).toContain(
      'Write all generated field values in English.',
    )
    expect(build('pl')).toContain('Write all generated field values in Polish.')
  })

  it('localizes the seed labels for Polish', () => {
    const prompt = build('pl')

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
      '- backgroundHistory must be exactly 2 short sentences.',
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
})
