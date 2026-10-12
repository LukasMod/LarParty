import { act, renderHook } from '@testing-library/react-native'

import { CharacterCardGenerated } from '@/features/cards/types'
import { generateCharacterCard } from '@/features/generation/gemini'
import { useCharacterCardGeneration } from '@/features/generation/hooks/use-character-card-generation'
import { makeCardInput, makeGenerated, makeParty } from '@test/factories'

jest.mock('@/features/generation/gemini', () => ({
  generateCharacterCard: jest.fn(),
}))

const mockedGenerate = generateCharacterCard as jest.MockedFunction<
  typeof generateCharacterCard
>

interface GenerationOutcome {
  generated: CharacterCardGenerated | null
  cancelled: boolean
}

const request = {
  party: makeParty(),
  input: makeCardInput(),
  outputLanguage: 'en' as const,
}

function deferred() {
  let resolve!: (value: CharacterCardGenerated) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<CharacterCardGenerated>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

beforeEach(() => {
  mockedGenerate.mockReset()
})

describe('useCharacterCardGeneration', () => {
  it('returns the generated card and clears the flag', async () => {
    const generated = makeGenerated()
    mockedGenerate.mockResolvedValue(generated)

    const { result } = await renderHook(() => useCharacterCardGeneration())

    expect(result.current.isGenerating).toBe(false)

    let outcome!: GenerationOutcome

    await act(async () => {
      outcome = await result.current.start(request)
    })

    expect(outcome).toEqual({ generated, cancelled: false })
    expect(result.current.isGenerating).toBe(false)
  })

  it('forwards the output language and an abort signal', async () => {
    mockedGenerate.mockResolvedValue(makeGenerated())

    const { result } = await renderHook(() => useCharacterCardGeneration())

    await act(async () => {
      await result.current.start(request)
    })

    const passed = mockedGenerate.mock.calls[0][0]

    expect(passed.outputLanguage).toBe('en')
    expect(passed.signal).toBeInstanceOf(AbortSignal)
  })

  it('marks a cancelled generation instead of returning data', async () => {
    const pending = deferred()
    mockedGenerate.mockReturnValue(pending.promise)

    const { result } = await renderHook(() => useCharacterCardGeneration())
    let started!: Promise<GenerationOutcome>

    await act(async () => {
      started = result.current.start(request)
    })
    await act(async () => {
      result.current.cancel()
    })
    await act(async () => {
      pending.resolve(makeGenerated())
      await expect(started).resolves.toEqual({
        generated: null,
        cancelled: true,
      })
    })
  })

  it('reports the generating flag while a request is in flight', async () => {
    const pending = deferred()
    mockedGenerate.mockReturnValue(pending.promise)

    const { result } = await renderHook(() => useCharacterCardGeneration())
    let started!: Promise<GenerationOutcome>

    await act(async () => {
      started = result.current.start(request)
    })

    expect(result.current.isGenerating).toBe(true)

    await act(async () => {
      result.current.cancel()
    })

    expect(result.current.isGenerating).toBe(false)

    await act(async () => {
      pending.resolve(makeGenerated())
      await started
    })
  })

  it('aborts the previous request when a second starts', async () => {
    const first = deferred()
    const second = deferred()
    mockedGenerate
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)

    const { result } = await renderHook(() => useCharacterCardGeneration())
    let firstRun!: Promise<GenerationOutcome>
    let secondRun!: Promise<GenerationOutcome>

    await act(async () => {
      firstRun = result.current.start(request)
      secondRun = result.current.start(request)
    })

    const firstSignal = mockedGenerate.mock.calls[0][0].signal as AbortSignal
    const secondSignal = mockedGenerate.mock.calls[1][0].signal as AbortSignal

    expect(firstSignal.aborted).toBe(true)
    expect(secondSignal.aborted).toBe(false)

    await act(async () => {
      first.resolve(makeGenerated())
      second.resolve(makeGenerated())
      await Promise.all([firstRun, secondRun])
    })
  })

  // Only `cancel()` sets the cancelled flag, so a request superseded by a second
  // `start()` is treated as a normal completion by its own caller. Reachable today
  // only when two screens generate at once; the overlay blocks a second tap in one
  // form. See architecture "Dead code and hazards".
  it('reports a superseded request as a normal completion, not cancelled', async () => {
    const first = deferred()
    const second = deferred()
    mockedGenerate
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)

    const { result } = await renderHook(() => useCharacterCardGeneration())
    let firstRun!: Promise<GenerationOutcome>

    await act(async () => {
      firstRun = result.current.start(request)
      result.current.start(request)
    })

    const superseded = makeGenerated({ specialPhrase: 'first wins' })

    await act(async () => {
      first.resolve(superseded)
      second.resolve(makeGenerated())
      await expect(firstRun).resolves.toEqual({
        generated: superseded,
        cancelled: false,
      })
    })
  })

  it('rethrows the abort error of a superseded request that rejects', async () => {
    const first = deferred()
    const second = deferred()
    mockedGenerate
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)

    const { result } = await renderHook(() => useCharacterCardGeneration())
    let firstRun!: Promise<GenerationOutcome>
    let secondRun!: Promise<GenerationOutcome>

    await act(async () => {
      firstRun = result.current.start(request)
      secondRun = result.current.start(request)
    })

    await act(async () => {
      first.reject(new Error('The user aborted a request.'))
      second.resolve(makeGenerated())
      await expect(firstRun).rejects.toThrow('The user aborted a request.')
      await secondRun
    })
  })

  // The caller relies on the throw to show an error and on the flag clearing so
  // the blocking overlay can close.
  it('rethrows a provider failure and clears the flag', async () => {
    mockedGenerate.mockRejectedValue(new Error('Gemini returned invalid JSON.'))

    const { result } = await renderHook(() => useCharacterCardGeneration())

    await act(async () => {
      await expect(result.current.start(request)).rejects.toThrow(
        'Gemini returned invalid JSON.',
      )
    })

    expect(result.current.isGenerating).toBe(false)
  })

  it('reports cancelled rather than rethrowing when an aborted request rejects', async () => {
    const pending = deferred()
    mockedGenerate.mockReturnValue(pending.promise)

    const { result } = await renderHook(() => useCharacterCardGeneration())
    let started!: Promise<GenerationOutcome>

    await act(async () => {
      started = result.current.start(request)
    })
    await act(async () => {
      result.current.cancel()
    })
    await act(async () => {
      pending.reject(new Error('AbortError'))
      await expect(started).resolves.toEqual({
        generated: null,
        cancelled: true,
      })
    })
  })

  it('cancel with nothing in flight does nothing', async () => {
    const { result } = await renderHook(() => useCharacterCardGeneration())

    await act(async () => {
      result.current.cancel()
    })

    expect(result.current.isGenerating).toBe(false)
  })

  it('keeps a superseded request from clearing the active request flag', async () => {
    const first = deferred()
    const second = deferred()
    mockedGenerate
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)

    const { result } = await renderHook(() => useCharacterCardGeneration())
    let firstRun!: Promise<GenerationOutcome>
    let secondRun!: Promise<GenerationOutcome>

    await act(async () => {
      firstRun = result.current.start(request)
      secondRun = result.current.start(request)
    })

    await act(async () => {
      first.resolve(makeGenerated())
      await firstRun
    })

    expect(result.current.isGenerating).toBe(true)

    await act(async () => {
      second.resolve(makeGenerated())
      await secondRun
    })

    expect(result.current.isGenerating).toBe(false)
  })
})
