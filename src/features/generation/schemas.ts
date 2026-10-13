import { z } from 'zod'

const characterCardFields = {
  generatedNameWithClass: z.string().trim().min(1),
  backgroundHistory: z.string().trim().min(1),
  characterTraits: z.tuple([
    z.string().trim().min(1),
    z.string().trim().min(1),
    z.string().trim().min(1),
  ]),
  specialMovement: z.string().trim().min(1),
  specialPhrase: z.string().trim().min(1),
}

export const generatedCharacterCardSchema = z.object(characterCardFields)

// The first card of a party also founds the shared world its `partyHistory`
// field carries. Later cards keep the card-only shape and receive the stored
// world instead.
export const characterCardWithWorldSchema = z.object({
  ...characterCardFields,
  partyHistory: z.string().trim().min(1),
})

export type GeneratedCharacterCardResult = z.infer<
  typeof generatedCharacterCardSchema
>

const characterCardJsonProperties = {
  generatedNameWithClass: {
    type: 'string',
    description: 'A creative title-like name for the character.',
  },
  backgroundHistory: {
    type: 'string',
    description:
      'Exactly 3 short sentences describing the character background.',
  },
  characterTraits: {
    type: 'array',
    description: 'Exactly 3 short trait phrases.',
    items: {
      type: 'string',
    },
    minItems: 3,
    maxItems: 3,
  },
  specialMovement: {
    type: 'string',
    description: 'A fun movement or gesture for the player to use.',
  },
  specialPhrase: {
    type: 'string',
    description: 'A short in-character phrase the player can say.',
  },
}

const characterCardJsonRequired = [
  'generatedNameWithClass',
  'backgroundHistory',
  'characterTraits',
  'specialMovement',
  'specialPhrase',
] as const

export const generatedCharacterCardJsonSchema = {
  type: 'object',
  properties: characterCardJsonProperties,
  required: [...characterCardJsonRequired],
} as const

export const characterCardWithWorldJsonSchema = {
  type: 'object',
  properties: {
    ...characterCardJsonProperties,
    partyHistory: {
      type: 'string',
      description:
        'Exactly 2-3 short sentences founding the shared world every guest at this party inhabits.',
    },
  },
  required: [...characterCardJsonRequired, 'partyHistory'],
} as const
