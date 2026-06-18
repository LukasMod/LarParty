import { GoogleGenAI } from '@google/genai';

import { buildCharacterCardPrompt } from '@/features/generation/prompt';
import { generatedCharacterCardJsonSchema, generatedCharacterCardSchema } from '@/features/generation/schemas';
import { CharacterCardGenerator, GenerateCharacterCardRequest } from '@/features/generation/types';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

class GeminiCharacterCardGenerator implements CharacterCardGenerator {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(request: GenerateCharacterCardRequest) {
    const response = await this.client.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildCharacterCardPrompt(request),
      config: {
        responseMimeType: 'application/json',
        responseSchema: generatedCharacterCardJsonSchema,
      },
    });

    const rawText = response.text?.trim();

    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(rawText);
    } catch {
      throw new Error('Gemini returned invalid JSON.');
    }

    return generatedCharacterCardSchema.parse(parsedResponse);
  }
}

let generator: CharacterCardGenerator | null = null;

export function getCharacterCardGenerator() {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY environment variable.');
  }

  if (!generator) {
    generator = new GeminiCharacterCardGenerator(GEMINI_API_KEY);
  }

  return generator;
}

export async function generateCharacterCard(request: GenerateCharacterCardRequest) {
  return getCharacterCardGenerator().generate(request);
}
