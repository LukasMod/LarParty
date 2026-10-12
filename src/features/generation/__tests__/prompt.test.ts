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

// The instruction sentences themselves are prose the model reads, not a
// contract the code depends on, so only the parts with behavior are asserted:
// the seed values reach the prompt, and the language switch works.
describe('buildCharacterCardPrompt', () => {
  it('includes the seed values the model works from', () => {
    const prompt = build()

    expect(prompt).toContain('- Name: Vesper Nightbloom')
    expect(prompt).toContain('- Age: 34')
    expect(prompt).toContain('- Selected traits: Vengeful, Calm, Mysterious')
    expect(prompt).toContain('- Theme category: Horror')
    expect(prompt).toContain('- Mood: Dramatic')
  })

  it('tells the model which language to write in', () => {
    expect(build('en')).toContain(
      'Write all generated field values in English.',
    )
    expect(build('pl')).toContain('Write all generated field values in Polish.')
  })

  // Enum labels must localize with the output language, otherwise a Polish card
  // is seeded from English trait names.
  it('localizes the seed labels for Polish', () => {
    const prompt = build('pl')

    expect(prompt).toContain('- Mood: Dramatyczny')
    expect(prompt).toContain('- Sex: Kobieta')
    expect(prompt).toContain('- Selected traits: Mściwy, Spokojny, Tajemniczy')
  })

  // The form allows an empty trait list to reach here; an unguarded join would
  // send the literal "undefined" to the model.
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
