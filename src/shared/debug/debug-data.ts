import {
  CardStatus,
  CharacterCard,
  CharacterCardGenerated,
  CharacterCardInput,
  InputTrait,
  SexOption,
} from '@/features/cards/types'
import { Party, ThemeCategory } from '@/features/parties/types'
import {
  cardTraits,
  partyMoods,
  sexOptions,
  themeCategories,
} from '@/shared/constants/party-options'
import { createId } from '@/shared/utils/create-id'

export interface DebugDataset {
  parties: Party[]
  cards: CharacterCard[]
}

export const DEBUG_SMALL_PARTY_COUNT = themeCategories.length
export const DEBUG_SMALL_CARDS_PER_PARTY = 1
export const DEBUG_LARGE_PARTY_COUNT = 10
export const DEBUG_LARGE_CARDS_PER_PARTY = 10

// Theme-aware title/class/phrase pools so a fake card under a `fantasy` party
// reads like fantasy and one under `horror` like horror. Theme-independent
// fields (sex, age, traits, body copy) come from the shared pools below.
const partyTitlesByTheme: Record<ThemeCategory, string[]> = {
  fantasy: [
    'Emberkeep',
    'Thornhollow',
    'Mistmoor Vale',
    'Gilded Stag',
    'Ravenmoor',
    'Duskmere',
    'Highroost',
    'Verdant Spire',
    'Ashfall Hold',
    'Silverfen',
  ],
  'sci-fi': [
    'Kepler Drift',
    'Nova Reach',
    'Ionis Station',
    'Halcyon Nine',
    'Vega Corridor',
    'Cryo Bay 7',
    'Solarwake',
    'Aether Reactor',
    'Pale Orbit',
    'Dustline Colony',
  ],
  horror: [
    'Hollow Creek',
    'Gallowmere',
    'The Waning House',
    'Blackpine Sanatorium',
    'Pale Lantern',
    'Rothollow Chapel',
    'The Salt Cellar',
    'Marrow Lane',
    'Whispering Pines',
    'Gravenmoor',
  ],
}

const firstNames: Record<SexOption, string[]> = {
  male: [
    'Aldric',
    'Bram',
    'Cassian',
    'Dorian',
    'Ezra',
    'Fenwick',
    'Gideon',
    'Hollis',
    'Idris',
    'Jorick',
    'Kael',
    'Lysander',
  ],
  female: [
    'Marisol',
    'Nadia',
    'Ottoline',
    'Petra',
    'Rhiannon',
    'Siora',
    'Thessaly',
    'Una',
    'Vesper',
    'Wren',
    'Xanthe',
    'Ysolde',
  ],
  other: ['Ash', 'Bex', 'Corin', 'Dune', 'Evan', 'Fable', 'Gray', 'Haven'],
}

const surnames = [
  'Nightbloom',
  'Ashford',
  'Thornwood',
  'Ravenscar',
  'Stormvale',
  'Emberlyn',
  'Duskmantle',
  'Frostholm',
  'Hollowmere',
  'Blackwood',
  'Silverhand',
  'Wolfcrag',
]

const classesByTheme: Record<ThemeCategory, string[]> = {
  fantasy: [
    'Warden of the Vale',
    'Blade of the Ninth Moon',
    'Hedge Knight',
    'Verdant Druid',
    'Runescribe',
    'Oathbreaker',
    'Beastcaller',
    'Lantern Keeper',
  ],
  'sci-fi': [
    'Void Navigator',
    'Salvage Engineer',
    'Signal Hacker',
    'Cryo Warden',
    'Drift Courier',
    'Reactor Tech',
    'Xeno Analyst',
    'Hull Mechanic',
  ],
  horror: [
    'Grave Warden',
    'Exsanguist',
    'Sin Eater',
    'Moth Keeper',
    'The Quiet Guest',
    'Lanbearer',
    'Corpse Candle',
    'Confessor',
  ],
}

const specialsByTheme: Record<
  ThemeCategory,
  { movement: string; phrase: string }[]
> = {
  fantasy: [
    { movement: 'Silent Pounce', phrase: 'The old blood remembers.' },
    {
      movement: 'Three-Circle Ward',
      phrase: 'Stand behind me, or do not stand at all.',
    },
    {
      movement: 'Slow Bow',
      phrase: 'I keep my oaths longer than most keep their grudges.',
    },
    { movement: 'Drawn Blade Flourish', phrase: 'Let the road decide us.' },
  ],
  'sci-fi': [
    { movement: 'Zero-G Roll', phrase: 'Vacuum does not negotiate.' },
    {
      movement: 'Terminal Tap',
      phrase: 'I already patched this worse than you broke it.',
    },
    { movement: 'Airlock Brace', phrase: 'Depressurize and we both float.' },
    {
      movement: 'Coolant Pull',
      phrase: 'Give the reactor a minute or it gives us none.',
    },
  ],
  horror: [
    { movement: 'Head Tilt', phrase: 'It is already standing behind you.' },
    { movement: 'Candle Snuff', phrase: 'Blow it out and say my name.' },
    {
      movement: 'Slow Step Back',
      phrase: 'Do not follow me into the dark.',
    },
    {
      movement: 'Hand to Ear',
      phrase: 'Can you hear it too? It stopped when you spoke.',
    },
  ],
}

const histories = [
  'Raised on the frontier, they learned early that every promise has a price and most prices are collected late. They keep a ledger no one else has seen.',
  'Once a respected name in a city that has since burned, they carry the ashes without ceremony and answer to whatever remains of the title.',
  'They walked away from a life that would have fit and have spent the years since proving to no one in particular that it was the right call.',
  'A debt of honor they never named sent them on the road. They pay it in small, quiet ways and refuse to explain any of them.',
  'They survived something that was supposed to be fatal and treat the survival as an inconvenience rather than a miracle.',
  'Trained by someone who loved them and taught them badly, they are still untangling which lessons to keep.',
  'They have a reputation that arrives before them and, more often than not, overstates the truth.',
  'The last person they trusted is still alive, which everyone finds surprising and they find funny.',
  'They collect favors the way others collect coins, and they intend to spend every one.',
  'There is a version of their past that they tell strangers. They almost believe it themselves.',
]

// Deterministic index-based picks: cycling the pools rather than using
// randomness gives varied but stable-looking data and guarantees trait/sex
// spread across a batch.
const pick = <T>(pool: readonly T[], index: number): T =>
  pool[index % pool.length]

const indexToAge = (index: number): number => 19 + ((index * 7) % 47)

const indexToTraits = (index: number): [InputTrait, InputTrait, InputTrait] => {
  const count = cardTraits.length
  const offset = index * 3

  return [
    cardTraits[offset % count],
    cardTraits[(offset + 3) % count],
    cardTraits[(offset + 5) % count],
  ]
}

// Fixed epoch so repeated seeding produces recognizable, comparable data.
const makeTimestamp = (dayOffset: number): string =>
  new Date(Date.UTC(2026, 0, 1) + dayOffset * 86_400_000).toISOString()

function buildParty(index: number): Party {
  const themeCategory = themeCategories[index % themeCategories.length]
  const titles = partyTitlesByTheme[themeCategory]
  const round = Math.floor(index / themeCategories.length)
  const baseTitle = pick(titles, round)
  const title = round > 0 ? `${baseTitle} ${round + 1}` : baseTitle

  return {
    id: createId('party'),
    title,
    themeCategory,
    mood: pick(partyMoods, index),
    createdAt: makeTimestamp(index),
    updatedAt: makeTimestamp(index),
  }
}

function buildGenerated(
  themeCategory: ThemeCategory,
  name: string,
  traits: readonly [InputTrait, InputTrait, InputTrait],
  index: number,
): CharacterCardGenerated {
  const special = pick(specialsByTheme[themeCategory], index)

  return {
    generatedNameWithClass: `${name} the ${pick(classesByTheme[themeCategory], index)}`,
    backgroundHistory: pick(histories, index),
    characterTraits: [traits[0], traits[1], traits[2]],
    specialMovement: special.movement,
    specialPhrase: special.phrase,
  }
}

// Builds `perParty` cards for one party. Every fifth card carries a
// `basedOnCardId` sibling in the same `generationGroupId` so the details screen
// has version history to render.
function buildCardsForParty(
  party: Party,
  partyIndex: number,
  perParty: number,
): CharacterCard[] {
  const cards: CharacterCard[] = []

  for (let cardIndex = 0; cardIndex < perParty; cardIndex += 1) {
    const seed = partyIndex * 3 + cardIndex
    const sex = pick(sexOptions, seed)
    const name = `${pick(firstNames[sex], seed)} ${pick(surnames, seed)}`
    const traits = indexToTraits(seed)
    const input: CharacterCardInput = {
      name,
      sex,
      age: indexToAge(seed),
      selectedTraits: [traits[0], traits[1], traits[2]],
    }
    const generated = buildGenerated(party.themeCategory, name, traits, seed)
    const status: CardStatus = cardIndex % 3 === 0 ? 'accepted' : 'draft'
    const createdAt = makeTimestamp(cardIndex + 1)

    const card: CharacterCard = {
      id: createId('card'),
      partyId: party.id,
      status,
      input,
      generated,
      generationGroupId: createId('generation'),
      createdAt,
      updatedAt: createdAt,
    }

    if (cardIndex % 5 === 0 && perParty > 1) {
      const previous: CharacterCard = {
        ...card,
        id: createId('card'),
        status: 'draft',
        basedOnCardId: undefined,
        createdAt: makeTimestamp(cardIndex),
        updatedAt: makeTimestamp(cardIndex),
      }

      card.basedOnCardId = previous.id
      cards.push(previous)
    }

    cards.push(card)
  }

  return cards
}

// Both stores prepend, so the lists show the last-written entity first. Seeding
// oldest → newest and reversing the arrays lands the newest party and newest
// cards at the top, exactly like real usage.
export function generateDebugData(
  partyCount: number,
  cardsPerParty: number,
): DebugDataset {
  const parties: Party[] = []
  const cards: CharacterCard[] = []

  for (let partyIndex = 0; partyIndex < partyCount; partyIndex += 1) {
    const party = buildParty(partyIndex)

    parties.push(party)
    cards.push(...buildCardsForParty(party, partyIndex, cardsPerParty))
  }

  return {
    parties: [...parties].reverse(),
    cards: [...cards].reverse(),
  }
}

export function buildSmallDebugDataset(): DebugDataset {
  return generateDebugData(DEBUG_SMALL_PARTY_COUNT, DEBUG_SMALL_CARDS_PER_PARTY)
}

export function buildLargeDebugDataset(): DebugDataset {
  return generateDebugData(DEBUG_LARGE_PARTY_COUNT, DEBUG_LARGE_CARDS_PER_PARTY)
}
