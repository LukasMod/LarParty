// Generation and other async handlers surface the real message when the thrown
// value carries one, and a translated fallback otherwise. Non-Error throws
// (strings, undefined, API SDK shapes) must not crash the catch block.
export function resolveErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}
