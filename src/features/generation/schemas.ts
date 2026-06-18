import { z } from 'zod';

export const generatedCharacterCardSchema = z.object({
  generatedNameWithClass: z.string().trim().min(1),
  backgroundHistory: z.string().trim().min(1),
  characterTraits: z.tuple([
    z.string().trim().min(1),
    z.string().trim().min(1),
    z.string().trim().min(1),
  ]),
  specialMovement: z.string().trim().min(1),
  specialPhrase: z.string().trim().min(1),
});

export type GeneratedCharacterCardResult = z.infer<typeof generatedCharacterCardSchema>;

export const generatedCharacterCardJsonSchema = {
  type: 'object',
  properties: {
    generatedNameWithClass: {
      type: 'string',
      description: 'A creative title-like name for the character.',
    },
    backgroundHistory: {
      type: 'string',
      description: 'Exactly 2 short sentences describing the character background.',
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
  },
  required: [
    'generatedNameWithClass',
    'backgroundHistory',
    'characterTraits',
    'specialMovement',
    'specialPhrase',
  ],
} as const;
