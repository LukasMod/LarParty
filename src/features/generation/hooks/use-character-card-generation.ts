import { useRef, useState } from 'react'

import { generateCharacterCard } from '@/features/generation/gemini'
import { GenerateCharacterCardRequest } from '@/features/generation/types'
import { CharacterCardGenerated } from '@/features/cards/types'

interface GenerationOutcome {
  generated: CharacterCardGenerated | null
  cancelled: boolean
}

interface ActiveGeneration {
  controller: AbortController
  cancelled: boolean
}

export function useCharacterCardGeneration() {
  const activeRef = useRef<ActiveGeneration | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  async function start(
    request: Omit<GenerateCharacterCardRequest, 'signal'>,
  ): Promise<GenerationOutcome> {
    activeRef.current?.controller.abort()

    const active: ActiveGeneration = {
      controller: new AbortController(),
      cancelled: false,
    }

    activeRef.current = active
    setIsGenerating(true)

    try {
      const generated = await generateCharacterCard({
        ...request,
        signal: active.controller.signal,
      })

      return active.cancelled
        ? { generated: null, cancelled: true }
        : { generated, cancelled: false }
    } catch (error) {
      if (active.cancelled) {
        return { generated: null, cancelled: true }
      }

      throw error
    } finally {
      if (activeRef.current === active) {
        activeRef.current = null
        setIsGenerating(false)
      }
    }
  }

  function cancel() {
    if (!activeRef.current) {
      return
    }

    activeRef.current.cancelled = true
    activeRef.current.controller.abort()
    setIsGenerating(false)
  }

  return { isGenerating, start, cancel }
}
