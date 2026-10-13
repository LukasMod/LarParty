import { GoogleGenAI } from '@google/genai'

import { buildCharacterCardPrompt } from '@/features/generation/prompt'
import {
  characterCardWithWorldJsonSchema,
  characterCardWithWorldSchema,
  generatedCharacterCardJsonSchema,
  generatedCharacterCardSchema,
} from '@/features/generation/schemas'
import {
  CharacterCardGenerator,
  GenerateCharacterCardRequest,
} from '@/features/generation/types'
import { hasPartyWorld } from '@/features/generation/utils/party-world'

const GEMINI_MODEL = 'gemini-3.6-flash-lite'

// Character cards are creative text, so sampling stays off the predictable peak of the
// distribution. Low temperature returns near-identical cards for the same seed.
const GEMINI_TEMPERATURE = 1.15
const GEMINI_TOP_P = 0.95
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY

// The API can answer with whitespace, an error string as plain text, or JSON
// that does not match the requested schema. Each case gets its own message so
// a failure in the log says which stage broke. `withWorld` parses the first
// card's answer, which also carries the party's founding `partyHistory`.
export function parseGeneratedCardResponse(
  rawText: string | undefined,
  withWorld = false,
) {
  const trimmed = rawText?.trim()

  if (!trimmed) {
    throw new Error('Gemini returned an empty response.')
  }

  let parsedResponse: unknown

  try {
    parsedResponse = JSON.parse(trimmed)
  } catch {
    throw new Error('Gemini returned invalid JSON.')
  }

  return withWorld
    ? characterCardWithWorldSchema.parse(parsedResponse)
    : generatedCharacterCardSchema.parse(parsedResponse)
}

class GeminiCharacterCardGenerator implements CharacterCardGenerator {
  private client: GoogleGenAI

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey })
  }

  async generate(request: GenerateCharacterCardRequest) {
    const withWorld = !hasPartyWorld(request.partyHistory)

    const response = await this.client.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildCharacterCardPrompt(request),
      config: {
        responseMimeType: 'application/json',
        responseSchema: withWorld
          ? characterCardWithWorldJsonSchema
          : generatedCharacterCardJsonSchema,
        temperature: GEMINI_TEMPERATURE,
        topP: GEMINI_TOP_P,
        abortSignal: request.signal,
      },
    })

    return parseGeneratedCardResponse(response.text, withWorld)
  }
}

let generator: CharacterCardGenerator | null = null

export function getCharacterCardGenerator() {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY environment variable.')
  }

  if (!generator) {
    generator = new GeminiCharacterCardGenerator(GEMINI_API_KEY)
  }

  return generator
}

export async function generateCharacterCard(
  request: GenerateCharacterCardRequest,
) {
  return getCharacterCardGenerator().generate(request)
}
