export function normalizePartyTitle(title: string) {
  return title.trim()
}

// A blank title blocks creation. Whitespace-only counts as blank.
export function isPartyTitleValid(title: string) {
  return Boolean(normalizePartyTitle(title))
}

// The error only disappears while it is showing and the user has typed
// something usable, so the first submit on an empty field still surfaces it.
export function shouldClearPartyTitleError(
  showValidationError: boolean,
  title: string,
) {
  return showValidationError && isPartyTitleValid(title)
}
